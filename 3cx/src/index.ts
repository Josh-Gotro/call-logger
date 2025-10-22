/**
 * 3CX Integration Application Entry Point
 */

import dotenv from 'dotenv';
import cron from 'node-cron';
import express from 'express';
import logger from './utils/logger.js';
import loadConfig from './config/config-loader.js';
import ApiClient from './services/api-client.js';
import CdrPoller from './services/cdr-poller.js';
import ExtensionMapper from './services/extension-mapper.js';
import BusinessHoursService from './services/business-hours.js';
import CallGroupMonitor from './services/call-group-monitor.js';
import { CdrRecord } from './types/pbx.types.js';
import { PbxCallRequest } from './types/api.types.js';

// Load environment variables
dotenv.config();

class ThreeCXIntegration {
  private apiClient!: ApiClient;
  private cdrPoller!: CdrPoller;
  private extensionMapper!: ExtensionMapper;
  private businessHours!: BusinessHoursService;
  private callGroupMonitor!: CallGroupMonitor;
  private app: express.Application;
  private pollingJob?: cron.ScheduledTask;
  private alertJob?: cron.ScheduledTask;

  constructor() {
    this.app = express();
    this.app.use(express.json());
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    logger.info('Initializing 3CX Integration Application...');

    try {
      // Load configuration
      const config = loadConfig();

      // Initialize services
      this.apiClient = new ApiClient(config.api);
      this.cdrPoller = new CdrPoller(config.threecx.cdr_database);
      this.extensionMapper = new ExtensionMapper(config.extensionMapping);
      this.businessHours = new BusinessHoursService(config.businessHours);
      this.callGroupMonitor = new CallGroupMonitor(
        config.callGroups,
        this.businessHours,
        this.apiClient
      );

      // Connect to CDR database
      await this.cdrPoller.connect();

      // Test CDR connection
      const cdrConnected = await this.cdrPoller.testConnection();
      if (!cdrConnected) {
        throw new Error('Failed to connect to CDR database');
      }

      // Test API connection
      const apiHealthy = await this.apiClient.healthCheck();
      if (!apiHealthy) {
        logger.warn('API health check failed, but continuing (will retry on calls)');
      }

      // Set up HTTP endpoints
      this.setupRoutes();

      logger.info('All services initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize application', { error });
      throw error;
    }
  }

  /**
   * Set up HTTP routes for health checks and monitoring
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          cdrPoller: 'connected',
          apiClient: 'ok',
        },
      });
    });

    // Status endpoint
    this.app.get('/status', (req, res) => {
      res.json({
        lastProcessedCdrId: this.cdrPoller.getLastProcessedId(),
        businessHours: this.businessHours.isBusinessHours(),
        monitoredGroups: this.callGroupMonitor.getMonitoredGroups(),
        uptime: process.uptime(),
      });
    });

    // Manual trigger endpoint (for testing)
    this.app.post('/trigger/poll', async (req, res) => {
      try {
        logger.info('Manual poll triggered');
        await this.processCdrRecords();
        res.json({ success: true, message: 'Poll completed' });
      } catch (error) {
        logger.error('Manual poll failed', { error });
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    // Manual call group check trigger
    this.app.post('/trigger/alerts', async (req, res) => {
      try {
        logger.info('Manual alert check triggered');
        await this.callGroupMonitor.checkCallGroups();
        res.json({ success: true, message: 'Alert check completed' });
      } catch (error) {
        logger.error('Manual alert check failed', { error });
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });
  }

  /**
   * Start scheduled jobs
   */
  startScheduledJobs(): void {
    logger.info('Starting scheduled jobs...');

    // CDR polling job (every 30 seconds by default)
    const pollingInterval = process.env.POLLING_INTERVAL_SECONDS || '30';
    this.pollingJob = cron.schedule(`*/${pollingInterval} * * * * *`, async () => {
      try {
        await this.processCdrRecords();
      } catch (error) {
        logger.error('CDR polling job failed', { error });
      }
    });

    // Call group alert job (every 5 minutes by default, only during business hours)
    const alertInterval = process.env.ALERT_CHECK_INTERVAL_MINUTES || '5';
    this.alertJob = cron.schedule(`*/${alertInterval} * * * *`, async () => {
      try {
        await this.callGroupMonitor.checkCallGroups();
      } catch (error) {
        logger.error('Call group alert job failed', { error });
      }
    });

    logger.info('Scheduled jobs started', {
      pollingInterval: `${pollingInterval}s`,
      alertInterval: `${alertInterval}m`,
    });
  }

  /**
   * Process CDR records from database
   */
  private async processCdrRecords(): Promise<void> {
    try {
      const records = await this.cdrPoller.pollNewRecords();

      if (records.length === 0) {
        return;
      }

      logger.info(`Processing ${records.length} new CDR records`);

      for (const record of records) {
        await this.processCdrRecord(record);
      }

      logger.info(`Processed ${records.length} CDR records successfully`);
    } catch (error) {
      logger.error('Failed to process CDR records', { error });
      throw error;
    }
  }

  /**
   * Process a single CDR record
   */
  private async processCdrRecord(record: CdrRecord): Promise<void> {
    try {
      logger.debug('Processing CDR record', {
        callId: record.callId,
        phoneNumber: record.phoneNumber,
        extension: record.extension,
      });

      // Skip if not answered
      if (!record.answered) {
        logger.debug('Skipping unanswered call', { callId: record.callId });
        return;
      }

      // Map extension to email
      const email = this.extensionMapper.getEmail(record.extension);

      if (!email) {
        logger.warn('No email mapping for extension, skipping call', {
          extension: record.extension,
          callId: record.callId,
        });
        return;
      }

      // Create PBX call request
      const pbxCallRequest: PbxCallRequest = {
        phoneNumber: record.phoneNumber,
        callDuration: record.duration,
        callOwnerExtension: record.extension,
        callOwnerEmail: email,
        callDirection: record.callDirection,
        callGroupId: record.callGroupId,
        timestamp: record.endTime.toISOString(),
        pbxCallId: record.callId,
      };

      // Submit to API
      await this.apiClient.submitPbxCall(pbxCallRequest);

      logger.info('CDR record processed and submitted to API', {
        callId: record.callId,
        extension: record.extension,
        email,
      });
    } catch (error) {
      logger.error('Failed to process CDR record', {
        callId: record.callId,
        error: (error as Error).message,
      });
      // Don't throw - continue processing other records
    }
  }

  /**
   * Start the application
   */
  async start(): Promise<void> {
    const port = process.env.PORT || 3000;

    // Start HTTP server
    this.app.listen(port, () => {
      logger.info(`3CX Integration server listening on port ${port}`);
    });

    // Start scheduled jobs
    this.startScheduledJobs();

    logger.info('3CX Integration Application started successfully');
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down 3CX Integration Application...');

    // Stop scheduled jobs
    if (this.pollingJob) {
      this.pollingJob.stop();
    }
    if (this.alertJob) {
      this.alertJob.stop();
    }

    // Disconnect from CDR database
    await this.cdrPoller.disconnect();

    logger.info('Application shut down successfully');
    process.exit(0);
  }
}

// Main execution
const app = new ThreeCXIntegration();

app
  .initialize()
  .then(() => app.start())
  .catch((error) => {
    logger.error('Failed to start application', { error });
    process.exit(1);
  });

// Handle graceful shutdown
process.on('SIGTERM', () => app.shutdown());
process.on('SIGINT', () => app.shutdown());

export default ThreeCXIntegration;

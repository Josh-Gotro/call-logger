/**
 * CDR database polling service for 3CX call records
 */

import sql from 'mssql';
import { DatabaseConfig } from '../types/config.types.js';
import { CdrRecord } from '../types/pbx.types.js';
import logger from '../utils/logger.js';

export class CdrPoller {
  private config: sql.config;
  private pool: sql.ConnectionPool | null = null;
  private lastProcessedId: string | null = null;

  constructor(dbConfig: DatabaseConfig) {
    this.config = {
      server: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.username,
      password: dbConfig.password,
      options: {
        encrypt: false, // Set to true if using Azure SQL
        trustServerCertificate: true,
        enableArithAbort: true,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    };

    logger.info('CDR poller initialized', {
      server: dbConfig.host,
      database: dbConfig.database,
    });
  }

  /**
   * Connect to the CDR database
   */
  async connect(): Promise<void> {
    try {
      logger.info('Connecting to CDR database...');
      this.pool = await new sql.ConnectionPool(this.config).connect();
      logger.info('Connected to CDR database successfully');
    } catch (error) {
      logger.error('Failed to connect to CDR database', { error });
      throw error;
    }
  }

  /**
   * Disconnect from the CDR database
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
      logger.info('Disconnected from CDR database');
    }
  }

  /**
   * Poll for new CDR records since last check
   *
   * Note: This is a generic implementation. The actual 3CX CDR schema
   * may vary depending on the 3CX version. You'll need to adjust the
   * query and field mappings based on your specific 3CX installation.
   */
  async pollNewRecords(): Promise<CdrRecord[]> {
    if (!this.pool) {
      throw new Error('CDR database not connected');
    }

    try {
      logger.debug('Polling for new CDR records', { lastProcessedId: this.lastProcessedId });

      const query = `
        SELECT TOP 100
          Id,
          CallId,
          StartTime,
          EndTime,
          Duration,
          CallerNumber,
          DestNumber,
          Extension,
          CallType,
          SegmentStart,
          SegmentEnd,
          Answered,
          HangupCause
        FROM CallLog
        WHERE ${this.lastProcessedId ? 'Id > @lastId AND' : ''}
          EndTime IS NOT NULL
          AND Duration > 0
        ORDER BY Id ASC
      `;

      const request = this.pool.request();
      if (this.lastProcessedId) {
        request.input('lastId', sql.VarChar, this.lastProcessedId);
      }

      const result = await request.query(query);
      const records = result.recordset.map(row => this.mapCdrRecord(row));

      if (records.length > 0) {
        this.lastProcessedId = records[records.length - 1].id;
        logger.info('Found new CDR records', { count: records.length });
      } else {
        logger.debug('No new CDR records found');
      }

      return records;
    } catch (error) {
      logger.error('Failed to poll CDR records', { error });
      throw error;
    }
  }

  /**
   * Map database row to CdrRecord type
   * Adjust field mappings based on actual 3CX CDR schema
   */
  private mapCdrRecord(row: any): CdrRecord {
    // Determine call direction based on CallType or other fields
    const callDirection = this.determineCallDirection(row);

    // Extract phone number (caller or destination based on direction)
    const phoneNumber = callDirection === 'INBOUND'
      ? row.CallerNumber
      : row.DestNumber;

    return {
      id: row.Id.toString(),
      callId: row.CallId || row.Id.toString(),
      startTime: new Date(row.StartTime),
      endTime: new Date(row.EndTime),
      duration: row.Duration || 0,
      phoneNumber: this.cleanPhoneNumber(phoneNumber),
      extension: row.Extension || '',
      callDirection,
      answered: row.Answered === 1 || row.Answered === true,
      hangupCause: row.HangupCause,
    };
  }

  /**
   * Determine call direction from CDR record
   * This logic may need adjustment based on 3CX CDR schema
   */
  private determineCallDirection(row: any): 'INBOUND' | 'OUTBOUND' {
    // Common 3CX call types:
    // 0 = Inbound, 1 = Outbound, 2 = Internal
    if (row.CallType === 0) return 'INBOUND';
    if (row.CallType === 1) return 'OUTBOUND';

    // Fallback: check if caller is external
    const callerIsExternal = !this.isInternalNumber(row.CallerNumber);
    return callerIsExternal ? 'INBOUND' : 'OUTBOUND';
  }

  /**
   * Check if a number is internal (extension)
   */
  private isInternalNumber(number: string): boolean {
    if (!number) return false;
    // Adjust this logic based on your extension numbering scheme
    // Example: 3-4 digit extensions
    return /^\d{3,4}$/.test(number);
  }

  /**
   * Clean and normalize phone number
   */
  private cleanPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return '';

    // Remove common prefixes and formatting
    return phoneNumber
      .replace(/^\+/, '')
      .replace(/[^\d]/g, '')
      .trim();
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.pool) {
        await this.connect();
      }
      const result = await this.pool!.request().query('SELECT 1 AS test');
      logger.info('CDR database connection test successful');
      return result.recordset.length > 0;
    } catch (error) {
      logger.error('CDR database connection test failed', { error });
      return false;
    }
  }

  /**
   * Reset last processed ID (for testing or reprocessing)
   */
  resetLastProcessedId(): void {
    logger.warn('Resetting last processed CDR ID');
    this.lastProcessedId = null;
  }

  /**
   * Get last processed ID
   */
  getLastProcessedId(): string | null {
    return this.lastProcessedId;
  }
}

export default CdrPoller;

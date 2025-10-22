/**
 * HTTP client for main backend API with retry logic
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiConfig } from '../types/config.types.js';
import {
  PbxCallRequest,
  CallEntryResponse,
  CallGroupAlertRequest,
  CallGroupAlertResponse,
  ApiErrorResponse,
} from '../types/api.types.js';
import logger from '../utils/logger.js';

export class ApiClient {
  private client: AxiosInstance;
  private retryAttempts: number;

  constructor(config: ApiConfig) {
    this.client = axios.create({
      baseURL: config.base_url,
      timeout: config.timeout_seconds * 1000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.retryAttempts = config.retry_attempts;

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('API request successful', {
          method: response.config.method,
          url: response.config.url,
          status: response.status,
        });
        return response;
      },
      (error) => {
        logger.error('API request failed', {
          method: error.config?.method,
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Submit PBX call data to backend
   */
  async submitPbxCall(callData: PbxCallRequest): Promise<CallEntryResponse> {
    logger.info('Submitting PBX call to API', { pbxCallId: callData.pbxCallId });

    return this.executeWithRetry(async () => {
      const response = await this.client.post<CallEntryResponse>('/calls/from-pbx', callData);
      logger.info('PBX call submitted successfully', {
        pbxCallId: callData.pbxCallId,
        callEntryId: response.data.id,
      });
      return response.data;
    });
  }

  /**
   * Submit call group alert to backend
   */
  async submitCallGroupAlert(alertData: CallGroupAlertRequest): Promise<CallGroupAlertResponse> {
    logger.info('Submitting call group alert to API', {
      callGroupId: alertData.callGroupId,
      alertType: alertData.alertType,
    });

    return this.executeWithRetry(async () => {
      const response = await this.client.post<CallGroupAlertResponse>(
        '/alerts/call-groups',
        alertData
      );
      logger.info('Call group alert submitted successfully', {
        callGroupId: alertData.callGroupId,
        alertId: response.data.id,
      });
      return response.data;
    });
  }

  /**
   * Get active call group alerts
   */
  async getActiveAlerts(): Promise<CallGroupAlertResponse[]> {
    logger.debug('Fetching active call group alerts');

    return this.executeWithRetry(async () => {
      const response = await this.client.get<CallGroupAlertResponse[]>('/alerts/call-groups', {
        params: { active: true },
      });
      logger.debug('Active alerts fetched', { count: response.data.length });
      return response.data;
    });
  }

  /**
   * Execute API call with exponential backoff retry logic
   */
  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          if (axiosError.response && axiosError.response.status >= 400 && axiosError.response.status < 500) {
            logger.error('Client error, not retrying', {
              status: axiosError.response.status,
              message: axiosError.response.data?.message,
            });
            throw error;
          }
        }

        if (attempt < this.retryAttempts) {
          const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          logger.warn(`API call failed, retrying in ${delayMs}ms`, {
            attempt,
            maxAttempts: this.retryAttempts,
            error: (error as Error).message,
          });
          await this.sleep(delayMs);
        }
      }
    }

    logger.error('API call failed after all retry attempts', {
      attempts: this.retryAttempts,
      error: lastError?.message,
    });
    throw lastError;
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch (error) {
      logger.error('Health check failed', { error: (error as Error).message });
      return false;
    }
  }
}

export default ApiClient;

import { apiClient, extractData } from '../lib/api-client';
import {
  CallEntry,
  StartCallRequest,
  UpdateCallRequest,
  PaginatedResponse,
} from '../types/api.types';

// Call Management API Functions

export const callsApi = {
  // Start a new call
  startCall: (request: StartCallRequest): Promise<CallEntry> =>
    apiClient.post('/calls/start', request).then(extractData),

  // End an active call
  endCall: (callId: string): Promise<CallEntry> =>
    apiClient.put(`/calls/${callId}/end`).then(extractData),

  // Update call details
  updateCall: (callId: string, request: UpdateCallRequest): Promise<CallEntry> =>
    apiClient.put(`/calls/${callId}`, request).then(extractData),

  // Get call by ID
  getCall: (callId: string): Promise<CallEntry> =>
    apiClient.get(`/calls/${callId}`).then(extractData),

  // Get user's active call
  getUserActiveCall: (userEmail: string): Promise<CallEntry | null> =>
    apiClient
      .get(`/calls/user/${userEmail}/active`)
      .then(extractData)
      .catch((error) => {
        // Return null if no active call (204 No Content)
        if (error?.status === 204) {
          return null;
        }
        throw error;
      }),

  // Get user's call history with pagination
  getUserCalls: (
    userEmail: string,
    page = 0,
    size = 20,
    sort = 'startTime,desc'
  ): Promise<PaginatedResponse<CallEntry>> =>
    apiClient
      .get(`/calls/user/${userEmail}`, {
        params: { page, size, sort },
      })
      .then(extractData),

  // Get calls with filters
  getFilteredCalls: (filters: {
    userEmail?: string;
    programParentId?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PaginatedResponse<CallEntry>> => {
    const { page = 0, size = 20, sort = 'start_time,desc', ...queryFilters } = filters;
    return apiClient
      .get('/calls/filtered', {
        params: { ...queryFilters, page, size, sort },
      })
      .then(extractData);
  },

  // Get calls within date range
  getCallsByDateRange: (startDate: string, endDate: string): Promise<CallEntry[]> =>
    apiClient
      .get('/calls/date-range', {
        params: { startDate, endDate },
      })
      .then(extractData),
};
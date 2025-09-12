import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callsApi } from '../api/calls.api';
import { queryKeys } from '../lib/query-client';
import { StartCallRequest, UpdateCallRequest } from '../types/api.types';

// Query Hooks for Call Management

// Get user's active call
export const useActiveCall = (userEmail: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.calls.active(userEmail),
    queryFn: () => callsApi.getUserActiveCall(userEmail),
    enabled: enabled && !!userEmail,
    refetchInterval: 30000, // Refetch every 30 seconds to keep status fresh
  });
};

// Get specific call by ID
export const useCall = (callId: string) => {
  return useQuery({
    queryKey: queryKeys.calls.detail(callId),
    queryFn: () => callsApi.getCall(callId),
    enabled: !!callId,
  });
};

// Get user's call history
export const useUserCalls = (
  userEmail: string,
  page = 0,
  size = 20,
  sort = 'startTime,desc'
) => {
  return useQuery({
    queryKey: queryKeys.calls.list({ userEmail, page, size, sort }),
    queryFn: () => callsApi.getUserCalls(userEmail, page, size, sort),
    enabled: !!userEmail,
  });
};

// Get filtered calls
export const useFilteredCalls = (filters: {
  userEmail?: string;
  taskId?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.calls.list(filters),
    queryFn: () => callsApi.getFilteredCalls(filters),
  });
};

// Get today's calls for statistics
export const useTodaysCalls = (userEmail: string) => {
  // Get current date in Alaska timezone
  const now = new Date();
  
  // Create a date object representing "today" in Alaska timezone
  // We'll use the current UTC time and adjust to Alaska time to find the date boundaries
  const alaskaDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Anchorage' }));
  
  // Get the year, month, day in Alaska timezone
  const year = alaskaDate.getFullYear();
  const month = alaskaDate.getMonth(); // 0-based
  const day = alaskaDate.getDate();
  
  // Create start of day (midnight) and end of day in Alaska timezone
  // Then convert to UTC for the API call
  const startOfDayAlaska = new Date(year, month, day, 0, 0, 0, 0);
  const endOfDayAlaska = new Date(year, month, day, 23, 59, 59, 999);
  
  // Get the timezone offset for Alaska (in minutes)
  const alaskaOffset = new Date().toLocaleString('en-US', { 
    timeZone: 'America/Anchorage',
    timeZoneName: 'longOffset'
  }).match(/GMT([+-]\d{1,2}):?(\d{2})?/)?.[0] || 'GMT-09:00';
  
  // Convert Alaska times to UTC by adding the offset
  const offsetMatch = alaskaOffset.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
  const offsetSign = offsetMatch?.[1] === '+' ? 1 : -1;
  const offsetHours = parseInt(offsetMatch?.[2] || '9');
  const offsetMinutes = parseInt(offsetMatch?.[3] || '0');
  const totalOffsetMs = offsetSign * (offsetHours * 60 + offsetMinutes) * 60 * 1000;
  
  // Adjust Alaska times to UTC
  const startDate = new Date(startOfDayAlaska.getTime() - totalOffsetMs).toISOString();
  const endDate = new Date(endOfDayAlaska.getTime() - totalOffsetMs).toISOString();
  
  return useQuery({
    queryKey: queryKeys.calls.today(userEmail),
    queryFn: () => callsApi.getFilteredCalls({
      userEmail,
      startDate,
      endDate,
      size: 1000, // Large size to get all calls for the day
    }),
    enabled: !!userEmail,
  });
};

// Get today's recent calls (last 5 from today only)
export const useTodaysRecentCalls = (userEmail: string) => {
  // Get current date in Alaska timezone
  const now = new Date();
  
  // Create a date object representing "today" in Alaska timezone
  const alaskaDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Anchorage' }));
  
  // Get the year, month, day in Alaska timezone
  const year = alaskaDate.getFullYear();
  const month = alaskaDate.getMonth(); // 0-based
  const day = alaskaDate.getDate();
  
  // Create start of day (midnight) and end of day in Alaska timezone
  const startOfDayAlaska = new Date(year, month, day, 0, 0, 0, 0);
  const endOfDayAlaska = new Date(year, month, day, 23, 59, 59, 999);
  
  // Get the timezone offset for Alaska (in minutes)
  const alaskaOffset = new Date().toLocaleString('en-US', { 
    timeZone: 'America/Anchorage',
    timeZoneName: 'longOffset'
  }).match(/GMT([+-]\d{1,2}):?(\d{2})?/)?.[0] || 'GMT-09:00';
  
  // Convert Alaska times to UTC by adding the offset
  const offsetMatch = alaskaOffset.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
  const offsetSign = offsetMatch?.[1] === '+' ? 1 : -1;
  const offsetHours = parseInt(offsetMatch?.[2] || '9');
  const offsetMinutes = parseInt(offsetMatch?.[3] || '0');
  const totalOffsetMs = offsetSign * (offsetHours * 60 + offsetMinutes) * 60 * 1000;
  
  // Adjust Alaska times to UTC
  const startDate = new Date(startOfDayAlaska.getTime() - totalOffsetMs).toISOString();
  const endDate = new Date(endOfDayAlaska.getTime() - totalOffsetMs).toISOString();
  
  return useQuery({
    queryKey: [...queryKeys.calls.list({ userEmail }), 'todayRecent'],
    queryFn: () => callsApi.getFilteredCalls({
      userEmail,
      startDate,
      endDate,
      size: 5,
      sort: 'startTime,desc',
    }),
    enabled: !!userEmail,
  });
};

// Mutation Hooks

// Start a new call
export const useStartCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: StartCallRequest) => callsApi.startCall(request),
    onSuccess: (data) => {
      // Immediately set the active call data in cache
      queryClient.setQueryData(
        queryKeys.calls.active(data.datatechEmail),
        data
      );
      
      // Also invalidate the calls list
      queryClient.invalidateQueries({
        queryKey: queryKeys.calls.lists(),
      });
    },
  });
};

// End a call
export const useEndCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (callId: string) => callsApi.endCall(callId),
    onSuccess: (data) => {
      // Invalidate active call query
      queryClient.invalidateQueries({
        queryKey: queryKeys.calls.active(data.datatechEmail),
      });
      // Invalidate specific call detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.calls.detail(data.id),
      });
      // Invalidate calls list
      queryClient.invalidateQueries({
        queryKey: queryKeys.calls.lists(),
      });
    },
  });
};

// Update a call
export const useUpdateCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ callId, request }: { callId: string; request: UpdateCallRequest }) =>
      callsApi.updateCall(callId, request),
    onSuccess: (data) => {
      // Update the specific call in cache
      queryClient.setQueryData(queryKeys.calls.detail(data.id), data);
      // Also invalidate lists to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.calls.lists(),
      });
    },
  });
};
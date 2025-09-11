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
  programParentId?: string;
  categoryId?: string;
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
  const today = new Date();
  // Set to start of day in local timezone, then convert to ISO string
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  // Set to end of day in local timezone, then convert to ISO string
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  
  const startDate = startOfDay.toISOString(); // Full OffsetDateTime format
  const endDate = endOfDay.toISOString(); // Full OffsetDateTime format
  
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
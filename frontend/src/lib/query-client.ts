import { QueryClient } from '@tanstack/react-query';

// Configure React Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long until data is considered stale
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time: how long to keep unused data in cache
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Refetch on window focus (good for keeping data fresh)
      refetchOnWindowFocus: true,
      
      // Don't refetch on reconnect by default
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry configuration for mutations
      retry: false, // Don't retry mutations by default
    },
  },
});

// Query key factory for consistent key generation
export const queryKeys = {
  all: ['calls'] as const,
  calls: {
    all: ['calls'] as const,
    lists: () => [...queryKeys.calls.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.calls.lists(), filters] as const,
    details: () => [...queryKeys.calls.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.calls.details(), id] as const,
    active: (email: string) => [...queryKeys.calls.all, 'active', email] as const,
    today: (email: string) => [...queryKeys.calls.all, 'today', email] as const,
  },
  reference: {
    all: ['reference'] as const,
    tasks: () => [...queryKeys.reference.all, 'tasks'] as const,
    subjects: () => [...queryKeys.reference.all, 'subjects'] as const,
    taskSubjectSummary: () => [...queryKeys.reference.all, 'taskSubjectSummary'] as const,
  },
  reports: {
    all: ['reports'] as const,
    lists: () => [...queryKeys.reports.all, 'list'] as const,
    list: (email: string) => [...queryKeys.reports.lists(), email] as const,
    detail: (id: string) => [...queryKeys.reports.all, id] as const,
  },
} as const;
import { useQuery } from '@tanstack/react-query';
import { referenceApi } from '../api/reference.api';
import { queryKeys } from '../lib/query-client';

// Query Hooks for Reference Data
// These have longer cache times since reference data changes infrequently

// Get program management hierarchy
export const useProgramManagementHierarchy = () => {
  return useQuery({
    queryKey: queryKeys.reference.programManagementHierarchy(),
    queryFn: referenceApi.getProgramManagementHierarchy,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour cache
  });
};

// Get all program management items (flat list)
export const useProgramManagementItems = () => {
  return useQuery({
    queryKey: queryKeys.reference.programManagement(),
    queryFn: referenceApi.getAllProgramManagementItems,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

// Get program management children for a specific parent
export const useProgramManagementChildren = (parentId: string, enabled = true) => {
  return useQuery({
    queryKey: [...queryKeys.reference.programManagement(), 'children', parentId],
    queryFn: () => referenceApi.getProgramManagementChildren(parentId),
    enabled: enabled && !!parentId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

// Search program management items
export const useSearchProgramManagement = (query: string, enabled = true) => {
  return useQuery({
    queryKey: [...queryKeys.reference.programManagement(), 'search', query],
    queryFn: () => referenceApi.searchProgramManagement(query),
    enabled: enabled && !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000, // Shorter cache for search results
  });
};

// Get all categories
export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.reference.categories(),
    queryFn: referenceApi.getCategories,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

// Get specific category
export const useCategory = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [...queryKeys.reference.categories(), id],
    queryFn: () => referenceApi.getCategory(id),
    enabled: enabled && !!id,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

// Search categories
export const useSearchCategories = (query: string, enabled = true) => {
  return useQuery({
    queryKey: [...queryKeys.reference.categories(), 'search', query],
    queryFn: () => referenceApi.searchCategories(query),
    enabled: enabled && !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};

// Get all subjects
export const useSubjects = () => {
  return useQuery({
    queryKey: queryKeys.reference.subjects(),
    queryFn: referenceApi.getSubjects,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

// Get specific subject
export const useSubject = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [...queryKeys.reference.subjects(), id],
    queryFn: () => referenceApi.getSubject(id),
    enabled: enabled && !!id,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

// Search subjects
export const useSearchSubjects = (query: string, enabled = true) => {
  return useQuery({
    queryKey: [...queryKeys.reference.subjects(), 'search', query],
    queryFn: () => referenceApi.searchSubjects(query),
    enabled: enabled && !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};

// Convenience hook to load all reference data at once
export const useAllReferenceData = () => {
  const programManagement = useProgramManagementHierarchy();
  const categories = useCategories();
  const subjects = useSubjects();

  return {
    programManagement,
    categories,
    subjects,
    isLoading: programManagement.isLoading || categories.isLoading || subjects.isLoading,
    isError: programManagement.isError || categories.isError || subjects.isError,
  };
};
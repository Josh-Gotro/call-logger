import { useQuery } from '@tanstack/react-query';
import { referenceApi } from '../api/reference.api';
import { queryKeys } from '../lib/query-client';

// Query Hooks for Task-Subject Reference Data
// These have longer cache times since reference data changes infrequently

// Get all tasks with their subjects
export const useTasks = () => {
  return useQuery({
    queryKey: queryKeys.reference.tasks(),
    queryFn: referenceApi.getAllTasks,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour cache
  });
};

// Get specific task with its subjects
export const useTask = (taskId: string, enabled = true) => {
  return useQuery({
    queryKey: [...queryKeys.reference.tasks(), taskId],
    queryFn: () => referenceApi.getTaskById(taskId),
    enabled: enabled && !!taskId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

// Get subjects for a specific task
export const useSubjectsForTask = (taskId: string, enabled = true) => {
  return useQuery({
    queryKey: [...queryKeys.reference.tasks(), taskId, 'subjects'],
    queryFn: () => referenceApi.getSubjectsForTask(taskId),
    enabled: enabled && !!taskId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

// Get all subjects with their assigned tasks
export const useSubjects = () => {
  return useQuery({
    queryKey: queryKeys.reference.subjects(),
    queryFn: referenceApi.getAllSubjects,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

// Validate task-subject relationship
export const useValidateTaskSubject = (taskId: string, subjectId: string, enabled = true) => {
  return useQuery({
    queryKey: ['taskSubjectValidation', taskId, subjectId],
    queryFn: () => referenceApi.validateTaskSubjectRelationship(taskId, subjectId),
    enabled: enabled && !!taskId && !!subjectId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

// Get task-subject summary for dashboard/overview
export const useTaskSubjectSummary = () => {
  return useQuery({
    queryKey: queryKeys.reference.taskSubjectSummary(),
    queryFn: referenceApi.getTaskSubjectSummary,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

// Convenience hook to load all reference data at once
export const useAllReferenceData = () => {
  const tasks = useTasks();
  const subjects = useSubjects();
  const summary = useTaskSubjectSummary();

  return {
    tasks,
    subjects,
    summary,
    isLoading: tasks.isLoading || subjects.isLoading || summary.isLoading,
    isError: tasks.isError || subjects.isError || summary.isError,
  };
};


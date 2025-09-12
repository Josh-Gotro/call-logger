import { apiClient, extractData } from '../lib/api-client';
import {
  TaskEntity,
  SubjectEntity,
  TaskSubjectSummary,
} from '../types/api.types';

// Task-Subject Reference Data API Functions

export const referenceApi = {
  // Tasks
  getAllTasks: (): Promise<TaskEntity[]> =>
    apiClient.get('/tasks-subjects/tasks').then(extractData),

  getTaskById: (taskId: string): Promise<TaskEntity> =>
    apiClient.get(`/tasks-subjects/tasks/${taskId}`).then(extractData),

  getSubjectsForTask: (taskId: string): Promise<SubjectEntity[]> =>
    apiClient.get(`/tasks-subjects/tasks/${taskId}/subjects`).then(extractData),

  // Subjects
  getAllSubjects: (): Promise<SubjectEntity[]> =>
    apiClient.get('/tasks-subjects/subjects').then(extractData),

  // Validation
  validateTaskSubjectRelationship: (taskId: string, subjectId: string): Promise<boolean> =>
    apiClient.get('/tasks-subjects/validate', {
      params: { taskId, subjectId },
    }).then(extractData),

  // Summary/Overview
  getTaskSubjectSummary: (): Promise<TaskSubjectSummary> =>
    apiClient.get('/tasks-subjects/summary').then(extractData),

  // Admin functions (for creating tasks/subjects)
  createTask: (name: string, sortOrder?: number): Promise<TaskEntity> =>
    apiClient.post('/tasks-subjects/tasks', null, {
      params: { name, sortOrder },
    }).then(extractData),

  createSubject: (name: string, sortOrder?: number): Promise<SubjectEntity> =>
    apiClient.post('/tasks-subjects/subjects', null, {
      params: { name, sortOrder },
    }).then(extractData),
};
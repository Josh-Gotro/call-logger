import { apiClient, extractData } from '../lib/api-client';
import {
  ProgramManagementItem,
  CategoryItem,
  SubjectItem,
} from '../types/api.types';

// Reference Data API Functions

export const referenceApi = {
  // Program Management
  getProgramManagementHierarchy: (): Promise<ProgramManagementItem[]> =>
    apiClient.get('/reference/program-management/hierarchy').then(extractData),

  getAllProgramManagementItems: (): Promise<ProgramManagementItem[]> =>
    apiClient.get('/reference/program-management').then(extractData),

  getProgramManagementParents: (): Promise<ProgramManagementItem[]> =>
    apiClient.get('/reference/program-management/parents').then(extractData),

  getProgramManagementChildren: (parentId: string): Promise<ProgramManagementItem[]> =>
    apiClient.get(`/reference/program-management/parent/${parentId}/children`).then(extractData),

  searchProgramManagement: (query: string): Promise<ProgramManagementItem[]> =>
    apiClient
      .get('/reference/program-management/search', {
        params: { query },
      })
      .then(extractData),

  // Categories
  getCategories: (): Promise<CategoryItem[]> =>
    apiClient.get('/reference/categories').then(extractData),

  getCategory: (id: string): Promise<CategoryItem> =>
    apiClient.get(`/reference/categories/${id}`).then(extractData),

  searchCategories: (query: string): Promise<CategoryItem[]> =>
    apiClient
      .get('/reference/categories/search', {
        params: { query },
      })
      .then(extractData),

  // Subjects
  getSubjects: (): Promise<SubjectItem[]> =>
    apiClient.get('/reference/subjects').then(extractData),

  getSubject: (id: string): Promise<SubjectItem> =>
    apiClient.get(`/reference/subjects/${id}`).then(extractData),

  searchSubjects: (query: string): Promise<SubjectItem[]> =>
    apiClient
      .get('/reference/subjects/search', {
        params: { query },
      })
      .then(extractData),
};
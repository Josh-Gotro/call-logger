// API Types matching backend DTOs

// Call Management Types
export interface CallEntry {
  id: string;
  datatechName: string;
  datatechEmail: string;
  startTime: string;
  endTime: string | null;
  isInbound: boolean | null;
  programManagement: string | null;
  category: string | null;
  subject: string | null;
  isAgent: boolean | null;
  comments: string | null;
  createdAt: string;
  updatedAt: string;
  inProgress: boolean;
  completed: boolean;
  durationMinutes: number;
}

export interface StartCallRequest {
  datatechName: string;
  datatechEmail: string;
}

export interface UpdateCallRequest {
  isInbound?: boolean;
  programManagementParentId?: string;
  programManagementChildId?: string;
  categoryId?: string;
  subjectId?: string;
  isAgent?: boolean;
  comments?: string;
  startTime?: string;
  endTime?: string;
}

// Reference Data Types
export interface ProgramManagementItem {
  id: string;
  name: string;
  parentId: string | null;
  parentName: string | null;
  children: ProgramManagementItem[] | null;
  hasChildren: boolean;
  active: boolean;
  sortOrder: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  active: boolean;
  sortOrder: number;
}

export interface SubjectItem {
  id: string;
  name: string;
  active: boolean;
  sortOrder: number;
}

// Report Types
export interface ReportRequest {
  reportType: 'LIVE' | 'DETAILED_EXPORT' | 'SUMMARY';
  requestedBy: string;
  userEmail?: string;
  programManagement?: string;
  category?: string;
  subject?: string;
  startDate?: string;
  endDate?: string;
  additionalFilters?: Record<string, any>;
}

export interface ReportRun {
  id: string;
  requestedBy: string;
  status: string;
  reportType: string;
  parameters: Record<string, any>;
  resultUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  inProgress: boolean;
  completed: boolean;
  failed: boolean;
  processingTimeMinutes: number;
}

// API Response Types
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}
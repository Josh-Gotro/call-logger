// API Types matching backend DTOs

// Call Management Types
export interface CallEntry {
  id: string;
  datatechName: string;
  datatechEmail: string;
  startTime: string;
  endTime: string | null;
  isInbound: boolean | null;
  taskName: string | null;
  subjectName: string | null;
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
  taskId?: string;
  subjectId?: string;
  isAgent?: boolean;
  comments?: string;
  startTime?: string;
  endTime?: string;
}

// Reference Data Types - Task-Subject Model
export interface TaskEntity {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  subjects: SubjectReference[];
  subjectCount: number;
  hasSubjects: boolean;
}

export interface SubjectEntity {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  tasks: TaskReference[];
  taskCount: number;
  isAssignedToTasks: boolean;
}

export interface SubjectReference {
  id: string;
  name: string;
  sortOrder: number;
}

export interface TaskReference {
  id: string;
  name: string;
  sortOrder: number;
}

export interface TaskSubjectSummary {
  totalTasks: number;
  totalSubjects: number;
  totalRelationships: number;
  tasks: TaskEntity[];
  subjects: SubjectEntity[];
}

// Report Types
export interface ReportRequest {
  reportType: 'LIVE' | 'DETAILED_EXPORT' | 'SUMMARY';
  requestedBy: string;
  userEmail?: string;
  taskName?: string;
  subjectName?: string;
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
/**
 * API type definitions shared with backend
 */

export interface PbxCallRequest {
  phoneNumber: string;
  callDuration: number;  // in seconds
  callOwnerExtension: string;
  callOwnerEmail?: string;
  callDirection: 'INBOUND' | 'OUTBOUND';
  callGroupId?: string;
  timestamp: string;  // ISO 8601 format
  pbxCallId: string;
}

export interface CallEntryResponse {
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
  phoneNumber?: string;
  pbxCallId?: string;
  isPbxOriginated?: boolean;
  pbxDataReceivedAt?: string;
  createdAt: string;
  updatedAt: string;
  inProgress: boolean;
  completed: boolean;
  durationMinutes: number;
}

export interface CallGroupAlertRequest {
  callGroupId: string;
  callGroupName: string;
  alertType: 'NO_ASSIGNED_USERS';
  alertMessage: string;
}

export interface CallGroupAlertResponse {
  id: string;
  callGroupId: string;
  callGroupName: string;
  alertType: string;
  alertMessage: string;
  isActive: boolean;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ApiErrorResponse {
  message: string;
  status: number;
  timestamp: string;
  details?: Record<string, any>;
}

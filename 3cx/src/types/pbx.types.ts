/**
 * PBX data type definitions
 */

export interface CdrRecord {
  id: string;
  callId: string;
  startTime: Date;
  endTime: Date;
  duration: number;  // in seconds
  phoneNumber: string;
  extension: string;
  callDirection: 'INBOUND' | 'OUTBOUND';
  callGroupId?: string;
  answered: boolean;
  hangupCause?: string;
}

export interface CallEvent {
  pbxCallId: string;
  phoneNumber: string;
  callDuration: number;  // in seconds
  callOwnerExtension: string;
  callOwnerEmail?: string;
  callDirection: 'INBOUND' | 'OUTBOUND';
  callGroupId?: string;
  timestamp: Date;
}

export interface CallGroupStatus {
  groupId: string;
  groupName: string;
  assignedUsers: number;
  isBusinessHours: boolean;
  needsAlert: boolean;
}

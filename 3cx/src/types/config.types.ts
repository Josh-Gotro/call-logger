/**
 * Configuration type definitions for 3CX integration
 */

export interface AppConfig {
  threecx: ThreeCXConfig;
  api: ApiConfig;
  businessHours: BusinessHoursConfig;
  callGroups: CallGroupsConfig;
  extensionMapping: ExtensionMapping;
}

export interface ThreeCXConfig {
  integration_method: 'cdr_polling' | 'webhook' | 'callflow';
  cdr_database: DatabaseConfig;
  polling_interval_seconds: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface ApiConfig {
  base_url: string;
  timeout_seconds: number;
  retry_attempts: number;
}

export interface BusinessHoursConfig {
  timezone: string;
  monday: DayHours | null;
  tuesday: DayHours | null;
  wednesday: DayHours | null;
  thursday: DayHours | null;
  friday: DayHours | null;
  saturday: DayHours | null;
  sunday: DayHours | null;
}

export interface DayHours {
  start: string;  // HH:mm format
  end: string;    // HH:mm format
}

export interface CallGroupsConfig {
  alert_check_interval_minutes: number;
  monitored_groups: MonitoredGroup[];
}

export interface MonitoredGroup {
  id: string;
  name: string;
}

export interface ExtensionMapping {
  [extension: string]: string;  // extension number -> email
}

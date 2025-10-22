/**
 * Call group monitoring service for detecting unassigned groups
 */

import { CallGroupsConfig, MonitoredGroup } from '../types/config.types.js';
import { CallGroupStatus } from '../types/pbx.types.js';
import { CallGroupAlertRequest } from '../types/api.types.js';
import logger from '../utils/logger.js';
import BusinessHoursService from './business-hours.js';
import ApiClient from './api-client.js';

export class CallGroupMonitor {
  private config: CallGroupsConfig;
  private businessHours: BusinessHoursService;
  private apiClient: ApiClient;
  private activeAlerts: Map<string, boolean> = new Map();

  constructor(
    config: CallGroupsConfig,
    businessHours: BusinessHoursService,
    apiClient: ApiClient
  ) {
    this.config = config;
    this.businessHours = businessHours;
    this.apiClient = apiClient;

    logger.info('Call group monitor initialized', {
      monitoredGroups: config.monitored_groups.length,
    });
  }

  /**
   * Check all monitored call groups and generate alerts if needed
   */
  async checkCallGroups(): Promise<void> {
    logger.info('Starting call group check');

    const isBusinessHours = this.businessHours.isBusinessHours();

    if (!isBusinessHours) {
      logger.debug('Outside business hours, skipping call group alerts');
      return;
    }

    for (const group of this.config.monitored_groups) {
      await this.checkCallGroup(group);
    }

    logger.info('Call group check completed');
  }

  /**
   * Check a specific call group
   *
   * Note: This is a placeholder implementation. In a real scenario,
   * you would query the 3CX API or database to get actual assigned users.
   */
  private async checkCallGroup(group: MonitoredGroup): Promise<void> {
    try {
      logger.debug('Checking call group', { groupId: group.id, groupName: group.name });

      // Get call group status
      const status = await this.getCallGroupStatus(group);

      // Check if alert is needed
      if (status.needsAlert) {
        await this.generateAlert(group, status);
      } else {
        // Clear alert if it was previously active
        if (this.activeAlerts.get(group.id)) {
          logger.info('Call group now has users, clearing alert', {
            groupId: group.id,
            groupName: group.name,
          });
          this.activeAlerts.set(group.id, false);
        }
      }
    } catch (error) {
      logger.error('Error checking call group', {
        groupId: group.id,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Get call group status
   *
   * This is a placeholder implementation. In a real scenario, you would:
   * 1. Query 3CX API for call group members
   * 2. Check if any users are logged in/available
   * 3. Return the actual status
   */
  private async getCallGroupStatus(group: MonitoredGroup): Promise<CallGroupStatus> {
    // Placeholder: simulate getting call group status
    // In production, this would query 3CX API or database
    const assignedUsers = await this.queryCallGroupMembers(group.id);

    return {
      groupId: group.id,
      groupName: group.name,
      assignedUsers,
      isBusinessHours: this.businessHours.isBusinessHours(),
      needsAlert: assignedUsers === 0,
    };
  }

  /**
   * Query 3CX for call group members
   *
   * This is a placeholder implementation. Replace with actual 3CX API call
   */
  private async queryCallGroupMembers(groupId: string): Promise<number> {
    // Placeholder implementation
    // In production, this would:
    // 1. Connect to 3CX API
    // 2. Get call group by ID
    // 3. Count active/logged-in members
    // 4. Return the count

    // For now, randomly return 0-3 for demonstration
    // Replace this with actual 3CX API query
    logger.debug('Querying call group members (placeholder)', { groupId });

    // Simulated query - replace with real implementation:
    // const response = await fetch3CXApi(`/callgroups/${groupId}/members`);
    // return response.members.filter(m => m.loggedIn).length;

    return Math.floor(Math.random() * 4);
  }

  /**
   * Generate and submit alert for call group with no users
   */
  private async generateAlert(group: MonitoredGroup, status: CallGroupStatus): Promise<void> {
    // Check if we've already sent an alert for this group
    if (this.activeAlerts.get(group.id)) {
      logger.debug('Alert already active for call group', { groupId: group.id });
      return;
    }

    logger.warn('Call group has no assigned users during business hours', {
      groupId: group.id,
      groupName: group.name,
    });

    const alertRequest: CallGroupAlertRequest = {
      callGroupId: group.id,
      callGroupName: group.name,
      alertType: 'NO_ASSIGNED_USERS',
      alertMessage: `Call group "${group.name}" has no assigned users during business hours`,
    };

    try {
      await this.apiClient.submitCallGroupAlert(alertRequest);
      this.activeAlerts.set(group.id, true);

      logger.info('Call group alert submitted successfully', {
        groupId: group.id,
        groupName: group.name,
      });
    } catch (error) {
      logger.error('Failed to submit call group alert', {
        groupId: group.id,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Clear all active alerts (useful for testing or reset)
   */
  clearActiveAlerts(): void {
    logger.info('Clearing all active alerts');
    this.activeAlerts.clear();
  }

  /**
   * Get active alert status for a group
   */
  isAlertActive(groupId: string): boolean {
    return this.activeAlerts.get(groupId) || false;
  }

  /**
   * Get all monitored groups
   */
  getMonitoredGroups(): MonitoredGroup[] {
    return this.config.monitored_groups;
  }
}

export default CallGroupMonitor;

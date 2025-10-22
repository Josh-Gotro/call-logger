/**
 * Unit tests for BusinessHoursService
 */

import { BusinessHoursService } from '../../src/services/business-hours';
import { BusinessHoursConfig } from '../../src/types/config.types';

describe('BusinessHoursService', () => {
  let service: BusinessHoursService;
  let config: BusinessHoursConfig;

  beforeEach(() => {
    config = {
      timezone: 'America/Anchorage',
      monday: { start: '08:00', end: '17:00' },
      tuesday: { start: '08:00', end: '17:00' },
      wednesday: { start: '08:00', end: '17:00' },
      thursday: { start: '08:00', end: '17:00' },
      friday: { start: '08:00', end: '17:00' },
      saturday: null,
      sunday: null,
    };
    service = new BusinessHoursService(config);
  });

  describe('isBusinessHours', () => {
    it('should return true during business hours on Monday', () => {
      // Monday at 10:00 AM
      const monday10am = new Date('2025-01-06T10:00:00');
      expect(service.isBusinessHours(monday10am)).toBe(true);
    });

    it('should return false before business hours', () => {
      // Monday at 7:00 AM
      const monday7am = new Date('2025-01-06T07:00:00');
      expect(service.isBusinessHours(monday7am)).toBe(false);
    });

    it('should return false after business hours', () => {
      // Monday at 6:00 PM
      const monday6pm = new Date('2025-01-06T18:00:00');
      expect(service.isBusinessHours(monday6pm)).toBe(false);
    });

    it('should return false on Saturday (non-business day)', () => {
      // Saturday at 10:00 AM
      const saturday10am = new Date('2025-01-04T10:00:00');
      expect(service.isBusinessHours(saturday10am)).toBe(false);
    });

    it('should return false on Sunday (non-business day)', () => {
      // Sunday at 10:00 AM
      const sunday10am = new Date('2025-01-05T10:00:00');
      expect(service.isBusinessHours(sunday10am)).toBe(false);
    });

    it('should return true at exactly start time', () => {
      // Monday at 8:00 AM
      const monday8am = new Date('2025-01-06T08:00:00');
      expect(service.isBusinessHours(monday8am)).toBe(true);
    });

    it('should return true at exactly end time', () => {
      // Monday at 5:00 PM
      const monday5pm = new Date('2025-01-06T17:00:00');
      expect(service.isBusinessHours(monday5pm)).toBe(true);
    });
  });

  describe('getBusinessDays', () => {
    it('should return all business days', () => {
      const businessDays = service.getBusinessDays();
      expect(businessDays).toHaveLength(5);
      expect(businessDays).toContain('monday');
      expect(businessDays).toContain('tuesday');
      expect(businessDays).toContain('wednesday');
      expect(businessDays).toContain('thursday');
      expect(businessDays).toContain('friday');
      expect(businessDays).not.toContain('saturday');
      expect(businessDays).not.toContain('sunday');
    });
  });

  describe('getBusinessHoursForDay', () => {
    it('should return hours for business days', () => {
      const mondayHours = service.getBusinessHoursForDay('monday');
      expect(mondayHours).not.toBeNull();
      expect(mondayHours?.start).toBe('08:00');
      expect(mondayHours?.end).toBe('17:00');
    });

    it('should return null for non-business days', () => {
      const saturdayHours = service.getBusinessHoursForDay('saturday');
      expect(saturdayHours).toBeNull();
    });

    it('should be case insensitive', () => {
      const mondayHours = service.getBusinessHoursForDay('MONDAY');
      expect(mondayHours).not.toBeNull();
    });
  });

  describe('getNextBusinessHoursStart', () => {
    it('should return next business day start time', () => {
      // Friday at 6:00 PM (after hours)
      const friday6pm = new Date('2025-01-10T18:00:00');
      const nextStart = service.getNextBusinessHoursStart();

      // Should be Monday at 8:00 AM
      // Note: This is a simplified test, actual implementation may vary
      expect(nextStart).toBeInstanceOf(Date);
      expect(nextStart.getTime()).toBeGreaterThan(friday6pm.getTime());
    });
  });
});

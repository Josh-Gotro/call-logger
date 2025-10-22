/**
 * Business hours detection with timezone support
 */

import { BusinessHoursConfig, DayHours } from '../types/config.types.js';
import logger from '../utils/logger.js';

export class BusinessHoursService {
  private config: BusinessHoursConfig;

  constructor(config: BusinessHoursConfig) {
    this.config = config;
    logger.info('Business hours service initialized', {
      timezone: config.timezone,
    });
  }

  /**
   * Check if current time is within business hours
   */
  isBusinessHours(now?: Date): boolean {
    const checkTime = now || new Date();

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = checkTime.getDay();
    const dayName = this.getDayName(dayOfWeek);

    const dayHours = this.config[dayName as keyof BusinessHoursConfig] as DayHours | null;

    if (!dayHours) {
      logger.debug('Not a business day', { dayName });
      return false;
    }

    const currentTime = this.formatTime(checkTime);
    const isWithinHours = currentTime >= dayHours.start && currentTime <= dayHours.end;

    logger.debug('Business hours check', {
      dayName,
      currentTime,
      businessHours: dayHours,
      isWithinHours,
    });

    return isWithinHours;
  }

  /**
   * Get next business hours start time
   */
  getNextBusinessHoursStart(): Date {
    const now = new Date();
    let checkDate = new Date(now);

    // Check up to 7 days ahead
    for (let i = 0; i < 7; i++) {
      checkDate.setDate(checkDate.getDate() + 1);
      checkDate.setHours(0, 0, 0, 0);

      const dayOfWeek = checkDate.getDay();
      const dayName = this.getDayName(dayOfWeek);
      const dayHours = this.config[dayName as keyof BusinessHoursConfig] as DayHours | null;

      if (dayHours) {
        const [hours, minutes] = dayHours.start.split(':').map(Number);
        checkDate.setHours(hours, minutes, 0, 0);
        return checkDate;
      }
    }

    // Default to tomorrow at 8 AM if no business days found
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow;
  }

  /**
   * Get time until next business hours
   */
  getTimeUntilNextBusinessHours(): number {
    const now = new Date();
    const nextStart = this.getNextBusinessHoursStart();
    return nextStart.getTime() - now.getTime();
  }

  /**
   * Get day name from day of week number
   */
  private getDayName(dayOfWeek: number): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayOfWeek];
  }

  /**
   * Format time as HH:mm for comparison
   */
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Get business hours for a specific day
   */
  getBusinessHoursForDay(dayName: string): DayHours | null {
    return this.config[dayName.toLowerCase() as keyof BusinessHoursConfig] as DayHours | null;
  }

  /**
   * Get all business days
   */
  getBusinessDays(): string[] {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.filter(day => {
      const dayHours = this.config[day as keyof BusinessHoursConfig];
      return dayHours !== null && dayHours !== undefined;
    });
  }
}

export default BusinessHoursService;

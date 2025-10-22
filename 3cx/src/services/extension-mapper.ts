/**
 * Extension to email mapping service
 */

import { ExtensionMapping } from '../types/config.types.js';
import logger from '../utils/logger.js';

export class ExtensionMapper {
  private mapping: ExtensionMapping;

  constructor(mapping: ExtensionMapping) {
    this.mapping = mapping;
    logger.info('Extension mapper initialized', {
      mappedExtensions: Object.keys(mapping).length,
    });
  }

  /**
   * Get email for extension number
   */
  getEmail(extension: string): string | undefined {
    const email = this.mapping[extension];
    if (!email) {
      logger.warn('No email mapping found for extension', { extension });
    }
    return email;
  }

  /**
   * Check if extension has a mapping
   */
  hasMapping(extension: string): boolean {
    return extension in this.mapping;
  }

  /**
   * Get all mapped extensions
   */
  getAllExtensions(): string[] {
    return Object.keys(this.mapping);
  }

  /**
   * Get all mapped emails
   */
  getAllEmails(): string[] {
    return Object.values(this.mapping);
  }

  /**
   * Reload mapping (useful if config changes)
   */
  updateMapping(newMapping: ExtensionMapping): void {
    this.mapping = newMapping;
    logger.info('Extension mapping updated', {
      mappedExtensions: Object.keys(newMapping).length,
    });
  }
}

export default ExtensionMapper;

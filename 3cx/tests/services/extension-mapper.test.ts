/**
 * Unit tests for ExtensionMapper service
 */

import { ExtensionMapper } from '../../src/services/extension-mapper';
import { ExtensionMapping } from '../../src/types/config.types';

describe('ExtensionMapper', () => {
  let mapper: ExtensionMapper;
  let testMapping: ExtensionMapping;

  beforeEach(() => {
    testMapping = {
      '101': 'john.doe@wostmann.com',
      '102': 'jane.smith@wostmann.com',
      '103': 'bob.jones@wostmann.com',
    };
    mapper = new ExtensionMapper(testMapping);
  });

  describe('getEmail', () => {
    it('should return email for valid extension', () => {
      expect(mapper.getEmail('101')).toBe('john.doe@wostmann.com');
      expect(mapper.getEmail('102')).toBe('jane.smith@wostmann.com');
    });

    it('should return undefined for unknown extension', () => {
      expect(mapper.getEmail('999')).toBeUndefined();
    });

    it('should handle string extension numbers', () => {
      expect(mapper.getEmail('101')).toBe('john.doe@wostmann.com');
    });
  });

  describe('hasMapping', () => {
    it('should return true for mapped extensions', () => {
      expect(mapper.hasMapping('101')).toBe(true);
      expect(mapper.hasMapping('102')).toBe(true);
    });

    it('should return false for unmapped extensions', () => {
      expect(mapper.hasMapping('999')).toBe(false);
    });
  });

  describe('getAllExtensions', () => {
    it('should return all extension numbers', () => {
      const extensions = mapper.getAllExtensions();
      expect(extensions).toHaveLength(3);
      expect(extensions).toContain('101');
      expect(extensions).toContain('102');
      expect(extensions).toContain('103');
    });
  });

  describe('getAllEmails', () => {
    it('should return all mapped emails', () => {
      const emails = mapper.getAllEmails();
      expect(emails).toHaveLength(3);
      expect(emails).toContain('john.doe@wostmann.com');
      expect(emails).toContain('jane.smith@wostmann.com');
      expect(emails).toContain('bob.jones@wostmann.com');
    });
  });

  describe('updateMapping', () => {
    it('should update the mapping', () => {
      const newMapping: ExtensionMapping = {
        '201': 'alice@wostmann.com',
      };

      mapper.updateMapping(newMapping);

      expect(mapper.getEmail('201')).toBe('alice@wostmann.com');
      expect(mapper.getEmail('101')).toBeUndefined();
      expect(mapper.getAllExtensions()).toHaveLength(1);
    });
  });
});

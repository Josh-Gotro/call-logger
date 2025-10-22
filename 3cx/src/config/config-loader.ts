/**
 * Configuration loader with YAML parsing and environment variable substitution
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { AppConfig } from '../types/config.types.js';
import logger from '../utils/logger.js';

/**
 * Substitute environment variables in a string
 * Supports ${VAR_NAME} and ${VAR_NAME:-default} syntax
 */
function substituteEnvVars(str: string): string {
  return str.replace(/\$\{([^}:]+)(?::-(.*?))?\}/g, (match, varName, defaultValue) => {
    return process.env[varName] || defaultValue || match;
  });
}

/**
 * Recursively substitute environment variables in an object
 */
function substituteEnvVarsInObject(obj: any): any {
  if (typeof obj === 'string') {
    return substituteEnvVars(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(substituteEnvVarsInObject);
  }
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = substituteEnvVarsInObject(obj[key]);
    }
    return result;
  }
  return obj;
}

/**
 * Load and parse configuration from YAML file
 */
export function loadConfig(configPath?: string): AppConfig {
  const defaultPath = path.join(process.cwd(), 'config', '3cx-config.yml');
  const filePath = configPath || defaultPath;

  logger.info(`Loading configuration from: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    logger.error(`Configuration file not found: ${filePath}`);
    throw new Error(`Configuration file not found: ${filePath}`);
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const rawConfig = yaml.load(fileContent) as any;

    // Substitute environment variables
    const config = substituteEnvVarsInObject(rawConfig) as AppConfig;

    // Validate required fields
    validateConfig(config);

    logger.info('Configuration loaded successfully');
    return config;
  } catch (error) {
    logger.error('Failed to load configuration', { error });
    throw error;
  }
}

/**
 * Validate configuration has required fields
 */
function validateConfig(config: AppConfig): void {
  const errors: string[] = [];

  // Validate 3CX config
  if (!config.threecx) {
    errors.push('Missing threecx configuration');
  } else {
    if (!config.threecx.cdr_database) {
      errors.push('Missing threecx.cdr_database configuration');
    } else {
      if (!config.threecx.cdr_database.host) errors.push('Missing threecx.cdr_database.host');
      if (!config.threecx.cdr_database.database) errors.push('Missing threecx.cdr_database.database');
      if (!config.threecx.cdr_database.username) errors.push('Missing threecx.cdr_database.username');
      if (!config.threecx.cdr_database.password) errors.push('Missing threecx.cdr_database.password');
    }
  }

  // Validate API config
  if (!config.api) {
    errors.push('Missing api configuration');
  } else {
    if (!config.api.base_url) errors.push('Missing api.base_url');
  }

  // Validate business hours
  if (!config.businessHours) {
    errors.push('Missing businessHours configuration');
  } else {
    if (!config.businessHours.timezone) errors.push('Missing businessHours.timezone');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

export default loadConfig;

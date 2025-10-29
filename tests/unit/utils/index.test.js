/**
 * Unit tests for utils barrel export
 * Validates that all utility functions are properly exported
 */

import { describe, test, expect } from '@jest/globals';

describe('Utils Barrel Export', () => {
  test('should export all utility functions', async () => {
    const utils = await import('../../../utils/index.js');

    // Config exports
    expect(typeof utils.validateConfig).toBe('function');
    expect(typeof utils.loadConfig).toBe('function');
    expect(typeof utils.validateConfigWithDefaults).toBe('function');

    // Logger exports
    expect(typeof utils.createLogger).toBe('function');
    expect(typeof utils.sanitizeLogData).toBe('function');

    // ACO Client exports (SDK-based functions)
    expect(typeof utils.createACOClient).toBe('function');
    expect(typeof utils.getACOClient).toBe('function');
    expect(typeof utils.resetACOClient).toBe('function');
    expect(typeof utils.getGraphQLEndpoint).toBe('function');
    expect(typeof utils.getACOUIUrl).toBe('function');
    expect(typeof utils.batchProcess).toBe('function');

    // Batch Processor exports
    expect(utils.BatchProcessor).toBeDefined();
    expect(typeof utils.BatchProcessor.process).toBe('function');

    // Error Handler exports
    expect(utils.ErrorHandler).toBeDefined();
    expect(utils.ErrorCategory).toBeDefined();
    expect(typeof utils.ErrorHandler.categorize).toBe('function');
    expect(typeof utils.ErrorHandler.isRetryable).toBe('function');
    expect(typeof utils.ErrorHandler.format).toBe('function');

    // Schema Validator exports
    expect(utils.SchemaValidator).toBeDefined();
    expect(typeof utils.SchemaValidator.validateProduct).toBe('function');
    expect(typeof utils.SchemaValidator.validateCategory).toBe('function');
    expect(typeof utils.SchemaValidator.validateInventory).toBe('function');
  });

  test('should have working config validator from barrel export', async () => {
    const { validateConfig } = await import('../../../utils/index.js');

    const validConfig = {
      ACO_API_KEY: 'test-key',
      ACO_ENVIRONMENT_ID: 'test-env',
      ACO_API_BASE_URL: 'https://api.example.com'
    };

    const result = validateConfig(validConfig);
    expect(result.isValid).toBe(true);
  });

  test('should have working logger from barrel export', async () => {
    const { createLogger, sanitizeLogData } = await import('../../../utils/index.js');

    const logger = createLogger({
      level: 'info',
      logDir: '/tmp/test-logs',
      enableConsole: false
    });

    expect(logger).toBeDefined();
    expect(logger.level).toBe('info');

    const sanitized = sanitizeLogData({ API_KEY: 'secret' });
    expect(sanitized.API_KEY).toBe('[REDACTED]');
  });
});

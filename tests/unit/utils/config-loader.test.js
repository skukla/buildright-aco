/**
 * Unit tests for Config Loader
 * Tests configuration loading with defaults, validation, and ACO-specific settings
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

describe('Config Loader', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Set up minimal required environment
    process.env.ACO_API_KEY = 'test-key';
    process.env.ACO_ENVIRONMENT_ID = 'test-env';
    process.env.ACO_API_BASE_URL = 'https://test.adobe.io';
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  test('should load configuration with required fields', async () => {
    const { loadConfig } = await import('../../../utils/config-loader.js');

    const config = loadConfig();

    expect(config.ACO_API_KEY).toBe('test-key');
    expect(config.ACO_ENVIRONMENT_ID).toBe('test-env');
    expect(config.ACO_API_BASE_URL).toBe('https://test.adobe.io');
  });

  test('should apply default values for optional fields', async () => {
    const { loadConfig } = await import('../../../utils/config-loader.js');

    const config = loadConfig();

    // Check default values
    expect(config.BATCH_SIZE).toBeDefined();
    expect(config.MAX_RETRIES).toBeDefined();
    expect(config.RETRY_DELAY).toBeDefined();
    expect(config.LOG_LEVEL).toBeDefined();

    // Verify default values are sensible
    expect(config.BATCH_SIZE).toBeGreaterThan(0);
    expect(config.MAX_RETRIES).toBeGreaterThan(0);
    expect(config.RETRY_DELAY).toBeGreaterThan(0);
  });

  test('should override defaults with environment variables', async () => {
    process.env.BATCH_SIZE = '50';
    process.env.MAX_RETRIES = '5';
    process.env.RETRY_DELAY = '2000';
    process.env.LOG_LEVEL = 'debug';

    const { loadConfig } = await import('../../../utils/config-loader.js');

    const config = loadConfig();

    expect(config.BATCH_SIZE).toBe(50);
    expect(config.MAX_RETRIES).toBe(5);
    expect(config.RETRY_DELAY).toBe(2000);
    expect(config.LOG_LEVEL).toBe('debug');
  });

  test('should validate data types for numeric fields', async () => {
    process.env.BATCH_SIZE = 'not-a-number';

    const { loadConfig } = await import('../../../utils/config-loader.js');

    expect(() => loadConfig()).toThrow();
  });

  test('should throw error when required fields are missing', async () => {
    delete process.env.ACO_API_KEY;
    delete process.env.ACO_ENVIRONMENT_ID;

    const { loadConfig } = await import('../../../utils/config-loader.js');

    expect(() => loadConfig()).toThrow(/required/i);
  });

  test('should validate URL format for ACO_API_BASE_URL', async () => {
    process.env.ACO_API_BASE_URL = 'invalid-url';

    const { loadConfig } = await import('../../../utils/config-loader.js');

    expect(() => loadConfig()).toThrow(/URL/i);
  });

  test('should validate batch size is within acceptable range', async () => {
    process.env.BATCH_SIZE = '0'; // Invalid: too small

    const { loadConfig } = await import('../../../utils/config-loader.js');

    expect(() => loadConfig()).toThrow(/batch/i);
  });

  test('should validate max retries is non-negative', async () => {
    process.env.MAX_RETRIES = '-1';

    const { loadConfig } = await import('../../../utils/config-loader.js');

    expect(() => loadConfig()).toThrow(/retries/i);
  });

  test('should support custom configuration object validation', async () => {
    const { validateConfigWithDefaults } = await import('../../../utils/config-loader.js');

    const customConfig = {
      ACO_API_KEY: 'custom-key',
      ACO_ENVIRONMENT_ID: 'custom-env',
      ACO_API_BASE_URL: 'https://custom.adobe.io',
      BATCH_SIZE: 25
    };

    const result = validateConfigWithDefaults(customConfig);

    expect(result.isValid).toBe(true);
    expect(result.config.BATCH_SIZE).toBe(25);
    expect(result.config.MAX_RETRIES).toBeDefined(); // Should have default
  });

  test('should reject invalid log level', async () => {
    process.env.LOG_LEVEL = 'invalid-level';

    const { loadConfig } = await import('../../../utils/config-loader.js');

    expect(() => loadConfig()).toThrow(/log level/i);
  });

  test('should include all ACO-specific settings in config', async () => {
    const { loadConfig } = await import('../../../utils/config-loader.js');

    const config = loadConfig();

    // Verify ACO-specific settings exist
    expect(config).toHaveProperty('BATCH_SIZE');
    expect(config).toHaveProperty('MAX_RETRIES');
    expect(config).toHaveProperty('RETRY_DELAY');
    expect(config).toHaveProperty('REQUEST_TIMEOUT');
  });

  test('should set reasonable default for request timeout', async () => {
    const { loadConfig } = await import('../../../utils/config-loader.js');

    const config = loadConfig();

    expect(config.REQUEST_TIMEOUT).toBeDefined();
    expect(config.REQUEST_TIMEOUT).toBeGreaterThan(0);
    expect(config.REQUEST_TIMEOUT).toBeLessThanOrEqual(60000); // Max 60 seconds
  });

  test('should allow custom request timeout', async () => {
    process.env.REQUEST_TIMEOUT = '15000';

    const { loadConfig } = await import('../../../utils/config-loader.js');

    const config = loadConfig();

    expect(config.REQUEST_TIMEOUT).toBe(15000);
  });

  test('should provide helpful error messages for validation failures', async () => {
    delete process.env.ACO_API_KEY;

    const { loadConfig } = await import('../../../utils/config-loader.js');

    try {
      loadConfig();
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).toContain('ACO_API_KEY');
      expect(error.message.length).toBeGreaterThan(10);
    }
  });
});

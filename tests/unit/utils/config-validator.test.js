/**
 * Unit tests for configuration validator
 * Tests environment variable validation and configuration loading
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

describe('Configuration Validator', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('validateConfig', () => {
    test('should detect missing required variables', async () => {
      // Import the module dynamically to allow testing
      const { validateConfig } = await import('../../../utils/config-validator.js');

      // Test with empty config
      const result = validateConfig({});

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('ACO_API_KEY'),
          expect.stringContaining('ACO_ENVIRONMENT_ID'),
          expect.stringContaining('ACO_API_BASE_URL')
        ])
      );
    });

    test('should pass validation with all required variables present', async () => {
      const { validateConfig } = await import('../../../utils/config-validator.js');

      const validConfig = {
        ACO_API_KEY: 'test-api-key-12345',
        ACO_ENVIRONMENT_ID: 'test-env-id',
        ACO_API_BASE_URL: 'https://api.example.com',
        LOG_LEVEL: 'info'
      };

      const result = validateConfig(validConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should detect invalid URL formats', async () => {
      const { validateConfig } = await import('../../../utils/config-validator.js');

      const configWithInvalidUrl = {
        ACO_API_KEY: 'test-api-key-12345',
        ACO_ENVIRONMENT_ID: 'test-env-id',
        ACO_API_BASE_URL: 'not-a-valid-url',
        LOG_LEVEL: 'info'
      };

      const result = validateConfig(configWithInvalidUrl);

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.some(err => err.includes('ACO_API_BASE_URL'))).toBe(true);
      expect(result.errors.some(err => err.includes('valid URL'))).toBe(true);
    });
  });

  describe('loadConfig', () => {
    test('should load configuration from environment variables', async () => {
      // Set up environment
      process.env.ACO_API_KEY = 'test-api-key';
      process.env.ACO_ENVIRONMENT_ID = 'test-env';
      process.env.ACO_API_BASE_URL = 'https://api.example.com';
      process.env.LOG_LEVEL = 'debug';

      const { loadConfig } = await import('../../../utils/config-validator.js');
      const config = loadConfig();

      expect(config).toBeDefined();
      expect(config.ACO_API_KEY).toBe('test-api-key');
      expect(config.ACO_ENVIRONMENT_ID).toBe('test-env');
      expect(config.ACO_API_BASE_URL).toBe('https://api.example.com');
      expect(config.LOG_LEVEL).toBe('debug');
    });

    test('should throw error when required variables are missing', async () => {
      // Clear environment variables
      delete process.env.ACO_API_KEY;
      delete process.env.ACO_ENVIRONMENT_ID;
      delete process.env.ACO_API_BASE_URL;

      const { loadConfig } = await import('../../../utils/config-validator.js');

      expect(() => loadConfig()).toThrow();
    });
  });
});

/**
 * Unit tests for logger utility
 * Tests logger initialization, sanitization, and file output
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';

const TEST_LOGS_DIR = join(process.cwd(), 'logs', 'test');

describe('Logger', () => {
  beforeEach(() => {
    // Create test logs directory
    if (existsSync(TEST_LOGS_DIR)) {
      rmSync(TEST_LOGS_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_LOGS_DIR, { recursive: true });
  });

  afterEach(() => {
    // Clean up test logs
    if (existsSync(TEST_LOGS_DIR)) {
      rmSync(TEST_LOGS_DIR, { recursive: true, force: true });
    }
  });

  test('should initialize logger with correct log level from environment', async () => {
    const { createLogger } = await import('../../../utils/logger.js');

    const logger = createLogger({
      level: 'debug',
      logDir: TEST_LOGS_DIR,
      enableConsole: false
    });

    expect(logger).toBeDefined();
    expect(logger.level).toBe('debug');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.warn).toBe('function');
  });

  test('should sanitize sensitive data from logs', async () => {
    const { createLogger, sanitizeLogData } = await import('../../../utils/logger.js');

    // Test sanitization function
    const sensitiveData = {
      user: 'john',
      API_KEY: 'secret-key-12345',
      TOKEN: 'bearer-token-xyz',
      PASSWORD: 'my-password',
      ACO_API_KEY: 'aco-secret',
      normalField: 'visible-data'
    };

    const sanitized = sanitizeLogData(sensitiveData);

    expect(sanitized.API_KEY).toBe('[REDACTED]');
    expect(sanitized.TOKEN).toBe('[REDACTED]');
    expect(sanitized.PASSWORD).toBe('[REDACTED]');
    expect(sanitized.ACO_API_KEY).toBe('[REDACTED]');
    expect(sanitized.normalField).toBe('visible-data');
    expect(sanitized.user).toBe('john');
  });

  test('should write logs to appropriate files by level', async () => {
    const { createLogger } = await import('../../../utils/logger.js');

    const errorLogPath = join(TEST_LOGS_DIR, 'error.log');
    const combinedLogPath = join(TEST_LOGS_DIR, 'combined.log');

    const logger = createLogger({
      level: 'info',
      logDir: TEST_LOGS_DIR,
      enableConsole: false
    });

    // Write different log levels
    logger.info('Info message');
    logger.error('Error message');
    logger.warn('Warning message');

    // Wait for Winston to flush logs to files
    // Winston writes asynchronously, so we need adequate time for file I/O
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verify error.log contains only errors
    expect(existsSync(errorLogPath)).toBe(true);
    const errorLogContent = readFileSync(errorLogPath, 'utf-8');
    expect(errorLogContent).toContain('Error message');
    expect(errorLogContent).not.toContain('Info message');

    // Verify combined.log contains all levels
    expect(existsSync(combinedLogPath)).toBe(true);
    const combinedLogContent = readFileSync(combinedLogPath, 'utf-8');
    expect(combinedLogContent).toContain('Info message');
    expect(combinedLogContent).toContain('Error message');
    expect(combinedLogContent).toContain('Warning message');
  });

  test('should handle nested objects with sensitive data', async () => {
    const { sanitizeLogData } = await import('../../../utils/logger.js');

    const nestedData = {
      config: {
        API_KEY: 'secret',
        endpoint: 'https://api.example.com'
      },
      auth: {
        TOKEN: 'bearer-xyz'
      }
    };

    const sanitized = sanitizeLogData(nestedData);

    expect(sanitized.config.API_KEY).toBe('[REDACTED]');
    expect(sanitized.config.endpoint).toBe('https://api.example.com');
    expect(sanitized.auth.TOKEN).toBe('[REDACTED]');
  });

  test('should handle null and undefined values', async () => {
    const { sanitizeLogData } = await import('../../../utils/logger.js');

    expect(sanitizeLogData(null)).toBe(null);
    expect(sanitizeLogData(undefined)).toBe(undefined);
    expect(sanitizeLogData('string')).toBe('string');
    expect(sanitizeLogData(123)).toBe(123);
  });

  test('should handle arrays with sensitive data', async () => {
    const { sanitizeLogData } = await import('../../../utils/logger.js');

    const arrayData = [
      { API_KEY: 'secret1', name: 'user1' },
      { TOKEN: 'secret2', name: 'user2' }
    ];

    const sanitized = sanitizeLogData(arrayData);

    expect(sanitized[0].API_KEY).toBe('[REDACTED]');
    expect(sanitized[0].name).toBe('user1');
    expect(sanitized[1].TOKEN).toBe('[REDACTED]');
    expect(sanitized[1].name).toBe('user2');
  });

  test('should support console logging', async () => {
    const { createLogger } = await import('../../../utils/logger.js');

    const logger = createLogger({
      level: 'info',
      logDir: TEST_LOGS_DIR,
      enableConsole: true
    });

    expect(logger).toBeDefined();
    // Console transport should be added
    expect(logger.transports.length).toBeGreaterThan(2);
  });

  test('should support different log levels', async () => {
    const { createLogger } = await import('../../../utils/logger.js');

    const debugLogger = createLogger({
      level: 'debug',
      logDir: TEST_LOGS_DIR,
      enableConsole: false
    });

    const errorLogger = createLogger({
      level: 'error',
      logDir: TEST_LOGS_DIR,
      enableConsole: false
    });

    expect(debugLogger.level).toBe('debug');
    expect(errorLogger.level).toBe('error');
  });

  test('should create logger with default options', async () => {
    const { createLogger } = await import('../../../utils/logger.js');

    // Test with defaults
    const defaultLogger = createLogger();

    expect(defaultLogger).toBeDefined();
    expect(defaultLogger.level).toBe('info');
    expect(typeof defaultLogger.info).toBe('function');
    expect(typeof defaultLogger.error).toBe('function');
  });

  // Child Logger Tests
  test('should create child logger with inherited context', async () => {
    const { createLogger } = await import('../../../utils/logger.js');

    const parentLogger = createLogger({
      level: 'info',
      logDir: TEST_LOGS_DIR,
      enableConsole: false
    });

    const childLogger = parentLogger.child({ module: 'test-module' });

    expect(childLogger).toBeDefined();
    expect(typeof childLogger.info).toBe('function');
  });

  test('should include parent context in child logger output', async () => {
    const { createLogger } = await import('../../../utils/logger.js');

    const combinedLogPath = join(TEST_LOGS_DIR, 'combined.log');

    const parentLogger = createLogger({
      level: 'info',
      logDir: TEST_LOGS_DIR,
      enableConsole: false
    });

    const childLogger = parentLogger.child({ module: 'batch-processor' });

    childLogger.info('Processing batch');

    // Wait for Winston to flush
    await new Promise((resolve) => setTimeout(resolve, 500));

    const logContent = readFileSync(combinedLogPath, 'utf-8');
    expect(logContent).toContain('Processing batch');
    expect(logContent).toContain('batch-processor');
  });

  test('should support nested child loggers', async () => {
    const { createLogger } = await import('../../../utils/logger.js');

    const parentLogger = createLogger({
      level: 'info',
      logDir: TEST_LOGS_DIR,
      enableConsole: false
    });

    const childLogger = parentLogger.child({ module: 'parent' });
    const grandchildLogger = childLogger.child({ operation: 'process' });

    expect(grandchildLogger).toBeDefined();
    expect(typeof grandchildLogger.info).toBe('function');
  });

  test('should support structured metadata in logs', async () => {
    const { createLogger } = await import('../../../utils/logger.js');

    const combinedLogPath = join(TEST_LOGS_DIR, 'combined.log');

    const logger = createLogger({
      level: 'info',
      logDir: TEST_LOGS_DIR,
      enableConsole: false
    });

    logger.info('Processing items', {
      count: 100,
      batchSize: 10,
      operation: 'sync'
    });

    // Wait for Winston to flush
    await new Promise((resolve) => setTimeout(resolve, 500));

    const logContent = readFileSync(combinedLogPath, 'utf-8');
    const logEntries = logContent.trim().split('\n');
    const lastEntry = JSON.parse(logEntries[logEntries.length - 1]);

    expect(lastEntry.message).toBe('Processing items');
    expect(lastEntry.count).toBe(100);
    expect(lastEntry.batchSize).toBe(10);
    expect(lastEntry.operation).toBe('sync');
  });
});

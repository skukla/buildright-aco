/**
 * Unit tests for ACO Client Wrapper
 * Tests singleton pattern, retry logic, and error handling
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('ACO Client', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Set up test environment variables
    process.env.ACO_API_KEY = 'test-api-key';
    process.env.ACO_ENVIRONMENT_ID = 'test-env-id';
    process.env.ACO_API_BASE_URL = 'https://test.adobe.io';

    // Clear module cache to ensure fresh imports
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  test('should initialize ACO client with valid credentials', async () => {
    const { AcoClient } = await import('../../../utils/aco-client.js');

    const client = AcoClient.getInstance();

    expect(client).toBeDefined();
    expect(client.executeWithRetry).toBeDefined();
    expect(typeof client.executeWithRetry).toBe('function');
  });

  test('should implement singleton pattern', async () => {
    const { AcoClient } = await import('../../../utils/aco-client.js');

    const client1 = AcoClient.getInstance();
    const client2 = AcoClient.getInstance();

    expect(client1).toBe(client2);
  });

  test('should retry on transient failures (429 rate limit)', async () => {
    const { AcoClient } = await import('../../../utils/aco-client.js');

    const client = AcoClient.getInstance();

    let attemptCount = 0;
    const mockOperation = jest.fn().mockImplementation(() => {
      attemptCount++;
      if (attemptCount < 3) {
        const error = new Error('Rate limit exceeded');
        error.status = 429;
        throw error;
      }
      return { success: true, data: 'result' };
    });

    const result = await client.executeWithRetry(mockOperation);

    expect(mockOperation).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ success: true, data: 'result' });
  });

  test('should retry on transient failures (503 service unavailable)', async () => {
    const { AcoClient } = await import('../../../utils/aco-client.js');

    const client = AcoClient.getInstance();

    let attemptCount = 0;
    const mockOperation = jest.fn().mockImplementation(() => {
      attemptCount++;
      if (attemptCount < 2) {
        const error = new Error('Service unavailable');
        error.status = 503;
        throw error;
      }
      return { success: true, data: 'recovered' };
    });

    const result = await client.executeWithRetry(mockOperation);

    expect(mockOperation).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ success: true, data: 'recovered' });
  });

  test('should fail fast on permanent errors (401 unauthorized)', async () => {
    const { AcoClient } = await import('../../../utils/aco-client.js');

    const client = AcoClient.getInstance();

    const mockOperation = jest.fn().mockImplementation(() => {
      const error = new Error('Unauthorized');
      error.status = 401;
      throw error;
    });

    await expect(client.executeWithRetry(mockOperation)).rejects.toThrow('Unauthorized');

    // Should only attempt once for permanent errors
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  test('should fail fast on permanent errors (404 not found)', async () => {
    const { AcoClient } = await import('../../../utils/aco-client.js');

    const client = AcoClient.getInstance();

    const mockOperation = jest.fn().mockImplementation(() => {
      const error = new Error('Not found');
      error.status = 404;
      throw error;
    });

    await expect(client.executeWithRetry(mockOperation)).rejects.toThrow('Not found');

    // Should only attempt once for permanent errors
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  test('should use exponential backoff between retries', async () => {
    const { AcoClient } = await import('../../../utils/aco-client.js');

    const client = AcoClient.getInstance();

    const timestamps = [];
    let attemptCount = 0;

    const mockOperation = jest.fn().mockImplementation(() => {
      timestamps.push(Date.now());
      attemptCount++;
      if (attemptCount < 3) {
        const error = new Error('Rate limit');
        error.status = 429;
        throw error;
      }
      return { success: true };
    });

    await client.executeWithRetry(mockOperation, { maxRetries: 3, initialDelay: 100 });

    expect(timestamps.length).toBe(3);

    // Check that delays increase exponentially (with some tolerance)
    const delay1 = timestamps[1] - timestamps[0];
    const delay2 = timestamps[2] - timestamps[1];

    // Second delay should be roughly 2x the first delay (exponential backoff)
    expect(delay2).toBeGreaterThan(delay1 * 1.5);
  });

  test('should respect maximum retry limit', async () => {
    const { AcoClient } = await import('../../../utils/aco-client.js');

    const client = AcoClient.getInstance();

    const mockOperation = jest.fn().mockImplementation(() => {
      const error = new Error('Service unavailable');
      error.status = 503;
      throw error;
    });

    await expect(
      client.executeWithRetry(mockOperation, { maxRetries: 2, initialDelay: 10 })
    ).rejects.toThrow('Service unavailable');

    // Should try: initial + 2 retries = 3 total attempts
    expect(mockOperation).toHaveBeenCalledTimes(3);
  });

  test('should handle successful operation without retries', async () => {
    const { AcoClient } = await import('../../../utils/aco-client.js');

    const client = AcoClient.getInstance();

    const mockOperation = jest.fn().mockReturnValue({ success: true, data: 'immediate' });

    const result = await client.executeWithRetry(mockOperation);

    expect(mockOperation).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true, data: 'immediate' });
  });

  test('should throw error when required credentials are missing', async () => {
    // Clear credentials
    delete process.env.ACO_API_KEY;
    delete process.env.ACO_ENVIRONMENT_ID;
    delete process.env.ACO_API_BASE_URL;

    jest.resetModules();

    await expect(async () => {
      const { AcoClient } = await import('../../../utils/aco-client.js');
      AcoClient.getInstance();
    }).rejects.toThrow();
  });
});

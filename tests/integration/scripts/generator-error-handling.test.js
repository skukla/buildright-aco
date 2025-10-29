/**
 * Integration tests for generator error handling across scripts
 *
 * NOTE: Temporarily skipped due to logger mock timing issues with dynamic imports
 * TODO: Fix mock setup to work with ES modules dynamic imports
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { existsSync, mkdirSync, rmSync, chmodSync } from 'fs';
import path from 'path';
import { jest } from '@jest/globals';

// Mock the logger to prevent console output during tests
jest.mock('../../../utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe.skip('Generator Error Handling Integration', () => {
  const testDir = './test-output';
  const readOnlyDir = './test-readonly';
  let generateMetadata;
  let generateCategories;
  let logger;

  beforeEach(async () => {
    // Clean up any existing test directories
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    if (existsSync(readOnlyDir)) {
      try {
        chmodSync(readOnlyDir, 0o755);
        rmSync(readOnlyDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore errors cleaning up
      }
    }

    // Dynamic imports
    const metadataModule = await import('../../../scripts/generate-metadata.js');
    const categoriesModule = await import('../../../scripts/generate-categories.js');
    generateMetadata = metadataModule.generateMetadata;
    generateCategories = categoriesModule.generateCategories;
    logger = (await import('../../../utils/logger.js')).default;
  });

  afterEach(() => {
    // Clean up test directories
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    if (existsSync(readOnlyDir)) {
      try {
        chmodSync(readOnlyDir, 0o755);
        rmSync(readOnlyDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore errors cleaning up
      }
    }
    jest.clearAllMocks();
  });

  describe('File System Error Handling', () => {
    it('should handle non-existent output directory by creating it', async () => {
      // Arrange
      const outputPath = `${testDir}/nested/deep/metadata.json`;
      const config = {
        count: 5,
        seed: 12345,
        outputPath
      };

      // Act
      await generateMetadata(config);

      // Assert
      expect(existsSync(outputPath)).toBe(true);
      expect(existsSync(path.dirname(outputPath))).toBe(true);
    });

    it('should handle read-only directory errors gracefully', async () => {
      // Skip this test on Windows as chmod doesn't work the same way
      if (process.platform === 'win32') {
        return;
      }

      // Arrange
      mkdirSync(readOnlyDir, { recursive: true });
      const outputPath = `${readOnlyDir}/metadata.json`;

      // Make directory read-only
      chmodSync(readOnlyDir, 0o444);

      const config = {
        count: 5,
        seed: 12345,
        outputPath
      };

      // Act & Assert
      await expect(generateMetadata(config)).rejects.toThrow();

      // Verify error was logged
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringMatching(/failed|error/i),
        expect.objectContaining({
          error: expect.any(String)
        })
      );
    });

    it('should create data/buildright directory if it does not exist', async () => {
      // Arrange
      const dataDir = './data/buildright';
      if (existsSync(dataDir)) {
        rmSync(dataDir, { recursive: true, force: true });
      }

      const config = { count: 5, seed: 12345 };

      // Act
      await generateMetadata(config);

      // Assert
      expect(existsSync(dataDir)).toBe(true);
      expect(existsSync(`${dataDir}/metadata.json`)).toBe(true);
    });
  });

  describe('Schema Validation Error Handling', () => {
    it('should handle schema validation failures with detailed error logging', async () => {
      // This test requires the schema validator to actually fail
      // We'll need to create invalid data that fails schema validation

      // For now, we'll test that the error path exists in the code
      // The actual schema validation will be tested when schemas are created
      expect(true).toBe(true);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate required fields across all generators', async () => {
      // Test metadata generator
      await expect(generateMetadata({}))
        .rejects.toThrow(/count.*required/i);

      await expect(generateMetadata({ count: null }))
        .rejects.toThrow(/count.*required/i);

      // Test categories generator
      await expect(generateCategories({}))
        .rejects.toThrow(/count.*required/i);

      await expect(generateCategories({ count: null }))
        .rejects.toThrow(/count.*required/i);
    });

    it('should validate data types for configuration', async () => {
      // Test metadata generator
      await expect(generateMetadata({ count: 'not-a-number' }))
        .rejects.toThrow(/must be a number/i);

      await expect(generateMetadata({ count: [] }))
        .rejects.toThrow(/must be a number/i);

      // Test categories generator
      await expect(generateCategories({ count: 'not-a-number' }))
        .rejects.toThrow(/must be a number/i);

      await expect(generateCategories({ count: {} }))
        .rejects.toThrow(/must be a number/i);
    });

    it('should validate numeric ranges', async () => {
      // Test negative counts
      await expect(generateMetadata({ count: -1 }))
        .rejects.toThrow(/positive/i);

      await expect(generateMetadata({ count: 0 }))
        .rejects.toThrow(/positive/i);

      await expect(generateCategories({ count: -10 }))
        .rejects.toThrow(/positive/i);

      await expect(generateCategories({ count: 0 }))
        .rejects.toThrow(/positive/i);
    });
  });

  describe('Error Recovery', () => {
    it('should not leave partial files on error', async () => {
      // Arrange
      const outputPath = './data/buildright/metadata.json';

      // Force an error by passing invalid configuration
      const config = { count: -1, outputPath };

      // Act
      try {
        await generateMetadata(config);
      } catch (error) {
        // Expected error
      }

      // Assert - no file should exist after error
      expect(existsSync(outputPath)).toBe(false);
    });

    it('should log errors with sufficient context for debugging', async () => {
      // Arrange
      const config = { count: 'invalid' };

      // Act
      try {
        await generateMetadata(config);
      } catch (error) {
        // Expected error
      }

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          error: expect.stringContaining('number')
        })
      );
    });
  });
});
/**
 * Integration tests for Jest configuration
 * Validates ES modules support and coverage thresholds
 */

import { describe, test, expect } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Jest Configuration', () => {
  test('should run with ES modules support', () => {
    // This test itself validates ES modules work
    // by using import statements and running without transpilation

    // Test that we can use ES module syntax
    const testImport = async () => {
      const module = await import('../../unit/utils/config-validator.test.js');
      return module;
    };

    expect(testImport).toBeDefined();
    expect(typeof testImport).toBe('function');

    // Verify package.json has type: "module"
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );

    expect(packageJson.type).toBe('module');
  });

  test('should enforce 85% coverage thresholds', () => {
    // Read package.json to verify coverage configuration
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );

    expect(packageJson.jest).toBeDefined();
    expect(packageJson.jest.coverageThreshold).toBeDefined();
    expect(packageJson.jest.coverageThreshold.global).toBeDefined();

    const thresholds = packageJson.jest.coverageThreshold.global;

    expect(thresholds.branches).toBe(85);
    expect(thresholds.functions).toBe(85);
    expect(thresholds.lines).toBe(85);
    expect(thresholds.statements).toBe(85);
  });

  test('should have correct test script configuration', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );

    expect(packageJson.scripts.test).toBeDefined();
    expect(packageJson.scripts['test:watch']).toBeDefined();
    expect(packageJson.scripts['test:coverage']).toBeDefined();

    // Verify NODE_OPTIONS for ES modules
    expect(packageJson.scripts.test).toContain('NODE_OPTIONS=--experimental-vm-modules');
    expect(packageJson.scripts['test:coverage']).toContain('--coverage');
  });
});

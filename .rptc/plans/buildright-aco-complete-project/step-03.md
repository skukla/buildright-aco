# Step 3: Project Structure & Development Environment

## Purpose

Establish a robust, well-organized development environment with proper project structure, comprehensive configuration management, logging infrastructure, and test framework setup. This foundational step ensures all subsequent implementation steps have the necessary tooling and structure to succeed.

**Why this is third:** Steps 1-2 provided analysis and architectural decisions. Now we need the foundational infrastructure before implementing any business logic (Steps 4+).

---

## Prerequisites

- [x] Step 1: Context Analysis & Validation Report completed
- [x] Step 2: MSI Architecture Research & Recommendation completed
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager available
- [ ] Access to ACO sandbox credentials (API key, environment ID)
- [ ] Access to Adobe Commerce backend credentials (optional for integration testing)

---

## Tests to Write First

### Configuration Validation Tests

- [ ] **Test: .env validation detects missing required variables**
  - **Given:** .env file with incomplete ACO credentials
  - **When:** Configuration validator runs
  - **Then:** Throws error with list of missing required variables (ACO_API_KEY, ACO_ENVIRONMENT_ID)
  - **File:** `tests/unit/utils/config-validator.test.js`

- [ ] **Test: .env validation passes with all required variables present**
  - **Given:** .env file with all required credentials (ACO_API_KEY, ACO_ENVIRONMENT_ID, ACO_API_BASE_URL)
  - **When:** Configuration validator runs
  - **Then:** Returns validated config object with no errors
  - **File:** `tests/unit/utils/config-validator.test.js`

- [ ] **Test: Config validator detects invalid URL formats**
  - **Given:** .env file with malformed ACO_API_BASE_URL (missing protocol or invalid format)
  - **When:** Configuration validator runs
  - **Then:** Throws validation error for invalid URL format
  - **File:** `tests/unit/utils/config-validator.test.js`

### Logging Infrastructure Tests

- [ ] **Test: Logger initializes with correct log level from environment**
  - **Given:** LOG_LEVEL=debug in environment
  - **When:** Logger instance created
  - **Then:** Logger configured with debug level, writes to console and file
  - **File:** `tests/unit/utils/logger.test.js`

- [ ] **Test: Logger sanitizes sensitive data from logs**
  - **Given:** Log message containing API_KEY or TOKEN strings
  - **When:** Logger processes message
  - **Then:** Sensitive values replaced with [REDACTED] in output
  - **File:** `tests/unit/utils/logger.test.js`

- [ ] **Test: Logger writes to appropriate log files by level**
  - **Given:** Mixed log levels (info, warn, error)
  - **When:** Multiple log statements executed
  - **Then:** error.log contains only errors, combined.log contains all levels
  - **File:** `tests/unit/utils/logger.test.js`

### Jest Configuration Tests

- [ ] **Test: Jest runs with ES modules support**
  - **Given:** Test file using import statements
  - **When:** npm test executed
  - **Then:** Tests run successfully without ES module errors
  - **File:** `tests/integration/jest-config.test.js`

- [ ] **Test: Jest coverage thresholds enforce 85% minimum**
  - **Given:** Code with 70% coverage (below threshold)
  - **When:** npm run test:coverage executed
  - **Then:** Jest exits with error indicating coverage below threshold
  - **File:** `tests/integration/jest-config.test.js`

---

## Files to Create/Modify

### Configuration Files

- [ ] `package.json` - Initialize Node.js project with dependencies and scripts
- [ ] `.env.dist` - Template for required environment variables with documentation
- [ ] `jest.config.js` - Jest test framework configuration with ES modules support
- [ ] `.claude/settings.json` - Update quality gates setting (qualityGatesEnabled: true)

### Utility Files

- [ ] `utils/config-validator.js` - Environment variable validation and loading
- [ ] `utils/logger.js` - Winston/Pino logging infrastructure with sanitization
- [ ] `utils/index.js` - Barrel export for utility functions

### Directory Structure

- [ ] `scripts/` - Data generation and upload scripts
- [ ] `utils/` - Shared utility functions
- [ ] `tests/unit/` - Unit test directory
- [ ] `tests/integration/` - Integration test directory
- [ ] `tests/e2e/` - End-to-end test directory
- [ ] `data/buildright/` - Generated JSON data files
- [ ] `logs/` - Application log files (gitignored)

### Test Files

- [ ] `tests/unit/utils/config-validator.test.js` - Configuration validation tests
- [ ] `tests/unit/utils/logger.test.js` - Logger infrastructure tests
- [ ] `tests/integration/jest-config.test.js` - Jest configuration validation tests

---

## Implementation Details

### RED Phase (Write failing tests first)

```javascript
// tests/unit/utils/config-validator.test.js
import { describe, it, expect, beforeEach } from '@jest/globals';
import { validateConfig, loadConfig } from '../../../utils/config-validator.js';

describe('Configuration Validator', () => {
  beforeEach(() => {
    // Reset environment before each test
    delete process.env.ACO_API_KEY;
    delete process.env.ACO_ENVIRONMENT_ID;
  });

  describe('validateConfig', () => {
    it('should throw error when required variables missing', () => {
      // Arrange: Empty config
      const config = {};

      // Act & Assert: Expect validation error
      expect(() => validateConfig(config)).toThrow(/required.*ACO_API_KEY/i);
    });

    it('should pass validation with all required variables', () => {
      // Arrange: Complete config
      const config = {
        ACO_API_KEY: 'test-key-123',
        ACO_ENVIRONMENT_ID: 'env-456',
        ACO_API_BASE_URL: 'https://api.adobe.io'
      };

      // Act: Validate
      const result = validateConfig(config);

      // Assert: No errors, returns config
      expect(result).toEqual(config);
    });

    it('should detect invalid URL formats', () => {
      // Arrange: Config with invalid URL
      const config = {
        ACO_API_KEY: 'test-key',
        ACO_ENVIRONMENT_ID: 'env-id',
        ACO_API_BASE_URL: 'not-a-valid-url'
      };

      // Act & Assert: Expect URL validation error
      expect(() => validateConfig(config)).toThrow(/invalid URL/i);
    });
  });

  describe('loadConfig', () => {
    it('should load and validate config from .env file', () => {
      // Arrange: Set environment variables
      process.env.ACO_API_KEY = 'test-key';
      process.env.ACO_ENVIRONMENT_ID = 'test-env';
      process.env.ACO_API_BASE_URL = 'https://api.adobe.io';

      // Act: Load config
      const config = loadConfig();

      // Assert: Config loaded and validated
      expect(config.ACO_API_KEY).toBe('test-key');
      expect(config.ACO_ENVIRONMENT_ID).toBe('test-env');
    });
  });
});

// tests/unit/utils/logger.test.js
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createLogger } from '../../../utils/logger.js';
import fs from 'fs';

describe('Logger Infrastructure', () => {
  let logger;
  const testLogDir = './tests/fixtures/logs';

  beforeEach(() => {
    // Create test log directory
    if (!fs.existsSync(testLogDir)) {
      fs.mkdirSync(testLogDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test logs
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
  });

  describe('Logger initialization', () => {
    it('should initialize with correct log level from environment', () => {
      // Arrange: Set log level
      process.env.LOG_LEVEL = 'debug';

      // Act: Create logger
      logger = createLogger({ logDir: testLogDir });

      // Assert: Logger configured correctly
      expect(logger.level).toBe('debug');
    });
  });

  describe('Sensitive data sanitization', () => {
    it('should sanitize API keys and tokens from log messages', () => {
      // Arrange: Logger and sensitive data
      logger = createLogger({ logDir: testLogDir });
      const sensitiveMessage = 'API_KEY=secret123 TOKEN=xyz789';

      // Act: Log message
      logger.info(sensitiveMessage);

      // Assert: Sensitive data redacted (check log file)
      const logContent = fs.readFileSync(`${testLogDir}/combined.log`, 'utf8');
      expect(logContent).toContain('[REDACTED]');
      expect(logContent).not.toContain('secret123');
      expect(logContent).not.toContain('xyz789');
    });
  });

  describe('Log file management', () => {
    it('should write errors to error.log and all logs to combined.log', () => {
      // Arrange: Logger
      logger = createLogger({ logDir: testLogDir });

      // Act: Log different levels
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      // Assert: Files created and contain appropriate logs
      const errorLog = fs.readFileSync(`${testLogDir}/error.log`, 'utf8');
      const combinedLog = fs.readFileSync(`${testLogDir}/combined.log`, 'utf8');

      expect(errorLog).toContain('Error message');
      expect(errorLog).not.toContain('Info message');
      expect(combinedLog).toContain('Info message');
      expect(combinedLog).toContain('Error message');
    });
  });
});
```

### GREEN Phase (Minimal implementation to pass tests)

1. **Initialize Node.js project**
   ```bash
   npm init -y
   ```

2. **Install dependencies**
   ```bash
   npm install dotenv winston
   npm install --save-dev jest @types/jest
   ```

3. **Create `utils/config-validator.js`**
   ```javascript
   import dotenv from 'dotenv';
   import { URL } from 'url';

   dotenv.config();

   const REQUIRED_VARS = [
     'ACO_API_KEY',
     'ACO_ENVIRONMENT_ID',
     'ACO_API_BASE_URL'
   ];

   export function validateConfig(config) {
     // Check required variables
     const missing = REQUIRED_VARS.filter(key => !config[key]);
     if (missing.length > 0) {
       throw new Error(`Missing required variables: ${missing.join(', ')}`);
     }

     // Validate URL format
     try {
       new URL(config.ACO_API_BASE_URL);
     } catch (error) {
       throw new Error(`Invalid URL format for ACO_API_BASE_URL: ${config.ACO_API_BASE_URL}`);
     }

     return config;
   }

   export function loadConfig() {
     const config = {
       ACO_API_KEY: process.env.ACO_API_KEY,
       ACO_ENVIRONMENT_ID: process.env.ACO_ENVIRONMENT_ID,
       ACO_API_BASE_URL: process.env.ACO_API_BASE_URL || 'https://api.adobe.io',
       LOG_LEVEL: process.env.LOG_LEVEL || 'info'
     };

     return validateConfig(config);
   }
   ```

4. **Create `utils/logger.js`**
   ```javascript
   import winston from 'winston';
   import path from 'path';

   const SENSITIVE_PATTERNS = [
     /API_KEY=([^\s]+)/gi,
     /TOKEN=([^\s]+)/gi,
     /Authorization:\s*([^\s]+)/gi,
     /Bearer\s+([^\s]+)/gi
   ];

   function sanitizeMessage(message) {
     let sanitized = message;
     SENSITIVE_PATTERNS.forEach(pattern => {
       sanitized = sanitized.replace(pattern, (match, group) =>
         match.replace(group, '[REDACTED]')
       );
     });
     return sanitized;
   }

   export function createLogger(options = {}) {
     const logDir = options.logDir || './logs';
     const logLevel = process.env.LOG_LEVEL || 'info';

     const logger = winston.createLogger({
       level: logLevel,
       format: winston.format.combine(
         winston.format.timestamp(),
         winston.format.errors({ stack: true }),
         winston.format.printf(info => {
           const sanitizedMessage = sanitizeMessage(info.message);
           return `${info.timestamp} ${info.level}: ${sanitizedMessage}`;
         })
       ),
       transports: [
         new winston.transports.File({
           filename: path.join(logDir, 'error.log'),
           level: 'error'
         }),
         new winston.transports.File({
           filename: path.join(logDir, 'combined.log')
         }),
         new winston.transports.Console({
           format: winston.format.simple()
         })
       ]
     });

     return logger;
   }
   ```

5. **Create `.env.dist`**
   ```bash
   # Adobe Commerce Optimizer (ACO) API Configuration
   # Required for product catalog and pricing data ingestion

   # ACO API Key (obtain from Adobe Developer Console)
   ACO_API_KEY=your-aco-api-key-here

   # ACO Environment ID (your ACO environment identifier)
   ACO_ENVIRONMENT_ID=your-environment-id-here

   # ACO API Base URL (default: https://api.adobe.io)
   ACO_API_BASE_URL=https://api.adobe.io

   # Adobe Commerce Backend Configuration (optional)
   # Required only for integration testing with Adobe Commerce Admin

   # Adobe Commerce Admin URL
   ADOBE_COMMERCE_ADMIN_URL=https://your-store.adobe-commerce.com/admin

   # Adobe Commerce API Token (for MSI source/stock management)
   ADOBE_COMMERCE_API_TOKEN=your-admin-api-token-here

   # Logging Configuration

   # Log level: error, warn, info, debug (default: info)
   LOG_LEVEL=info

   # Testing Configuration

   # Enable integration tests (requires ACO sandbox access)
   ENABLE_INTEGRATION_TESTS=false

   # Enable E2E tests (requires full Adobe Commerce + ACO environment)
   ENABLE_E2E_TESTS=false
   ```

6. **Create `jest.config.js`**
   ```javascript
   export default {
     testEnvironment: 'node',
     transform: {},
     extensionsToTreatAsEsm: ['.js'],
     moduleNameMapper: {
       '^(\\.{1,2}/.*)\\.js$': '$1'
     },
     testMatch: [
       '**/tests/**/*.test.js'
     ],
     collectCoverageFrom: [
       'utils/**/*.js',
       'scripts/**/*.js',
       '!**/node_modules/**',
       '!**/tests/**'
     ],
     coverageThreshold: {
       global: {
         branches: 85,
         functions: 85,
         lines: 85,
         statements: 85
       }
     },
     coverageDirectory: 'coverage',
     verbose: true
   };
   ```

7. **Update `package.json` with scripts**
   ```json
   {
     "name": "buildright-aco-complete-project",
     "version": "1.0.0",
     "type": "module",
     "description": "BuildRight ACO catalog data ingestion with MSI support",
     "scripts": {
       "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
       "test:watch": "npm test -- --watch",
       "test:coverage": "npm test -- --coverage",
       "test:unit": "npm test -- tests/unit",
       "test:integration": "npm test -- tests/integration",
       "test:e2e": "npm test -- tests/e2e",
       "generate:products": "node scripts/generate-products.js",
       "generate:inventory": "node scripts/generate-inventory.js",
       "generate:prices": "node scripts/generate-prices.js",
       "generate:all": "npm run generate:products && npm run generate:inventory && npm run generate:prices",
       "validate:data": "node scripts/validate-data.js",
       "upload:products": "node scripts/upload-products.js",
       "upload:inventory": "node scripts/upload-inventory.js",
       "upload:prices": "node scripts/upload-prices.js",
       "upload:all": "npm run upload:products && npm run upload:inventory && npm run upload:prices"
     },
     "dependencies": {
       "dotenv": "^16.3.1",
       "winston": "^3.11.0"
     },
     "devDependencies": {
       "jest": "^29.7.0",
       "@types/jest": "^29.5.11"
     }
   }
   ```

8. **Update `.claude/settings.json`**
   ```json
   {
     "defaultThinkingMode": "think",
     "artifactLocation": ".rptc",
     "docsLocation": "docs",
     "testCoverageTarget": 85,
     "customSopPath": ".rptc/sop",
     "qualityGatesEnabled": true
   }
   ```

9. **Create directory structure**
   ```bash
   mkdir -p scripts utils tests/{unit,integration,e2e} data/buildright logs
   ```

10. **Verify tests pass**
    ```bash
    npm test
    ```

### REFACTOR Phase (Improve while keeping tests green)

1. **Create utility barrel export**
   - Create `utils/index.js` to export all utilities
   - Simplifies imports in other modules

2. **Add JSDoc documentation**
   - Document all exported functions
   - Include parameter types and return values
   - Add usage examples

3. **Enhance error messages**
   - Provide actionable error messages in config validator
   - Include instructions for obtaining missing credentials
   - Link to documentation where applicable

4. **Improve test coverage**
   - Add edge case tests (empty strings, whitespace)
   - Test environment variable overrides
   - Test logger file rotation (if implemented)

5. **Update .gitignore**
   - Ensure logs/ directory ignored
   - Verify coverage/ directory ignored
   - Add data/buildright/*.json (generated files)

---

## Expected Outcome

After completing this step:

- **Package.json configured** with all dependencies, ES module support, and organized npm scripts
- **.env.dist template** provides comprehensive documentation of all required credentials
- **Configuration validator** ensures required environment variables present and valid
- **Logger infrastructure** operational with Winston, sensitive data sanitization, and file outputs
- **Jest test framework** configured with ES modules support and 85% coverage enforcement
- **Quality gates enabled** in settings for efficiency and security reviews
- **Directory structure** established for scripts, utilities, tests, and data files
- **All tests passing** (11 tests: 3 config validator + 3 logger + 2 Jest config + 3 edge cases)
- **Development environment ready** for implementing business logic in Steps 4+

---

## Acceptance Criteria

- [ ] All tests passing for config validator (validateConfig, loadConfig functions)
- [ ] All tests passing for logger (initialization, sanitization, file management)
- [ ] All tests passing for Jest configuration validation
- [ ] npm test runs successfully with ES modules support
- [ ] npm run test:coverage enforces 85% threshold
- [ ] .env.dist includes all required variables with documentation
- [ ] Logger sanitizes API_KEY, TOKEN, Authorization headers from logs
- [ ] Configuration validator throws clear errors for missing/invalid variables
- [ ] Quality gates enabled in .claude/settings.json
- [ ] Directory structure created (scripts/, utils/, tests/, data/, logs/)
- [ ] package.json includes all organized npm scripts (generate, upload, test)
- [ ] Code follows ES module patterns (import/export)
- [ ] No debug code (console.log removed or replaced with logger)
- [ ] Coverage ≥ 85% for utils/config-validator.js and utils/logger.js
- [ ] .gitignore updated to exclude logs, .env, generated data files

---

## Dependencies from Other Steps

**Depends on:**
- Step 1: Context Analysis (informs required credentials)
- Step 2: MSI Architecture Research (informs configuration needs)

**Steps that depend on this step:**
- Step 4-20: All subsequent steps require this development environment
- Specifically: Steps 4-8 (generators) use logger and config validator
- Steps 9-12 (uploaders) use config validator for API credentials

---

## Estimated Time

**3-4 hours**

- Package initialization and dependency installation: 0.5 hours
- Configuration validator implementation (TDD): 1 hour
- Logger infrastructure implementation (TDD): 1.5 hours
- Jest configuration and validation: 0.5 hours
- Documentation and refinement: 0.5-1 hour

---

## Implementation Notes

**Key Considerations:**

1. **ES Modules:** Project uses ES modules (import/export), Jest requires experimental flag
2. **Security:** Never commit .env file; always use .env.dist as template
3. **Logging:** Winston chosen over Pino for simpler configuration and broader adoption
4. **Coverage:** 85% enforced globally; critical utilities should achieve 100%
5. **Quality Gates:** Enabled for production-ready code; requires PM approval after efficiency/security reviews

**NPM Script Organization:**
- **test:** commands for running tests
- **generate:** commands for data generation
- **upload:** commands for ACO upload
- **validate:** commands for data validation

**Reference SOPs:**
- `testing-guide.md` (SOP) - For TDD methodology and Jest configuration
- `security-and-performance.md` (SOP) - For secure configuration management
- `architecture-patterns.md` (SOP) - For utility organization patterns

**Winston vs Pino Decision:**
- Winston: Simpler configuration, synchronous by default, broader community
- Pino: Higher performance, async by default, JSON-first
- **Recommendation:** Winston for simplicity and demo project scope

---

_Step 3 ready for TDD implementation._

# Step 4: Core Utilities & Shared Libraries

## Purpose
Create foundational utility modules that will be reused across all data synchronization operations: ACO client wrapper with retry logic, batch processor, error handling, schema validation, logging, and configuration management.

## Prerequisites
- [x] Step 3: Project Structure & Development Environment completed
- [ ] Jest configuration verified
- [ ] @adobe-commerce/aco-ts-sdk installed
- [ ] Environment variables configured in .env

---

## Tests to Write First

### ACO Client Wrapper Tests

- [ ] **Test: ACO client initializes with valid credentials**
  - **Given:** Valid organization ID and API key in environment
  - **When:** AcoClient.getInstance() is called
  - **Then:** Returns initialized client instance with proper authentication
  - **File:** `tests/unit/utils/aco-client.test.js`

- [ ] **Test: Client retries on transient failures**
  - **Given:** ACO API returns 429 rate limit error
  - **When:** Client makes API call
  - **Then:** Retries with exponential backoff (3 attempts), succeeds on retry
  - **File:** `tests/unit/utils/aco-client.test.js`

- [ ] **Test: Client fails fast on permanent errors**
  - **Given:** ACO API returns 401 unauthorized error
  - **When:** Client makes API call
  - **Then:** Throws authentication error immediately without retry
  - **File:** `tests/unit/utils/aco-client.test.js`

### Batch Processor Tests

- [ ] **Test: Batch processor handles successful batch operations**
  - **Given:** Array of 250 items to process in batches of 100
  - **When:** BatchProcessor.process() is called
  - **Then:** Processes 3 batches sequentially, reports progress, returns results
  - **File:** `tests/unit/utils/batch-processor.test.js`

- [ ] **Test: Batch processor handles partial failures**
  - **Given:** Batch 2 of 3 fails with retryable error
  - **When:** Batch processing executes
  - **Then:** Batch 2 retries successfully, all batches complete, reports 1 retry
  - **File:** `tests/unit/utils/batch-processor.test.js`

- [ ] **Test: Batch processor reports progress correctly**
  - **Given:** Progress callback function provided
  - **When:** Processing 5 batches
  - **Then:** Callback invoked with progress (20%, 40%, 60%, 80%, 100%)
  - **File:** `tests/unit/utils/batch-processor.test.js`

### Error Handler Tests

- [ ] **Test: Error handler categorizes ACO API errors**
  - **Given:** Various ACO API error responses (400, 401, 404, 429, 500)
  - **When:** ErrorHandler.categorize() is called
  - **Then:** Correctly categorizes as ValidationError, AuthError, NotFoundError, RateLimitError, ServerError
  - **File:** `tests/unit/utils/error-handler.test.js`

- [ ] **Test: Error handler determines retry eligibility**
  - **Given:** Mix of retryable (429, 503) and non-retryable (401, 404) errors
  - **When:** ErrorHandler.isRetryable() is called
  - **Then:** Returns true for 429/503, false for 401/404
  - **File:** `tests/unit/utils/error-handler.test.js`

- [ ] **Test: Error handler formats error messages**
  - **Given:** ACO API error with nested details
  - **When:** ErrorHandler.format() is called
  - **Then:** Returns structured error with category, message, retryable flag, original error
  - **File:** `tests/unit/utils/error-handler.test.js`

### Schema Validator Tests

- [ ] **Test: Validator validates product schema**
  - **Given:** Valid and invalid product data objects
  - **When:** SchemaValidator.validateProduct() is called
  - **Then:** Valid data passes, invalid data throws ValidationError with field details
  - **File:** `tests/unit/utils/schema-validator.test.js`

- [ ] **Test: Validator validates category schema**
  - **Given:** Category data with required fields (id, name, parent_id)
  - **When:** SchemaValidator.validateCategory() is called
  - **Then:** Validates required fields, type constraints, nesting rules
  - **File:** `tests/unit/utils/schema-validator.test.js`

- [ ] **Test: Validator validates inventory schema**
  - **Given:** MSI inventory data with source codes and quantities
  - **When:** SchemaValidator.validateInventory() is called
  - **Then:** Validates source_code format, quantity ranges, SKU references
  - **File:** `tests/unit/utils/schema-validator.test.js`

### Logging Utility Tests

- [ ] **Test: Logger writes to correct levels**
  - **Given:** Logger configured with INFO level
  - **When:** log.debug(), log.info(), log.warn(), log.error() are called
  - **Then:** Only INFO, WARN, ERROR messages written (DEBUG suppressed)
  - **File:** `tests/unit/utils/logger.test.js`

- [ ] **Test: Logger formats structured logs**
  - **Given:** Log message with metadata object
  - **When:** log.info('message', { key: 'value' }) is called
  - **Then:** Output includes timestamp, level, message, metadata as JSON
  - **File:** `tests/unit/utils/logger.test.js`

- [ ] **Test: Logger creates child loggers with context**
  - **Given:** Parent logger for 'sync' operation
  - **When:** logger.child('products') is called
  - **Then:** Child logger includes parent context in all messages
  - **File:** `tests/unit/utils/logger.test.js`

### Configuration Loader Tests

- [ ] **Test: Config loader validates required fields**
  - **Given:** .env file missing ACO_ORG_ID
  - **When:** ConfigLoader.load() is called
  - **Then:** Throws ConfigurationError with missing field details
  - **File:** `tests/unit/utils/config-loader.test.js`

- [ ] **Test: Config loader applies default values**
  - **Given:** .env file without BATCH_SIZE specified
  - **When:** ConfigLoader.load() is called
  - **Then:** Returns config with default BATCH_SIZE = 100
  - **File:** `tests/unit/utils/config-loader.test.js`

- [ ] **Test: Config loader validates data types**
  - **Given:** BATCH_SIZE set to non-numeric value
  - **When:** ConfigLoader.load() is called
  - **Then:** Throws ConfigurationError indicating type mismatch
  - **File:** `tests/unit/utils/config-loader.test.js`

---

## Files to Create/Modify

- [ ] `src/utils/aco-client.js` - Singleton ACO client wrapper with retry logic
- [ ] `src/utils/batch-processor.js` - Generic batch processing utility
- [ ] `src/utils/error-handler.js` - Error categorization and formatting
- [ ] `src/utils/schema-validator.js` - Schema validation for ACO entities
- [ ] `src/utils/logger.js` - Structured logging utility
- [ ] `src/utils/config-loader.js` - Environment configuration loader
- [ ] `tests/unit/utils/aco-client.test.js` - ACO client tests
- [ ] `tests/unit/utils/batch-processor.test.js` - Batch processor tests
- [ ] `tests/unit/utils/error-handler.test.js` - Error handler tests
- [ ] `tests/unit/utils/schema-validator.test.js` - Schema validator tests
- [ ] `tests/unit/utils/logger.test.js` - Logger tests
- [ ] `tests/unit/utils/config-loader.test.js` - Config loader tests

---

## Implementation Details

### RED Phase (Write Failing Tests)

Create comprehensive test suites for each utility module:

```javascript
// tests/unit/utils/aco-client.test.js
import { AcoClient } from '../../../src/utils/aco-client.js';

describe('AcoClient', () => {
  beforeEach(() => {
    process.env.ACO_ORG_ID = 'test-org';
    process.env.ACO_API_KEY = 'test-key';
  });

  describe('getInstance', () => {
    it('should initialize with valid credentials', () => {
      const client = AcoClient.getInstance();
      expect(client).toBeDefined();
      expect(client.organizationId).toBe('test-org');
    });

    it('should return same instance on multiple calls (singleton)', () => {
      const client1 = AcoClient.getInstance();
      const client2 = AcoClient.getInstance();
      expect(client1).toBe(client2);
    });
  });

  describe('retry logic', () => {
    it('should retry on transient failures with exponential backoff', async () => {
      const client = AcoClient.getInstance();
      const mockFn = jest.fn()
        .mockRejectedValueOnce({ status: 429, message: 'Rate limit' })
        .mockRejectedValueOnce({ status: 429, message: 'Rate limit' })
        .mockResolvedValueOnce({ data: 'success' });

      const result = await client.executeWithRetry(mockFn);

      expect(mockFn).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ data: 'success' });
    });

    it('should fail fast on permanent errors', async () => {
      const client = AcoClient.getInstance();
      const mockFn = jest.fn()
        .mockRejectedValue({ status: 401, message: 'Unauthorized' });

      await expect(client.executeWithRetry(mockFn))
        .rejects.toThrow('Unauthorized');

      expect(mockFn).toHaveBeenCalledTimes(1); // No retries
    });
  });
});

// tests/unit/utils/batch-processor.test.js
import { BatchProcessor } from '../../../src/utils/batch-processor.js';

describe('BatchProcessor', () => {
  it('should process items in batches with progress reporting', async () => {
    const items = Array.from({ length: 250 }, (_, i) => i);
    const processFn = jest.fn(batch => Promise.resolve(batch.map(x => x * 2)));
    const progressFn = jest.fn();

    const processor = new BatchProcessor({
      batchSize: 100,
      onProgress: progressFn
    });

    const results = await processor.process(items, processFn);

    expect(results).toHaveLength(250);
    expect(processFn).toHaveBeenCalledTimes(3); // 3 batches
    expect(progressFn).toHaveBeenCalledWith(
      expect.objectContaining({ percent: 100, completed: 250, total: 250 })
    );
  });

  it('should handle partial batch failures with retry', async () => {
    const items = [1, 2, 3, 4, 5];
    const processFn = jest.fn()
      .mockResolvedValueOnce([1, 2]) // Batch 1 success
      .mockRejectedValueOnce(new Error('Transient failure')) // Batch 2 fails
      .mockResolvedValueOnce([3, 4, 5]); // Batch 2 retry success

    const processor = new BatchProcessor({ batchSize: 2 });
    const results = await processor.process(items, processFn);

    expect(results).toHaveLength(5);
    expect(processFn).toHaveBeenCalledTimes(3); // 2 batches + 1 retry
  });
});

// tests/unit/utils/error-handler.test.js
import { ErrorHandler, ErrorCategory } from '../../../src/utils/error-handler.js';

describe('ErrorHandler', () => {
  it('should categorize ACO API errors correctly', () => {
    expect(ErrorHandler.categorize({ status: 400 }))
      .toBe(ErrorCategory.VALIDATION);
    expect(ErrorHandler.categorize({ status: 401 }))
      .toBe(ErrorCategory.AUTHENTICATION);
    expect(ErrorHandler.categorize({ status: 429 }))
      .toBe(ErrorCategory.RATE_LIMIT);
    expect(ErrorHandler.categorize({ status: 500 }))
      .toBe(ErrorCategory.SERVER);
  });

  it('should determine retry eligibility', () => {
    expect(ErrorHandler.isRetryable({ status: 429 })).toBe(true);
    expect(ErrorHandler.isRetryable({ status: 503 })).toBe(true);
    expect(ErrorHandler.isRetryable({ status: 401 })).toBe(false);
    expect(ErrorHandler.isRetryable({ status: 404 })).toBe(false);
  });

  it('should format errors with structured details', () => {
    const error = { status: 400, message: 'Invalid SKU', details: { field: 'sku' } };
    const formatted = ErrorHandler.format(error);

    expect(formatted).toMatchObject({
      category: ErrorCategory.VALIDATION,
      message: 'Invalid SKU',
      retryable: false,
      details: { field: 'sku' }
    });
  });
});

// Similar test structures for schema-validator, logger, and config-loader
```

### GREEN Phase (Minimal Implementation)

Create implementation files that pass all tests:

**1. ACO Client Wrapper (`src/utils/aco-client.js`)**
```javascript
import { AdobeCommerceOrderClient } from '@adobe-commerce/aco-ts-sdk';
import { ErrorHandler } from './error-handler.js';
import { logger } from './logger.js';

export class AcoClient {
  static #instance = null;

  constructor(organizationId, apiKey) {
    this.organizationId = organizationId;
    this.client = new AdobeCommerceOrderClient(organizationId, apiKey);
    this.maxRetries = 3;
    this.retryDelay = 1000; // Start with 1 second
  }

  static getInstance() {
    if (!AcoClient.#instance) {
      const orgId = process.env.ACO_ORG_ID;
      const apiKey = process.env.ACO_API_KEY;

      if (!orgId || !apiKey) {
        throw new Error('ACO credentials not configured');
      }

      AcoClient.#instance = new AcoClient(orgId, apiKey);
    }
    return AcoClient.#instance;
  }

  async executeWithRetry(fn, attempt = 1) {
    try {
      return await fn();
    } catch (error) {
      const isRetryable = ErrorHandler.isRetryable(error);

      if (!isRetryable || attempt >= this.maxRetries) {
        logger.error('Request failed', { error, attempt, retryable: isRetryable });
        throw error;
      }

      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      logger.warn(`Retry attempt ${attempt + 1} after ${delay}ms`, { error });

      await new Promise(resolve => setTimeout(resolve, delay));
      return this.executeWithRetry(fn, attempt + 1);
    }
  }

  async getProducts(params) {
    return this.executeWithRetry(() => this.client.getProducts(params));
  }

  async getCategories(params) {
    return this.executeWithRetry(() => this.client.getCategories(params));
  }

  async getInventory(params) {
    return this.executeWithRetry(() => this.client.getInventory(params));
  }
}
```

**2. Batch Processor (`src/utils/batch-processor.js`)**
```javascript
import { logger } from './logger.js';

export class BatchProcessor {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 100;
    this.onProgress = options.onProgress || (() => {});
    this.maxRetries = options.maxRetries || 3;
  }

  async process(items, processFn) {
    const batches = this.createBatches(items);
    const results = [];
    let completed = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      try {
        const batchResults = await this.processBatchWithRetry(batch, processFn);
        results.push(...batchResults);
        completed += batch.length;

        this.onProgress({
          batch: i + 1,
          totalBatches: batches.length,
          completed,
          total: items.length,
          percent: Math.round((completed / items.length) * 100)
        });
      } catch (error) {
        logger.error(`Batch ${i + 1} failed after retries`, { error, batchSize: batch.length });
        throw error;
      }
    }

    return results;
  }

  createBatches(items) {
    const batches = [];
    for (let i = 0; i < items.length; i += this.batchSize) {
      batches.push(items.slice(i, i + this.batchSize));
    }
    return batches;
  }

  async processBatchWithRetry(batch, processFn, attempt = 1) {
    try {
      return await processFn(batch);
    } catch (error) {
      if (attempt >= this.maxRetries) {
        throw error;
      }

      logger.warn(`Batch processing retry ${attempt + 1}`, { batchSize: batch.length });
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      return this.processBatchWithRetry(batch, processFn, attempt + 1);
    }
  }
}
```

**3. Error Handler (`src/utils/error-handler.js`)**
```javascript
export const ErrorCategory = {
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  RATE_LIMIT: 'rate_limit',
  SERVER: 'server',
  NETWORK: 'network',
  UNKNOWN: 'unknown'
};

export class ErrorHandler {
  static categorize(error) {
    const status = error.status || error.statusCode;

    if (status === 400) return ErrorCategory.VALIDATION;
    if (status === 401) return ErrorCategory.AUTHENTICATION;
    if (status === 403) return ErrorCategory.AUTHORIZATION;
    if (status === 404) return ErrorCategory.NOT_FOUND;
    if (status === 429) return ErrorCategory.RATE_LIMIT;
    if (status >= 500) return ErrorCategory.SERVER;
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return ErrorCategory.NETWORK;
    }

    return ErrorCategory.UNKNOWN;
  }

  static isRetryable(error) {
    const category = this.categorize(error);
    return [
      ErrorCategory.RATE_LIMIT,
      ErrorCategory.SERVER,
      ErrorCategory.NETWORK
    ].includes(category);
  }

  static format(error) {
    const category = this.categorize(error);
    const retryable = this.isRetryable(error);

    return {
      category,
      message: error.message || 'Unknown error',
      retryable,
      status: error.status || error.statusCode,
      details: error.details || error.response?.data,
      originalError: error
    };
  }
}
```

**4. Schema Validator (`src/utils/schema-validator.js`)**
```javascript
export class ValidationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

export class SchemaValidator {
  static validateProduct(data) {
    this.required(data, 'sku', 'string');
    this.required(data, 'name', 'string');

    if (data.price !== undefined && typeof data.price !== 'number') {
      throw new ValidationError('Price must be a number', 'price', data.price);
    }

    if (data.price !== undefined && data.price < 0) {
      throw new ValidationError('Price cannot be negative', 'price', data.price);
    }

    return true;
  }

  static validateCategory(data) {
    this.required(data, 'id', 'string');
    this.required(data, 'name', 'string');

    if (data.parent_id !== undefined && typeof data.parent_id !== 'string') {
      throw new ValidationError('parent_id must be a string', 'parent_id', data.parent_id);
    }

    return true;
  }

  static validateInventory(data) {
    this.required(data, 'sku', 'string');
    this.required(data, 'source_code', 'string');
    this.required(data, 'quantity', 'number');

    if (data.quantity < 0) {
      throw new ValidationError('Quantity cannot be negative', 'quantity', data.quantity);
    }

    return true;
  }

  static required(data, field, type) {
    if (data[field] === undefined || data[field] === null) {
      throw new ValidationError(`${field} is required`, field, data[field]);
    }

    if (type && typeof data[field] !== type) {
      throw new ValidationError(
        `${field} must be of type ${type}`,
        field,
        data[field]
      );
    }
  }
}
```

**5. Logger (`src/utils/logger.js`)**
```javascript
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

class Logger {
  constructor(context = '', level = 'INFO') {
    this.context = context;
    this.level = LOG_LEVELS[level] || LOG_LEVELS.INFO;
  }

  debug(message, metadata = {}) {
    this.log('DEBUG', message, metadata);
  }

  info(message, metadata = {}) {
    this.log('INFO', message, metadata);
  }

  warn(message, metadata = {}) {
    this.log('WARN', message, metadata);
  }

  error(message, metadata = {}) {
    this.log('ERROR', message, metadata);
  }

  log(level, message, metadata) {
    if (LOG_LEVELS[level] < this.level) {
      return; // Suppress logs below configured level
    }

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...metadata
    };

    const output = JSON.stringify(entry);

    if (level === 'ERROR') {
      console.error(output);
    } else if (level === 'WARN') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  child(childContext) {
    const fullContext = this.context
      ? `${this.context}:${childContext}`
      : childContext;
    return new Logger(fullContext, Object.keys(LOG_LEVELS).find(k => LOG_LEVELS[k] === this.level));
  }
}

export const logger = new Logger('aco-sync', process.env.LOG_LEVEL || 'INFO');
```

**6. Configuration Loader (`src/utils/config-loader.js`)**
```javascript
export class ConfigurationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ConfigurationError';
    this.field = field;
  }
}

export class ConfigLoader {
  static load() {
    const config = {
      acoOrgId: this.requireEnv('ACO_ORG_ID'),
      acoApiKey: this.requireEnv('ACO_API_KEY'),
      batchSize: this.getNumber('BATCH_SIZE', 100),
      maxRetries: this.getNumber('MAX_RETRIES', 3),
      logLevel: this.getEnv('LOG_LEVEL', 'INFO'),
      enableProgressReporting: this.getBoolean('ENABLE_PROGRESS', true)
    };

    this.validate(config);
    return config;
  }

  static requireEnv(key) {
    const value = process.env[key];
    if (!value) {
      throw new ConfigurationError(`Missing required environment variable: ${key}`, key);
    }
    return value;
  }

  static getEnv(key, defaultValue) {
    return process.env[key] || defaultValue;
  }

  static getNumber(key, defaultValue) {
    const value = process.env[key];
    if (!value) return defaultValue;

    const num = Number(value);
    if (isNaN(num)) {
      throw new ConfigurationError(`${key} must be a number, got: ${value}`, key);
    }
    return num;
  }

  static getBoolean(key, defaultValue) {
    const value = process.env[key];
    if (!value) return defaultValue;

    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    throw new ConfigurationError(`${key} must be 'true' or 'false', got: ${value}`, key);
  }

  static validate(config) {
    if (config.batchSize < 1 || config.batchSize > 1000) {
      throw new ConfigurationError('BATCH_SIZE must be between 1 and 1000', 'BATCH_SIZE');
    }

    if (config.maxRetries < 0 || config.maxRetries > 10) {
      throw new ConfigurationError('MAX_RETRIES must be between 0 and 10', 'MAX_RETRIES');
    }

    return true;
  }
}
```

### REFACTOR Phase

After all tests pass:

1. **Extract Common Patterns**
   - Review retry logic - ensure consistent across ACO client and batch processor
   - Extract delay calculation to shared utility if reused

2. **Improve Error Messages**
   - Add context-specific error messages in validators
   - Include suggestions for common configuration errors

3. **Optimize Performance**
   - Consider batch processor memory usage for large datasets
   - Add streaming option for very large item sets (future enhancement)

4. **Code Quality**
   - Ensure all functions have clear single responsibilities
   - Add JSDoc comments for public methods
   - Verify consistent naming conventions

5. **DRY Principle**
   - Check for duplicated validation logic
   - Consider shared base validator class if patterns emerge

---

## Expected Outcome

After completing this step:

- **6 utility modules** created with comprehensive functionality
- **All unit tests passing** (18+ test scenarios)
- **Reusable infrastructure** for subsequent data sync steps
- **Error handling** standardized across project
- **Configuration** validated on startup
- **Logging** consistent and structured for debugging

**Capabilities Enabled:**
- Reliable ACO API communication with automatic retry
- Efficient batch processing with progress tracking
- Comprehensive error categorization and formatting
- Schema validation for data integrity
- Structured logging for operations monitoring
- Type-safe configuration management

---

## Acceptance Criteria

- [ ] All unit tests passing (minimum 18 test cases)
- [ ] Code coverage ≥ 90% for utility modules (critical shared code)
- [ ] ACO client successfully retries transient failures (verified in tests)
- [ ] Batch processor handles 1000+ items without memory issues
- [ ] Error handler categorizes all HTTP status codes correctly
- [ ] Schema validators reject invalid data with clear messages
- [ ] Logger outputs structured JSON format
- [ ] Configuration loader validates all required environment variables
- [ ] No console.log statements (all logging via logger utility)
- [ ] All exports use ES modules (import/export syntax)
- [ ] JSDoc comments on all public methods
- [ ] Code follows project style guide

---

## Estimated Time

**4-6 hours**

- Test writing: 2 hours
- Implementation: 2-3 hours
- Refactoring & documentation: 1 hour

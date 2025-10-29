/**
 * Unit tests for Batch Processor
 * Tests batch processing, progress reporting, and error handling
 */

import { describe, test, expect, jest } from '@jest/globals';

describe('Batch Processor', () => {
  test('should process items in batches successfully', async () => {
    const { BatchProcessor } = await import('../../../utils/batch-processor.js');

    const items = Array.from({ length: 10 }, (_, i) => ({ id: i }));
    const batchSize = 3;
    const processedItems = [];

    const processFn = jest.fn().mockImplementation((batch) => {
      processedItems.push(...batch);
      return Promise.resolve({ success: true, processed: batch.length });
    });

    const result = await BatchProcessor.process(items, batchSize, processFn);

    expect(result.totalProcessed).toBe(10);
    expect(result.successCount).toBe(10);
    expect(result.failureCount).toBe(0);
    expect(processedItems.length).toBe(10);

    // Should process in batches: 3, 3, 3, 1
    expect(processFn).toHaveBeenCalledTimes(4);
  });

  test('should handle partial failures in batches', async () => {
    const { BatchProcessor } = await import('../../../utils/batch-processor.js');

    const items = Array.from({ length: 5 }, (_, i) => ({ id: i }));
    const batchSize = 2;

    let batchCount = 0;
    const processFn = jest.fn().mockImplementation((batch) => {
      batchCount++;
      // Fail second batch
      if (batchCount === 2) {
        throw new Error('Batch processing failed');
      }
      return Promise.resolve({ success: true, processed: batch.length });
    });

    const result = await BatchProcessor.process(items, batchSize, processFn);

    expect(result.totalProcessed).toBe(5);
    expect(result.successCount).toBe(3); // First batch (2) + Third batch (1)
    expect(result.failureCount).toBe(2); // Second batch failed (2 items)
    expect(result.errors).toBeDefined();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should report progress via callback', async () => {
    const { BatchProcessor } = await import('../../../utils/batch-processor.js');

    const items = Array.from({ length: 8 }, (_, i) => ({ id: i }));
    const batchSize = 3;
    const progressUpdates = [];

    const processFn = jest.fn().mockResolvedValue({ success: true });

    const onProgress = jest.fn().mockImplementation((progress) => {
      progressUpdates.push(progress);
    });

    await BatchProcessor.process(items, batchSize, processFn, { onProgress });

    expect(onProgress).toHaveBeenCalled();
    expect(progressUpdates.length).toBeGreaterThan(0);

    // Check that progress updates contain expected fields
    progressUpdates.forEach((progress) => {
      expect(progress).toHaveProperty('processed');
      expect(progress).toHaveProperty('total');
      expect(progress).toHaveProperty('percentage');
    });

    // Last progress should show 100%
    const lastProgress = progressUpdates[progressUpdates.length - 1];
    expect(lastProgress.processed).toBe(8);
    expect(lastProgress.total).toBe(8);
    expect(lastProgress.percentage).toBe(100);
  });

  test('should process batches sequentially', async () => {
    const { BatchProcessor } = await import('../../../utils/batch-processor.js');

    const items = Array.from({ length: 6 }, (_, i) => ({ id: i }));
    const batchSize = 2;
    const executionOrder = [];

    const processFn = jest.fn().mockImplementation(async (batch) => {
      const batchId = batch[0].id;
      executionOrder.push(`start-${batchId}`);
      await new Promise((resolve) => setTimeout(resolve, 50));
      executionOrder.push(`end-${batchId}`);
      return { success: true };
    });

    await BatchProcessor.process(items, batchSize, processFn);

    // Verify sequential execution: each batch completes before next starts
    expect(executionOrder).toEqual([
      'start-0',
      'end-0',
      'start-2',
      'end-2',
      'start-4',
      'end-4'
    ]);
  });

  test('should handle empty input array', async () => {
    const { BatchProcessor } = await import('../../../utils/batch-processor.js');

    const items = [];
    const processFn = jest.fn();

    const result = await BatchProcessor.process(items, 5, processFn);

    expect(result.totalProcessed).toBe(0);
    expect(result.successCount).toBe(0);
    expect(result.failureCount).toBe(0);
    expect(processFn).not.toHaveBeenCalled();
  });

  test('should handle batch size larger than items array', async () => {
    const { BatchProcessor } = await import('../../../utils/batch-processor.js');

    const items = [{ id: 1 }, { id: 2 }];
    const batchSize = 10;

    const processFn = jest.fn().mockResolvedValue({ success: true });

    const result = await BatchProcessor.process(items, batchSize, processFn);

    expect(result.totalProcessed).toBe(2);
    expect(result.successCount).toBe(2);
    expect(processFn).toHaveBeenCalledTimes(1);
    expect(processFn).toHaveBeenCalledWith(items);
  });

  test('should collect detailed error information for failed batches', async () => {
    const { BatchProcessor } = await import('../../../utils/batch-processor.js');

    const items = Array.from({ length: 4 }, (_, i) => ({ id: i }));
    const batchSize = 2;

    const processFn = jest.fn().mockImplementation((batch) => {
      if (batch[0].id === 2) {
        throw new Error('Processing error for batch starting at id 2');
      }
      return Promise.resolve({ success: true });
    });

    const result = await BatchProcessor.process(items, batchSize, processFn);

    expect(result.errors).toBeDefined();
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].message).toContain('batch starting at id 2');
    expect(result.errors[0]).toHaveProperty('batchIndex');
  });

  test('should return aggregated results with all statistics', async () => {
    const { BatchProcessor } = await import('../../../utils/batch-processor.js');

    const items = Array.from({ length: 7 }, (_, i) => ({ id: i }));
    const batchSize = 3;

    const processFn = jest.fn().mockResolvedValue({ success: true });

    const result = await BatchProcessor.process(items, batchSize, processFn);

    // Verify result structure
    expect(result).toHaveProperty('totalProcessed');
    expect(result).toHaveProperty('successCount');
    expect(result).toHaveProperty('failureCount');
    expect(result).toHaveProperty('errors');
    expect(result).toHaveProperty('batches');

    expect(result.totalProcessed).toBe(7);
    expect(result.successCount).toBe(7);
    expect(result.failureCount).toBe(0);
    expect(result.batches).toBe(3); // 3 + 3 + 1
  });
});

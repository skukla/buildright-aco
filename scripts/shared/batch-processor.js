/**
 * Batch Processor Utility
 *
 * Generic batch processing with progress reporting and error handling.
 * Processes items sequentially in configurable batch sizes with progress callbacks.
 *
 * @module utils/batch-processor
 *
 * @example
 * import { BatchProcessor } from './batch-processor.js';
 *
 * const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
 *
 * const result = await BatchProcessor.process(
 *   items,
 *   10, // batch size
 *   async (batch) => {
 *     // Process batch
 *     return await uploadBatch(batch);
 *   },
 *   {
 *     onProgress: (progress) => {
 *       console.log(`${progress.percentage}% complete`);
 *     }
 *   }
 * );
 *
 * console.log(`Processed: ${result.successCount}/${result.totalProcessed}`);
 */

/**
 * Batch Processor class for processing items in batches
 *
 * Features:
 * - Sequential batch processing (batches processed one at a time)
 * - Configurable batch sizes
 * - Progress reporting via callbacks
 * - Partial failure handling (continues processing remaining batches)
 * - Detailed error reporting with batch indices
 */
export class BatchProcessor {
  /**
   * Processes items in batches sequentially
   * @param {Array} items - Items to process
   * @param {number} batchSize - Size of each batch
   * @param {Function} processFn - Function to process each batch
   * @param {Object} options - Processing options
   * @param {Function} options.onProgress - Progress callback
   * @returns {Promise<Object>} Processing results
   */
  static async process(items, batchSize, processFn, options = {}) {
    const { onProgress } = options;

    // Handle empty input
    if (!items || items.length === 0) {
      return {
        totalProcessed: 0,
        successCount: 0,
        failureCount: 0,
        errors: [],
        batches: 0
      };
    }

    const results = {
      totalProcessed: items.length,
      successCount: 0,
      failureCount: 0,
      errors: [],
      batches: 0
    };

    // Process items in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, Math.min(i + batchSize, items.length));
      const batchIndex = Math.floor(i / batchSize);
      results.batches++;

      try {
        await processFn(batch);
        results.successCount += batch.length;
      } catch (error) {
        results.failureCount += batch.length;
        results.errors.push({
          message: error.message,
          batchIndex,
          batchSize: batch.length
        });
      }

      // Report progress
      if (onProgress) {
        const processed = Math.min(i + batchSize, items.length);
        onProgress({
          processed,
          total: items.length,
          percentage: Math.round((processed / items.length) * 100)
        });
      }
    }

    return results;
  }
}

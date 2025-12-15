/**
 * Progress Utilities
 * Single-line updating progress bars and spinners for cleaner output
 */

import chalk from 'chalk';

/**
 * Create a single-line progress bar that updates in place
 * @param {number} current - Current progress value
 * @param {number} total - Total value to reach
 * @param {object} options - Progress bar options
 * @returns {string} Formatted progress bar string
 */
export function formatProgressBar(current, total, options = {}) {
  const {
    width = 40,
    complete = '█',
    incomplete = '░',
    prefix = '',
    suffix = ''
  } = options;

  const percentage = Math.min(100, Math.round((current / total) * 100));
  const filled = Math.round((current / total) * width);
  const empty = width - filled;

  const bar = complete.repeat(filled) + incomplete.repeat(empty);
  return `${prefix}[${bar}] ${percentage}% (${current}/${total}) ${suffix}`.trim();
}

/**
 * Update a single line in the terminal (no newline)
 * Uses carriage return for smooth, flicker-free updates
 * @param {string} message - Message to display
 */
export function updateLine(message) {
  if (process.stdout.isTTY) {
    // Use carriage return to move cursor to start of line without clearing
    // Pad the message to ensure we overwrite any previous longer text
    const paddedMessage = message.padEnd(100);
    process.stdout.write(`\r${paddedMessage}`);
  } else {
    // Non-TTY: just print the message normally
    console.log(message);
  }
}

/**
 * Finish a progress line (add newline)
 */
export function finishLine() {
  if (process.stdout.isTTY) {
    process.stdout.write('\n');
  }
}

/**
 * Create a polling progress tracker
 * Updates a single line showing: action, progress, time elapsed
 */
export class PollingProgress {
  constructor(action, expectedCount) {
    this.action = action;
    this.expectedCount = expectedCount;
    this.startTime = Date.now();
    this.attempt = 0;
    this.maxAttempts = 0;
  }

  update(currentCount, attempt, maxAttempts) {
    this.attempt = attempt;
    this.maxAttempts = maxAttempts;
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const bar = formatProgressBar(currentCount, this.expectedCount, { width: 20 });
    
    updateLine(`${this.action} ${bar} | ${elapsed}s elapsed | check ${attempt}/${maxAttempts}`);
  }

  finish(finalCount, success = true) {
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const icon = success ? chalk.green('✔') : '⚠️';
    const bar = formatProgressBar(finalCount, this.expectedCount, { width: 20 });
    
    updateLine(`${icon} ${this.action} ${bar} | completed in ${elapsed}s`);
    finishLine();
  }
}

/**
 * Create a batch progress tracker for processing items
 */
export class BatchProgress {
  constructor(action, total) {
    this.action = action;
    this.total = total;
    this.processed = 0;
    this.created = 0;
    this.existing = 0;
    this.failed = 0;
    this.startTime = Date.now();
  }

  increment(status) {
    this.processed++;
    
    if (status === 'created') this.created++;
    else if (status === 'existing') this.existing++;
    else if (status === 'failed') this.failed++;
    
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const rate = elapsed > 0 ? (this.processed / elapsed).toFixed(1) : '?';
    const bar = formatProgressBar(this.processed, this.total, { width: 20 });
    
    updateLine(`${this.action} ${bar} | ${rate}/s | ${chalk.green('✔')}${this.created} 🔄${this.existing} ❌${this.failed}`);
  }

  finish() {
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const bar = formatProgressBar(this.processed, this.total, { width: 20 });
    
    updateLine(`${chalk.green('✔')} ${this.action} ${bar} | completed in ${elapsed}s | ${chalk.green('✔')}${this.created} 🔄${this.existing} ❌${this.failed}`);
    finishLine();
  }
}


/**
 * Centralized logging utility for Obsidian Flux module
 * Provides consistent logging with optional UI notifications
 */
export class Logger {
  /**
   * Log a message to console with optional UI notification
   * @param {string} msg - Message to log
   * @param {boolean} notify - Whether to show UI notification
   */
  static log(msg, notify = false) {
    console.log(Logger.toLogMessage(msg));
    if (notify) ui?.notifications?.info(Logger.toLogMessage(msg));
  }

  /**
   * Log an error with UI notification
   * @param {Error|any} e - Error object or message
   */
  static error(e) {
    console.error(Logger.toLogMessage(e.stack || e));
    ui?.notifications?.error(Logger.toLogMessage('Unexpected error. Please see the console for more details.'));
  }

  /**
   * Log a debug message (console only, no UI notification)
   * @param {string} msg - Debug message to log
   */
  static debug(msg) {
    console.debug(Logger.toLogMessage(`[DEBUG] ${msg}`));
  }

  /**
   * Format message with module prefix
   * @param {string} msg - Message to format
   * @returns {string} Formatted message
   */
  static toLogMessage(msg) {
    return `Obsidian Flux | ${msg}`;
  }
}
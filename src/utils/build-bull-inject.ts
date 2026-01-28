/**
 * @file Provides a helper function for creating Bull-related injection tokens.
 */

/**
 * Constructs a standardized injection token for a Bull queue based on a job name.
 * This is a convention used to uniquely identify and inject Bull queues within a NestJS application.
 * The format is `BullQueue_<jobName>`.
 *
 * @param {string} jobName The name of the job or queue.
 * @returns {string} The formatted injection token.
 *
 * @example
 * const token = buildBullInject('email'); // returns 'BullQueue_email'
 */
export const buildBullInject = (jobName: string): string => {
  return `BullQueue_${jobName}`;
};

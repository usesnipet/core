/**
 * @file Contains utility functions for working with Buffers.
 */

/**
 * Converts a Node.js `Buffer` to a standard JavaScript `ArrayBuffer`.
 *
 * This function creates an `ArrayBuffer` with the same byte length as the input `Buffer`
 * and then copies the data from the `Buffer` into the `ArrayBuffer`.
 *
 * @param {Buffer} buffer The Node.js Buffer to convert.
 * @returns {ArrayBuffer} The resulting ArrayBuffer.
 */
export function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  const ab = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(ab);
  view.set(buffer);
  return ab;
}
import { bufferToArrayBuffer } from "./buffer";

describe("bufferToArrayBuffer", () => {
  it("should convert a Buffer to an ArrayBuffer", () => {
    const buffer = Buffer.from("hello world");
    const arrayBuffer = bufferToArrayBuffer(buffer);

    expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
    expect(arrayBuffer.byteLength).toBe(buffer.length);
  });

  it("should preserve the content of the buffer", () => {
    const originalString = "Some test data";
    const buffer = Buffer.from(originalString);
    const arrayBuffer = bufferToArrayBuffer(buffer);

    const recreatedBuffer = Buffer.from(arrayBuffer);
    expect(recreatedBuffer.toString()).toBe(originalString);
  });

  it("should handle an empty buffer", () => {
    const buffer = Buffer.from("");
    const arrayBuffer = bufferToArrayBuffer(buffer);

    expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
    expect(arrayBuffer.byteLength).toBe(0);
  });

  it("should handle a buffer with binary data", () => {
    const buffer = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05]);
    const arrayBuffer = bufferToArrayBuffer(buffer);

    expect(arrayBuffer.byteLength).toBe(5);
    const view = new Uint8Array(arrayBuffer);
    expect(view).toEqual(new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]));
  });
});

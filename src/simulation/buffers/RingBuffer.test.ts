import { describe, expect, it } from "vitest";
import { RingBuffer } from "./RingBuffer";

describe("RingBuffer", () => {
  it("rejects invalid capacity", () => {
    expect(() => new RingBuffer(0)).toThrow(/capacity/);
  });

  it("returns inserted values in insertion order", () => {
    const buffer = new RingBuffer<number>(4);
    buffer.push(1);
    buffer.push(2);
    buffer.push(3);
    expect(buffer.toArray()).toEqual([1, 2, 3]);
    expect(buffer.size).toBe(3);
    expect(buffer.isFull).toBe(false);
  });

  it("drops the oldest values once full", () => {
    const buffer = new RingBuffer<string>(3);
    buffer.push("a");
    buffer.push("b");
    buffer.push("c");
    buffer.push("d");
    expect(buffer.toArray()).toEqual(["b", "c", "d"]);
    expect(buffer.size).toBe(3);
    expect(buffer.isFull).toBe(true);
  });

  it("clears all values", () => {
    const buffer = new RingBuffer<number>(2);
    buffer.push(1);
    buffer.push(2);
    buffer.clear();
    expect(buffer.toArray()).toEqual([]);
    expect(buffer.size).toBe(0);
    expect(buffer.isFull).toBe(false);
  });
});

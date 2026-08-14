export class RingBuffer<T> {
  private readonly buffer: T[];
  private readonly capacity: number;
  private index = 0;
  private filled = false;
  private count = 0;

  constructor(capacity: number) {
    if (capacity < 1) {
      throw new Error("RingBuffer capacity must be >= 1");
    }
    this.capacity = capacity;
    this.buffer = new Array<T>(capacity);
  }

  push(item: T): void {
    this.buffer[this.index] = item;
    this.index = (this.index + 1) % this.capacity;
    if (this.index === 0) {
      this.filled = true;
    }
    if (this.count < this.capacity) {
      this.count += 1;
    }
  }

  toArray(): T[] {
    if (!this.filled) {
      return this.buffer.slice(0, this.index);
    }
    return [
      ...this.buffer.slice(this.index),
      ...this.buffer.slice(0, this.index),
    ];
  }

  clear(): void {
    this.index = 0;
    this.filled = false;
    this.count = 0;
  }

  get size(): number {
    return this.count;
  }

  get isFull(): boolean {
    return this.filled;
  }
}

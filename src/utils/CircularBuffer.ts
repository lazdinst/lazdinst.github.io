class CircularBuffer<T> {
  private buffer: T[];
  private size: number;
  private index: number;
  private isFull: boolean;

  constructor(size: number) {
    this.buffer = new Array(size);
    this.size = size;
    this.index = 0;
    this.isFull = false;
  }

  add(value: T) {
    this.buffer[this.index] = value;
    this.index = (this.index + 1) % this.size;
    if (this.index === 0) this.isFull = true;
  }

  getValues(): T[] {
    return this.isFull
      ? [...this.buffer.slice(this.index), ...this.buffer.slice(0, this.index)]
      : this.buffer.slice(0, this.index);
  }
}

export default CircularBuffer;

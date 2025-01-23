class CircularBuffer {
  private buffer: number[][];
  private size: number;
  private index: number;
  private isFull: boolean;

  constructor(size: number) {
    this.buffer = new Array(size);
    this.size = size;
    this.index = 0;
    this.isFull = false;
  }

  add(value: number[]) {
    this.buffer[this.index] = value;
    this.index = (this.index + 1) % this.size;
    if (this.index === 0) this.isFull = true;
  }

  getValues() {
    return this.isFull
      ? [...this.buffer.slice(this.index), ...this.buffer.slice(0, this.index)]
      : this.buffer.slice(0, this.index);
  }
}

export default CircularBuffer;

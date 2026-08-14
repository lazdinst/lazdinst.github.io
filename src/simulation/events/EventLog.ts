import { RingBuffer } from "../buffers/RingBuffer";
import type { SimulationEvent } from "./SimulationEvent";

export class EventLog {
  private readonly buffer: RingBuffer<SimulationEvent>;

  constructor(capacity: number) {
    this.buffer = new RingBuffer<SimulationEvent>(capacity);
  }

  append(event: SimulationEvent): void {
    this.buffer.push(event);
  }

  toArray(): SimulationEvent[] {
    return this.buffer.toArray();
  }

  clear(): void {
    this.buffer.clear();
  }

  get size(): number {
    return this.buffer.size;
  }
}

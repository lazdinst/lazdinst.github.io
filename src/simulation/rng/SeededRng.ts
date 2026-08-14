const UINT32_MAX = 4294967296;

export function mixSeed(seed: number, channel: number): number {
  return Math.imul(seed ^ (channel >>> 0), 0x9e3779b9) >>> 0;
}

export class SeededRng {
  private state: number;
  private spareGaussian: number | null = null;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / UINT32_MAX;
  }

  nextRange(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  nextInt(minInclusive: number, maxExclusive: number): number {
    const span = maxExclusive - minInclusive;
    if (span <= 0) {
      return minInclusive;
    }
    return minInclusive + Math.floor(this.next() * span);
  }

  nextGaussian(): number {
    if (this.spareGaussian !== null) {
      const value = this.spareGaussian;
      this.spareGaussian = null;
      return value;
    }

    let u = 0;
    let v = 0;
    while (u === 0) {
      u = this.next();
    }
    while (v === 0) {
      v = this.next();
    }

    const mag = Math.sqrt(-2 * Math.log(u));
    const twoPiV = 2 * Math.PI * v;
    this.spareGaussian = mag * Math.cos(twoPiV);
    return mag * Math.sin(twoPiV);
  }
}

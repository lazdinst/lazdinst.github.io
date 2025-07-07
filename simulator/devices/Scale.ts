import { BaseDevice } from "./base/BaseDevice";

export class Scale extends BaseDevice {
  constructor(id: string, params: Record<string, unknown>) {
    super(id, "Scale", params);
  }

  update(): void {
    const weight = (this._params["weight"] as number) ?? 0;
    this._params["weight"] = Math.max(0, weight + (Math.random() - 0.5));
  }
}

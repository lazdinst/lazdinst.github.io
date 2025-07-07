import { BaseDevice } from "./base/BaseDevice";

export class Motor extends BaseDevice {
  constructor(id: string, params: Record<string, unknown>) {
    super(id, "Motor", params);
  }

  update(): void {
    if (this._params["status"] === "Running") {
      const currentSpeed = (this._params["speed"] as number) ?? 0;
      this._params["speed"] = Math.min(currentSpeed + 5, 100);
    } else {
      const currentSpeed = (this._params["speed"] as number) ?? 0;
      this._params["speed"] = Math.max(currentSpeed - 5, 0);
    }
  }
}

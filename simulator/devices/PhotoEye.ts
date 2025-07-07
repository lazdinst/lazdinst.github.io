import { BaseDevice } from "./base/BaseDevice";

export class PhotoEye extends BaseDevice {
  constructor(id: string, params: Record<string, unknown>) {
    super(id, "PhotoEye", params);
  }

  update(): void {
    this._params["objectDetected"] = Math.random() < 0.1;
  }
}

import { BaseDevice } from "./base/BaseDevice";

export class Scanner extends BaseDevice {
  constructor(id: string, params: Record<string, unknown>) {
    super(id, "Scanner", params);
  }

  update(): void {
    if (Math.random() < 0.05) {
      this._params["barcode"] = `CODE-${Math.floor(Math.random() * 1000)}`;
    }
  }
}

import { BaseDevice } from "./base/BaseDevice";

export class EStop extends BaseDevice {
  constructor(id: string, params: Record<string, unknown>) {
    super(id, "EStop", params);
  }

  update(): void {}
}

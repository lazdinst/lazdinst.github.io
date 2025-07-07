export abstract class BaseDevice {
  readonly id: string;
  readonly type: string;
  protected _params: Record<string, unknown>;

  constructor(id: string, type: string, params: Record<string, unknown>) {
    this.id = id;
    this.type = type;
    this._params = { ...params };
  }

  get params(): Record<string, unknown> {
    return { ...this._params };
  }

  abstract update(): void;
}

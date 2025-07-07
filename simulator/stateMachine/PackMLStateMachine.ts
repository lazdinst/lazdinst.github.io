import { PackMLState, PackMLCommand } from "../types";

export class PackMLStateMachine {
  private _currentState: PackMLState;

  constructor() {
    this._currentState = PackMLState.Stopped;
  }

  get currentState(): PackMLState {
    return this._currentState;
  }

  handleCommand(command: PackMLCommand): void {
    switch (command) {
      case PackMLCommand.Start:
        if (this._currentState === PackMLState.Stopped || this._currentState === PackMLState.Idle) {
          this._currentState = PackMLState.Starting;
          setTimeout(() => {
            this._currentState = PackMLState.Execute;
          }, 1000);
        }
        break;
      case PackMLCommand.Stop:
        this._currentState = PackMLState.Stopped;
        break;
      case PackMLCommand.Abort:
        this._currentState = PackMLState.Aborting;
        setTimeout(() => {
          this._currentState = PackMLState.Aborted;
        }, 1000);
        break;
      case PackMLCommand.Hold:
        if (this._currentState === PackMLState.Execute) {
          this._currentState = PackMLState.Holding;
          setTimeout(() => {
            this._currentState = PackMLState.Held;
          }, 500);
        }
        break;
      case PackMLCommand.Unhold:
        if (this._currentState === PackMLState.Held) {
          this._currentState = PackMLState.Unholding;
          setTimeout(() => {
            this._currentState = PackMLState.Execute;
          }, 500);
        }
        break;
      case PackMLCommand.Reset:
        this._currentState = PackMLState.Idle;
        break;
      case PackMLCommand.Clear:
        this._currentState = PackMLState.Clearing;
        setTimeout(() => {
          this._currentState = PackMLState.Stopped;
        }, 500);
        break;
    }
  }
}

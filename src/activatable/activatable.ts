/*
┏━━━━━━━━━━━━━━━━━━━━┓                   ┌────────────────────┐
┃                    ┃                   │                    │
┃    Deactivated     ┃─────activate─────▶│     Activating     │
┃                    ┃                   │                    │
┗━━━━━━━━━━━━━━━━━━━━┛                   └────────────────────┘
           ▲                                        │
           │                                        │
           │                                        │
           │                                        ▼
┌────────────────────┐                   ┌────────────────────┐
│                    │                   │                    │
│    Deactivating    │◀────deactivate────│     Activated      │
│                    │                   │                    │
└────────────────────┘                   └────────────────────┘

Created with Monodraw
 */

export enum LifecycleState {
  Deactivated = 'Deactivated',
  Activating = 'Activating',
  Activated = 'Activated',
  Deactivating = 'Deactivating',
}

export interface IActivatable {
  isActivating: boolean;
  isActivated: boolean;
  isDeactivating: boolean;
  isDeactivated: boolean;
  activate: () => Promise<void>;
  deactivate: () => Promise<void>;
}

export abstract class Activatable implements IActivatable {
  private _state: LifecycleState = LifecycleState.Deactivated;

  public get state() {
    return this._state;
  }

  public get isActivating() {
    return this._state === LifecycleState.Activating;
  }

  public get isActivated() {
    return this._state === LifecycleState.Activated;
  }

  public get isDeactivating() {
    return this._state === LifecycleState.Deactivating;
  }

  public get isDeactivated() {
    return this._state === LifecycleState.Deactivated;
  }

  public async activate() {
    switch (this._state) {
      case LifecycleState.Activated:
        return;
      case LifecycleState.Deactivated:
        try {
          this._state = LifecycleState.Activating;
          await this.doActivate();
          this._state = LifecycleState.Activated;
          return;
        } catch (e) {
          this._state = LifecycleState.Deactivated;
          throw e;
        }
      default:
        throw new Error(`Cannot call activate on an Activatable in state '${this._state}'`);
    }
  }

  public async deactivate() {
    switch (this._state) {
      case LifecycleState.Deactivated:
        return;
      case LifecycleState.Activated:
        try {
          this._state = LifecycleState.Deactivating;
          await this.doDeactivate();
          this._state = LifecycleState.Deactivated;
          return;
        } catch (e) {
          this._state = LifecycleState.Activated;
          throw e;
        }
      default:
        throw new Error(`Cannot call deactivate on an Activatable in state '${this._state}'`);
    }
  }

  protected abstract doActivate(): void | Promise<void>;

  protected abstract doDeactivate(): void | Promise<void>;
}

export interface IActivatableCollection extends IActivatable {
  // noop
}

export class ActivatableCollection extends Activatable implements IActivatableCollection {
  public readonly activatables: IActivatable[] = [];

  protected async doActivate() {
    for (const activatable of this.activatables) {
      await activatable.activate();
    }
  }

  protected async doDeactivate() {
    for (const activatable of this.activatables) {
      await activatable.deactivate();
    }
  }

  public push(activatables: IActivatable) {
    this.activatables.push(activatables);
  }
}

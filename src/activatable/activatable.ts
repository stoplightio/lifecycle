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

export interface IMinimalActivatable {
  activate: () => Promise<void>;
  deactivate: () => Promise<void>;
}

export interface IActivatable extends IMinimalActivatable {
  readonly state: 'deactivated' | 'isActivating' | 'activated' | 'isDeactivating';
}

export abstract class Activatable implements IActivatable {
  protected _state: 'deactivated' | 'isActivating' | 'activated' | 'isDeactivating' = 'deactivated';

  public get state() {
    return this._state;
  }

  public async activate() {
    switch (this._state) {
      case 'activated':
        return;
      case 'deactivated':
        try {
          this._state = 'isActivating';
          await this.doActivate();
          this._state = 'activated';
          return;
        } catch (e) {
          this._state = 'deactivated';
          throw e;
        }
      default:
        throw new Error(`Cannot call activate on an Activatable in state '${this._state}'`);
    }
  }

  public async deactivate() {
    switch (this._state) {
      case 'deactivated':
        return;
      case 'activated':
        try {
          this._state = 'isDeactivating';
          await this.doDeactivate();
          this._state = 'deactivated';
          return;
        } catch (e) {
          this._state = 'activated';
          throw e;
        }
      default:
        throw new Error(`Cannot call deactivate on an Activatable in state '${this._state}'`);
    }
  }

  protected abstract async doActivate(): Promise<void>;

  protected abstract async doDeactivate(): Promise<void>;
}

export interface IActivatableCollection extends IActivatable {
  // noop
}

export class ActivatableCollection<T extends IMinimalActivatable> extends Activatable
  implements IActivatableCollection {
  public readonly activatables: T[] = [];

  protected async doActivate() {
    for (const activatable of this.activatables) {
      await activatable.activate();
    }
  }

  protected async doDeactivate() {
    for (const activatable of [...this.activatables].reverse()) {
      await activatable.deactivate();
    }
  }

  public push(activatables: T) {
    this.activatables.push(activatables);
  }
}

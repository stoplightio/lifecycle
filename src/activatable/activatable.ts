/*
┏━━━━━━━━━━━━━━━━━━━━┓                   ┌────────────────────┐
┃                    ┃                   │                    │
┃    deactivated     ┃─────activate─────▶│    isActivating    │
┃                    ┃                   │                    │
┗━━━━━━━━━━━━━━━━━━━━┛                   └────────────────────┘
           ▲                                        │
           │                                        │
           │                                        │
           │                                        ▼
┌────────────────────┐                   ┌────────────────────┐
│                    │                   │                    │
│   isDeactivating   │◀────deactivate────│     activated      │
│                    │                   │                    │
└────────────────────┘                   └────────────────────┘

Created with Monodraw
 */

import { computed, flow, observable } from 'mobx';

export interface IMinimalActivatable {
  activate: () => Promise<void>;
  deactivate: () => Promise<void>;
}

export interface IActivatable extends IMinimalActivatable {
  readonly state: 'deactivated' | 'isActivating' | 'activated' | 'isDeactivating';
}

export abstract class Activatable implements IActivatable {
  @observable
  private _state: 'deactivated' | 'isActivating' | 'activated' | 'isDeactivating' = 'deactivated';

  @computed
  public get state() {
    return this._state;
  }

  public activate = flow(function*(this: Activatable) {
    switch (this._state) {
      case 'activated':
        return;
      case 'deactivated':
        try {
          this._state = 'isActivating';
          yield this.doActivate();
          this._state = 'activated';
          return;
        } catch (e) {
          this._state = 'deactivated';
          throw e;
        }
      default:
        throw new Error(`Cannot call activate on an Activatable in state '${this._state}'`);
    }
  }).bind(this);

  public deactivate = flow(function*(this: Activatable) {
    switch (this._state) {
      case 'deactivated':
        return;
      case 'activated':
        try {
          this._state = 'isDeactivating';
          yield this.doDeactivate();
          this._state = 'deactivated';
          return;
        } catch (e) {
          this._state = 'activated';
          throw e;
        }
      default:
        throw new Error(`Cannot call deactivate on an Activatable in state '${this._state}'`);
    }
  }).bind(this);

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
    for (const activatable of this.activatables) {
      await activatable.deactivate();
    }
  }

  public push(activatables: T) {
    this.activatables.push(activatables);
  }
}

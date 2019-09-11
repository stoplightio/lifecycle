/**
 * Created ->- Activating ->- Activated ->- Deactivating ->- Deactivated -------------->----------- Disposed
 *                 |  |                                         |  |                                  |  |
 *                 |  `------------------<----------------------'  `--->--- FailedToDeactivate --->---'  |
 *                 `--------------------->--------- FailedToActivate ------------------>-----------------'
 */

enum LifeCycleState {
  Created = 1,
  Activating,
  Activated,
  Deactivating,
  Deactivated,
  Disposed,
  FailedToActivate,
  FailedToDeactivate,
}

const LifeCycleDescription = {
  [LifeCycleState.Created]: 'has never activated before',
  [LifeCycleState.Activating]: 'is activating',
  [LifeCycleState.Activated]: 'is activated',
  [LifeCycleState.Deactivating]: 'is deactivating',
  [LifeCycleState.Deactivated]: 'is deactivated',
  [LifeCycleState.Disposed]: 'is disposed',
  [LifeCycleState.FailedToActivate]: 'errored while activating',
  [LifeCycleState.FailedToDeactivate]: 'errored while deactivating',
};

export interface IActivatable {
  isActivating: boolean;
  isActivated: boolean;
  isDeactivating: boolean;
  isDeactivated: boolean;
  isErrored: boolean;
  activate: () => Promise<void>;
  deactivate: () => Promise<void>;
  disposeActivateable: () => void;
}

export abstract class Activatable implements IActivatable {
  private _state: LifeCycleState = LifeCycleState.Created;

  public get isActivating() {
    return this._state === LifeCycleState.Activating;
  }

  public get isActivated() {
    return this._state === LifeCycleState.Activated;
  }

  public get isDeactivating() {
    return this._state === LifeCycleState.Deactivating;
  }

  public get isDeactivated() {
    return (
      this._state === LifeCycleState.Created ||
      this._state === LifeCycleState.Deactivated ||
      this._state === LifeCycleState.Disposed
    );
  }

  public get isErrored() {
    return this._state === LifeCycleState.FailedToActivate || this._state === LifeCycleState.FailedToDeactivate;
  }

  public async activate() {
    switch (this._state) {
      case LifeCycleState.Activated:
        return;
      case LifeCycleState.Created:
      case LifeCycleState.Deactivated:
        try {
          this._state = LifeCycleState.Activating;
          await this._activate();
          this._state = LifeCycleState.Activated;
          return;
        } catch (e) {
          this._state = LifeCycleState.FailedToActivate;
          throw e;
        }
      default:
        throw new Error(`Cannot activate an Activatable that ${LifeCycleDescription[this._state]}`);
    }
  }

  public async deactivate() {
    switch (this._state) {
      case LifeCycleState.Deactivated:
        return;
      case LifeCycleState.Activated:
        try {
          this._state = LifeCycleState.Deactivating;
          await this._deactivate();
          this._state = LifeCycleState.Deactivated;
          return;
        } catch (e) {
          this._state = LifeCycleState.FailedToDeactivate;
          throw e;
        }
      default:
        throw new Error(`Cannot deactivate an Activatable that ${LifeCycleDescription[this._state]}`);
    }
  }

  public disposeActivateable() {
    this._state = LifeCycleState.Disposed;
  }

  protected abstract _activate(): void | Promise<void>;

  protected abstract _deactivate(): void | Promise<void>;
}

export class ActivatableCollection extends Activatable implements IActivatable {
  protected readonly activatables: IActivatable[] = [];

  protected async _activate() {
    await Promise.all(this.activatables.map(activatable => activatable.activate()));
  }

  protected async _deactivate() {
    await Promise.all(this.activatables.map(activatable => activatable.deactivate()));
  }

  public push(activatables: IActivatable) {
    this.activatables.push(activatables);
  }
}

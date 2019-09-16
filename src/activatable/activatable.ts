/**
 * Created ->- Activating ->- Activated ->- Deactivating ->- Deactivated -------------->----------- Disposed
 *                 |  |                                         |  |                                  |  |
 *                 |  `------------------<----------------------'  `--->--- FailedToDeactivate --->---'  |
 *                 `--------------------->--------- FailedToActivate ------------------>-----------------'
 */

export enum LifecycleState {
  Created = 1,
  Activating,
  Activated,
  Deactivating,
  Deactivated,
  Disposed,
  FailedToActivate,
  FailedToDeactivate,
}

const LifecycleDescription = {
  [LifecycleState.Created]: 'has never activated before',
  [LifecycleState.Activating]: 'is activating',
  [LifecycleState.Activated]: 'is activated',
  [LifecycleState.Deactivating]: 'is deactivating',
  [LifecycleState.Deactivated]: 'is deactivated',
  [LifecycleState.Disposed]: 'is disposed',
  [LifecycleState.FailedToActivate]: 'errored while activating',
  [LifecycleState.FailedToDeactivate]: 'errored while deactivating',
};

export interface IActivatable {
  isCreated: boolean;
  isActivating: boolean;
  isActivated: boolean;
  isDeactivating: boolean;
  isDeactivated: boolean;
  isFailedToActivate: boolean;
  isFailedToDeactivate: boolean;
  isFailed: boolean;
  activate: () => Promise<void>;
  deactivate: () => Promise<void>;
  disposeActivateable: () => void;
}

export abstract class Activatable implements IActivatable {
  private _state: LifecycleState = LifecycleState.Created;

  public get state() {
    return this._state;
  }

  public get isCreated() {
    return this._state === LifecycleState.Created;
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

  public get isFailedToActivate() {
    return this._state === LifecycleState.FailedToActivate;
  }

  public get isFailedToDeactivate() {
    return this._state === LifecycleState.FailedToDeactivate;
  }

  public get isFailed() {
    return this._state === LifecycleState.FailedToActivate || this._state === LifecycleState.FailedToDeactivate;
  }

  public async activate() {
    switch (this._state) {
      case LifecycleState.Activated:
        return;
      case LifecycleState.Created:
      case LifecycleState.Deactivated:
        try {
          this._state = LifecycleState.Activating;
          await this.doActivate();
          this._state = LifecycleState.Activated;
          return;
        } catch (e) {
          this._state = LifecycleState.FailedToActivate;
          throw e;
        }
      default:
        throw new Error(`Cannot activate an Activatable that ${LifecycleDescription[this._state]}`);
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
          this._state = LifecycleState.FailedToDeactivate;
          throw e;
        }
      default:
        throw new Error(`Cannot deactivate an Activatable that ${LifecycleDescription[this._state]}`);
    }
  }

  public disposeActivateable() {
    this._state = LifecycleState.Disposed;
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

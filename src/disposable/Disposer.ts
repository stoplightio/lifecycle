import { IDisposable } from './types';

const noop = () => {
  throw new Error('Already disposed');
};

export class Disposer implements IDisposable {
  constructor(private _dispose: () => void) {}
  public dispose() {
    this._dispose();
    this._dispose = noop;
  }
}

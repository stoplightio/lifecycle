import { IAsyncDisposable } from './types';

const noop = () => {
  throw new Error('Already disposed');
};

export class AsyncDisposer implements IAsyncDisposable {
  constructor(private _dispose: () => void | Promise<void>) {}
  public async dispose() {
    await this._dispose();
    this._dispose = noop;
  }
}

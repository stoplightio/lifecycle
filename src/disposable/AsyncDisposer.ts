import { IAsyncDisposable } from './types';

export class AsyncDisposer implements IAsyncDisposable {
  constructor(public dispose: () => void | Promise<void>) {}
}

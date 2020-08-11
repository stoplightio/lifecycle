import { IAsyncDisposable } from './types';

export class AsyncDisposable implements IAsyncDisposable {
  constructor(public dispose: () => void | Promise<void>) {}
}

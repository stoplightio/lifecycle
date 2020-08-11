import { IDisposable } from './types';

export class Disposable implements IDisposable {
  constructor(public dispose: () => void) {}
}

import { IDisposable } from './types';

export class Disposer implements IDisposable {
  constructor(public dispose: () => void) {}
}

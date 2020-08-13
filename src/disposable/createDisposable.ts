import { IDisposable } from './types';

export function createDisposable(func: () => void): IDisposable {
  return {
    dispose: func,
  };
}

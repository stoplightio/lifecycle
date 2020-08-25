import { IDisposable } from './types';

const listeners = new WeakMap<DisposeFn, Set<DisposeFn>>();

type DisposeFn = () => void;

declare class Disposer implements IDisposable {
  constructor(dispose: DisposeFn);
  public dispose(): void;
  public readonly disposed: boolean;
  public add(dispose: DisposeFn): void;
}

function Disposer(dispose: DisposeFn): Disposer {
  let _dispose: DisposeFn | undefined = dispose;
  const self = Object.defineProperties({}, {
    dispose: {
      enumerable: true,
      configurable: true,
      value() {
        if (!_dispose) {
          console.warn('Already disposed');
        } else {
          _dispose();
          const callbacks = listeners.get(_dispose);
          if (callbacks) {
            for (const callback of callbacks) {
              callback();
              callbacks.delete(callback);
            }
          }
          _dispose = void 0;
        }
      },
    },
    disposed: {
      enumerable: true,
      get() {
        return !_dispose;
      }
    },
    add: {
      enumerable: true,
      value(callback: DisposeFn) {
        if (!_dispose) {
          console.warn('Cannot add callback to an already disposed listener');
          return;
        }
        if (!listeners.has(_dispose)) {
          listeners.set(_dispose, new Set());
        }
        listeners.get(_dispose)!.add(callback);
      }
    }
  })
  return self;
}

export { Disposer };

import { IDisposable } from './types';

const listeners = new WeakMap<DisposeFn, Set<DisposeFn>>();

type DisposeFn = () => void;

declare class Disposer implements IDisposable {
  constructor(dispose: DisposeFn);
  public dispose(): void;
  public readonly disposed: boolean;
  public add(dispose: DisposeFn): void;
}

function Disposer(dispose: DisposeFn | undefined): Disposer {
  const self = Object.defineProperties(
    {},
    {
      dispose: {
        enumerable: true,
        configurable: true,
        value() {
          if (!dispose) {
            console.warn('Already disposed');
          } else {
            dispose();
            const callbacks = listeners.get(dispose);
            if (callbacks) {
              for (const callback of callbacks) {
                callback();
                callbacks.delete(callback);
              }
            }
            dispose = void 0;
          }
        },
      },
      disposed: {
        enumerable: true,
        get() {
          return !dispose;
        },
      },
      add: {
        enumerable: true,
        value(callback: DisposeFn) {
          if (!dispose) {
            console.warn('Cannot add callback to an already disposed listener');
            return;
          }
          if (!listeners.has(dispose)) {
            listeners.set(dispose, new Set());
          }
          listeners.get(dispose)!.add(callback);
        },
      },
    },
  );
  return self;
}

export { Disposer };

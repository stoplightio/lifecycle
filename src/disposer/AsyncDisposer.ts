import { IAsyncDisposable } from './types';

const listeners = new WeakMap<DisposeFn, Set<DisposeFn>>();

type DisposeFn = () => void | Promise<void>;

declare class AsyncDisposer implements IAsyncDisposable {
  constructor(dispose: DisposeFn);
  public dispose(): void | Promise<void>;
  public readonly disposed: boolean;
  public add(dispose: () => void): void;
}

function AsyncDisposer(dispose: DisposeFn): AsyncDisposer {
  let _dispose: DisposeFn | undefined = dispose;
  const self: AsyncDisposer = Object.defineProperties(
    {},
    {
      dispose: {
        enumerable: true,
        configurable: true,
        async value() {
          if (!_dispose) {
            console.warn('Already disposed');
          } else {
            await _dispose();
            const callbacks = listeners.get(_dispose);
            if (callbacks) {
              await Promise.all(
                [...callbacks].map(async callback => {
                  await callback();
                  callbacks.delete(callback);
                }),
              );
            }
            _dispose = void 0;
          }
        },
      },
      disposed: {
        enumerable: true,
        get() {
          return !_dispose;
        },
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
        },
      },
    },
  );
  return self;
}

export { AsyncDisposer };

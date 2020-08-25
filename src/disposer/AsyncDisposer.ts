import { catchAllPromises } from './catchAllPromises';
import { IAsyncDisposable } from './types';

const listeners = new WeakMap<DisposeFn, Set<DisposeFn>>();

type DisposeFn = () => void | Promise<void>;

declare class AsyncDisposer implements IAsyncDisposable {
  constructor(dispose: DisposeFn);
  public dispose(): void | Promise<void>;
  public readonly disposed: boolean;
  public add(dispose: () => void): void;
}

function AsyncDisposer(dispose: DisposeFn | undefined): AsyncDisposer {
  const self: AsyncDisposer = Object.defineProperties(
    {},
    {
      dispose: {
        enumerable: true,
        configurable: true,
        async value() {
          if (!dispose) {
            console.warn('Already disposed');
          } else {
            await dispose();
            const callbacks = listeners.get(dispose);
            if (callbacks) {
              await catchAllPromises(
                [...callbacks].map(async callback => {
                  await callback();
                  callbacks.delete(callback);
                }),
                'Callback(s) threw errors',
              );
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

export { AsyncDisposer };

import { IAsyncDisposable } from './types';

const nope = () => {
  console.warn('Already disposed');
};

declare class AsyncDisposer implements IAsyncDisposable {
  constructor(dispose: () => void | Promise<void>);
  public dispose(): void | Promise<void>;
  public disposed: boolean;
}

function AsyncDisposer(_dispose: () => void | Promise<void>): AsyncDisposer {
  const self: AsyncDisposer = {
    async dispose() {
      await _dispose();
      self.dispose = nope;
    },
    get disposed() {
      return self.dispose === nope;
    },
  };
  return self;
}

export { AsyncDisposer };

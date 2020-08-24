import { IDisposable } from './types';

const nope = () => {
  console.warn('Already disposed');
};

declare class Disposer implements IDisposable {
  constructor(dispose: () => void);
  public dispose(): void;
  public disposed: boolean;
}

function Disposer(_dispose: () => void): Disposer {
  const self: Disposer = {
    dispose() {
      _dispose();
      self.dispose = nope;
    },
    get disposed() {
      return self.dispose === nope;
    },
  };
  return self;
}

export { Disposer };

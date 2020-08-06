import { IAsyncDisposable } from './types';

export function createAsyncDisposable(func: () => void | Promise<void>): IAsyncDisposable {
  return {
    dispose: func,
  };
}

export class AsyncDisposableCollection implements IAsyncDisposable {
  protected readonly disposables: IAsyncDisposable[] = [];

  get disposed(): boolean {
    return this.disposables.length === 0;
  }

  public async dispose(): Promise<void> {
    if (this.disposed) return;

    while (!this.disposed) {
      await this.disposables[this.disposables.length - 1].dispose();
    }
  }

  public push(disposable: IAsyncDisposable): IAsyncDisposable {
    this.disposables.push(disposable);

    const originalDispose = disposable.dispose.bind(disposable);
    const toRemove = createAsyncDisposable(() => {
      const index = this.disposables.indexOf(disposable);
      if (index !== -1) {
        this.disposables.splice(index, 1);
      }
    });

    disposable.dispose = async () => {
      await originalDispose();
      await toRemove.dispose();
    };

    return toRemove;
  }
}

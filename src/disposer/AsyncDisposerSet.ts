import { AsyncDisposer } from './AsyncDisposer';
import { catchAllPromises } from './catchAllPromises';
import { IAsyncDisposable } from './types';

export class AsyncDisposerSet implements IAsyncDisposable {
  protected readonly disposables: Set<IAsyncDisposable> = new Set();

  get disposed(): boolean {
    return this.disposables.size === 0;
  }

  public async dispose(): Promise<void> {
    while (!this.disposed) {
      await catchAllPromises(
        [...this.disposables].map(async disposable => await disposable.dispose()),
        'call(s) to dispose threw',
      );
    }
  }

  public push(disposer: AsyncDisposer): AsyncDisposer {
    this.disposables.add(disposer);
    disposer.add(() => this.disposables.delete(disposer));
    return disposer;
  }

  public pushAll(disposables: AsyncDisposer[]): AsyncDisposer[] {
    return disposables.map(disposable => this.push(disposable));
  }
}

import { AsyncDisposer } from './AsyncDisposer';
import { IAsyncDisposable } from './types';

export class AsyncDisposableSet implements IAsyncDisposable {
  protected readonly disposables: Set<IAsyncDisposable> = new Set();

  get disposed(): boolean {
    return this.disposables.size === 0;
  }

  public async dispose(): Promise<void> {
    while (!this.disposed) {
      await Promise.all([...this.disposables].map(disposable => disposable.dispose()));
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

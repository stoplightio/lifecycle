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

  public push(disposable: IAsyncDisposable): IAsyncDisposable {
    this.disposables.add(disposable);

    const originalDispose = disposable.dispose.bind(disposable);

    disposable.dispose = async () => {
      await originalDispose();
      this.disposables.delete(disposable);
    };

    return disposable;
  }

  public pushAll(disposables: IAsyncDisposable[]): IAsyncDisposable[] {
    return disposables.map(disposable => this.push(disposable));
  }
}

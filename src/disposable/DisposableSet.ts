import { IDisposable } from './types';

export class DisposableSet implements IDisposable {
  protected readonly disposables: Set<IDisposable> = new Set();

  get disposed(): boolean {
    return this.disposables.size === 0;
  }

  public dispose(): void {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }

  public push(disposable: IDisposable): IDisposable {
    this.disposables.add(disposable);

    const originalDispose = disposable.dispose.bind(disposable);

    disposable.dispose = () => {
      originalDispose();
      this.disposables.delete(disposable);
    };

    return disposable;
  }

  public pushAll(disposables: IDisposable[]): IDisposable[] {
    return disposables.map(disposable => this.push(disposable));
  }
}

import { createDisposable } from './createDisposable';
import { IDisposable } from './types';

export class DisposableCollection implements IDisposable {
  protected readonly disposables: IDisposable[] = [];

  get disposed(): boolean {
    return this.disposables.length === 0;
  }

  public dispose(): void {
    if (this.disposed) return;

    while (!this.disposed) {
      this.disposables.pop()!.dispose();
    }
  }

  public push(disposable: IDisposable): IDisposable {
    this.disposables.push(disposable);

    const originalDispose = disposable.dispose.bind(disposable);
    const toRemove = createDisposable(() => {
      const index = this.disposables.indexOf(disposable);
      if (index !== -1) {
        this.disposables.splice(index, 1);
      }
    });

    disposable.dispose = () => {
      toRemove.dispose();
      originalDispose();
    };

    return toRemove;
  }

  public pushAll(disposables: IDisposable[]): IDisposable[] {
    return disposables.map(disposable => this.push(disposable));
  }
}

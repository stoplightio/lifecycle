import { Disposer } from './Disposer';
import { IDisposable } from './types';

export class DisposerSet implements IDisposable {
  protected readonly disposables: Set<IDisposable> = new Set();

  get disposed(): boolean {
    return this.disposables.size === 0;
  }

  public dispose(): void {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }

  public push(disposer: Disposer): Disposer {
    this.disposables.add(disposer);
    disposer.add(() => this.disposables.delete(disposer));
    return disposer;
  }

  public pushAll(disposables: Disposer[]): Disposer[] {
    return disposables.map(disposable => this.push(disposable));
  }
}

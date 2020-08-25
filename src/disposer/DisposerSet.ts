import { AggregateError } from './AggregateError';
import { Disposer } from './Disposer';
import { IDisposable } from './types';

export class DisposerSet implements IDisposable {
  protected readonly disposables: Set<IDisposable> = new Set();

  get disposed(): boolean {
    return this.disposables.size === 0;
  }

  public dispose(): void {
    const errors = [];
    for (const disposable of this.disposables) {
      try {
        disposable.dispose();
      } catch (e) {
        errors.push(e);
      }
    }
    if (errors.length > 0) throw new AggregateError(errors, 'call(s) to dispose threw');
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

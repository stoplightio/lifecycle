import { IDisposable } from './types';

export function createDisposable(func: () => void): IDisposable {
  return {
    dispose: func,
  };
}

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

    // this.checkDisposed();
  }

  public push(disposable: IDisposable): IDisposable {
    this.disposables.push(disposable);

    const originalDispose = disposable.dispose.bind(disposable);
    const toRemove = createDisposable(() => {
      const index = this.disposables.indexOf(disposable);
      if (index !== -1) {
        this.disposables.splice(index, 1);
      }

      // this.checkDisposed();
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

  // At some point IDisposable should probably be an event emitter

  // @ts-ignore
  // protected readonly onDisposeEmitter: Mitt.Emitter = mitt();

  // get onDispose(): Event<void> {
  //   return this.onDisposeEmitter.event;
  // }

  // protected checkDisposed(): void {
  //   if (this.disposed) {
  //     this.onDisposeEmitter.emit('disposed');
  //   }
  // }
}

import { createDisposable, DisposableCollection } from '../';

describe('disposable', () => {
  test('collection', () => {
    const disposables = new DisposableCollection();

    let counter = 0;
    const funcs = {
      count: () => {
        counter += 1;
      },
    };

    const doCount = () => {
      if (funcs.count) {
        funcs.count();
      }
    };

    disposables.push(
      createDisposable(() => {
        delete funcs.count;
      })
    );

    // let disposeEventFired = false;
    // disposables.onDispose(() => {
    //   disposeEventFired = true;
    // });

    expect(disposables.disposed).toEqual(false);
    doCount();
    expect(counter).toEqual(1);
    doCount();
    expect(counter).toEqual(2);

    disposables.dispose();

    expect(disposables.disposed).toEqual(true);
    doCount();
    expect(counter).toEqual(2);
    // expect(disposeEventFired).toEqual(true);
  });
});

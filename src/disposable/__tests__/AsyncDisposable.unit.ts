import { AsyncDisposableCollection, createAsyncDisposable } from '../';

type MaybeCounter = {
  count?: () => void;
};

describe('disposable', () => {
  test('AsyncDisposableCollection', async () => {
    const disposables = new AsyncDisposableCollection();

    let counter = 0;
    const funcs: MaybeCounter = {
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
      createAsyncDisposable(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            delete funcs.count;
            resolve();
          }, 10);
        });
      }),
    );

    expect(disposables.disposed).toEqual(false);
    doCount();
    expect(counter).toEqual(1);
    doCount();
    expect(counter).toEqual(2);

    const promise = disposables.dispose();
    expect(disposables.disposed).toEqual(false);
    await promise;
    expect(disposables.disposed).toEqual(true);

    doCount();
    expect(counter).toEqual(2);
  });
});

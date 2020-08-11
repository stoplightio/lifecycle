import { AsyncDisposable, AsyncDisposableSet } from '../';

type MaybeCounter = {
  count?: () => void;
};

describe('AsyncDisposableCollection', () => {
  test('basics', async () => {
    const disposables = new AsyncDisposableSet();

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
      new AsyncDisposable(() => {
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
  test('disposes concurrently', async () => {
    const disposables = new AsyncDisposableSet();

    let time1 = 0;
    let time2 = 0;

    disposables.push(
      new AsyncDisposable(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            time1 = Date.now();
            resolve();
          }, 50);
        });
      }),
    );

    disposables.push(
      new AsyncDisposable(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            time2 = Date.now();
            resolve();
          }, 50);
        });
      }),
    );

    expect(disposables.disposed).toEqual(false);
    await disposables.dispose();
    expect(time1).toEqual(time2);
    expect(disposables.disposed).toEqual(true);
  });
});

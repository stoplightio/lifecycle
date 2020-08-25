import { AsyncDisposer, AsyncDisposerSet } from '../';

type MaybeCounter = {
  count?: () => void;
};

describe('AsyncDisposerSet', () => {
  test('basics', async () => {
    const disposables = new AsyncDisposerSet();

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
      new AsyncDisposer(() => {
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

  test('is removed from set if externally disposed', async () => {
    const disposables = new AsyncDisposerSet();

    const disposer = new AsyncDisposer(() => void 0);

    disposables.push(disposer);
    expect(disposables.disposed).toEqual(false);

    await disposer.dispose();
    expect(disposables.disposed).toEqual(true);
  });

  test('disposes concurrently', async () => {
    const disposables = new AsyncDisposerSet();

    let time1 = 0;
    let time2 = 0;

    disposables.push(
      new AsyncDisposer(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            time1 = Date.now();
            resolve();
          }, 50);
        });
      }),
    );

    disposables.push(
      new AsyncDisposer(() => {
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

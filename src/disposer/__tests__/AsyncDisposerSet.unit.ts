import { AsyncDisposer, AsyncDisposerSet } from '../';
import { AggregateError } from '../AggregateError';

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

  test('throws if one or more async disposers throw', async () => {
    const disposables = new AsyncDisposerSet();

    const disposer1 = new AsyncDisposer(() => void 0);
    const disposer2 = new AsyncDisposer(() => {
      throw new Error('Fail');
    }); // a sync one
    const disposer3 = new AsyncDisposer(() => void 0);
    const disposer4 = new AsyncDisposer(async () => {
      throw new Error('Fail');
    }); // an async one

    disposables.pushAll([disposer1, disposer2, disposer3, disposer4]);
    expect(disposables.disposed).toEqual(false);

    let err: AggregateError | undefined;
    try {
      await disposables.dispose();
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err?.message).toBe('call(s) to dispose threw');
    expect(err?.errors.length).toBe(2);
  });
});

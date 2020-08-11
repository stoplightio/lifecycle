import { createDisposable, DisposableCollection } from '../';

type MaybeCounter = {
  count?: () => void;
};

describe('disposable', () => {
  test('DisposableCollection', () => {
    const disposables = new DisposableCollection();

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
      createDisposable(() => {
        delete funcs.count;
      }),
    );

    expect(disposables.disposed).toEqual(false);
    doCount();
    expect(counter).toEqual(1);
    doCount();
    expect(counter).toEqual(2);

    disposables.dispose();

    expect(disposables.disposed).toEqual(true);
    doCount();
    expect(counter).toEqual(2);
  });
});

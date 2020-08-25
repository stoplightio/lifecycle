import { Disposer } from '../';

let consoleSpy: jest.SpyInstance;

describe('Disposer', () => {
  beforeAll(() => {
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  test('Disposer', () => {
    let counter = 0;

    const disposable = new Disposer(() => counter++);

    expect(counter).toEqual(0);
    expect(disposable.disposed).toEqual(false);

    disposable.dispose();
    expect(disposable.disposed).toEqual(true);
    expect(counter).toEqual(1);

    disposable.dispose();
    expect(counter).toEqual(1);
    expect(consoleSpy).toBeCalledWith('Already disposed');
  });

  test('Disposer + callback', () => {
    let counter = 0;

    const disposable = new Disposer(() => counter++);

    disposable.add(() => counter++);

    disposable.dispose();
    expect(disposable.disposed).toEqual(true);
    expect(counter).toEqual(2);

    disposable.dispose();
    expect(counter).toEqual(2);
    expect(consoleSpy).toBeCalledWith('Already disposed');

    disposable.add(() => counter++);
    expect(consoleSpy).toBeCalledWith('Cannot add callback to an already disposed listener');
  });

  test('Disposer + 10 callbacks', () => {
    let counter = 0;

    const disposable = new Disposer(() => counter++);

    for (let i = 0; i < 10; i++) {
      disposable.add(() => counter++);
    }

    disposable.dispose();
    expect(disposable.disposed).toEqual(true);
    expect(counter).toEqual(11);

    disposable.dispose();
    expect(counter).toEqual(11);
    expect(consoleSpy).toBeCalledWith('Already disposed');

    disposable.add(() => counter++);
    expect(consoleSpy).toBeCalledWith('Cannot add callback to an already disposed listener');
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });
});

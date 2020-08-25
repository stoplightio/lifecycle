import { AsyncDisposer } from '../';

let consoleSpy: jest.SpyInstance;

describe('AsyncDisposer', () => {
  beforeAll(() => {
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  test('AsyncDisposer', async () => {
    let counter = 0;

    const disposable = new AsyncDisposer(() => {
      counter++;
    });

    expect(counter).toEqual(0);
    expect(disposable.disposed).toEqual(false);

    await disposable.dispose();
    expect(disposable.disposed).toEqual(true);
    expect(counter).toEqual(1);

    await disposable.dispose();
    expect(counter).toEqual(1);
    expect(consoleSpy).toBeCalledWith('Already disposed');
  });


  test('AsyncDisposer + callback', async () => {
    let counter = 0;

    const disposable = new AsyncDisposer(() => {
      counter++
    });

    disposable.add(() => counter++);

    await disposable.dispose();
    expect(disposable.disposed).toEqual(true);
    expect(counter).toEqual(2);

    await disposable.dispose();
    expect(counter).toEqual(2);
    expect(consoleSpy).toBeCalledWith('Already disposed');

    disposable.add(() => counter++);
    expect(consoleSpy).toBeCalledWith('Cannot add callback to an already disposed listener');
  });

  test('AsyncDisposer + 10 callbacks', async () => {
    let counter = 0;

    const disposable = new AsyncDisposer(() => {
      counter++
    });

    for (let i = 0; i < 10; i++) {
      disposable.add(() => counter++);
    }

    await disposable.dispose();
    expect(disposable.disposed).toEqual(true);
    expect(counter).toEqual(11);

    await disposable.dispose();
    expect(counter).toEqual(11);
    expect(consoleSpy).toBeCalledWith('Already disposed');

    disposable.add(() => counter++);
    expect(consoleSpy).toBeCalledWith('Cannot add callback to an already disposed listener');
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });
});

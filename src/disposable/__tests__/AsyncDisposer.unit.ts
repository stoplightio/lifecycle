import { AsyncDisposer } from '../';

let consoleSpy: jest.SpyInstance;

describe('disposable', () => {
  beforeAll(() => {
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  test('asyncDisposer', async () => {
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

  afterAll(() => {
    consoleSpy.mockRestore();
  });
});

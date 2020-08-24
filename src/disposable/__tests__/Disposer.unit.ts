import { Disposer } from '../';

let consoleSpy: jest.SpyInstance;

describe('disposable', () => {
  beforeAll(() => {
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  test('disposer', () => {
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

  afterAll(() => {
    consoleSpy.mockRestore();
  });
});

import { AggregateError } from '../AggregateError';
import { catchAllPromises } from '../catchAllPromises';

describe('catchAllPromises', () => {
  test('catches already settled promises', async () => {
    const promises = [Promise.resolve(1), Promise.reject(2), Promise.resolve(3), Promise.reject(4)];

    let err: AggregateError | undefined;
    try {
      await catchAllPromises(promises, 'oops');
    } catch (e) {
      err = e;
    }

    expect(err).toBeDefined();
    expect(err?.message).toBe('oops');
    expect(err?.errors.length).toBe(2);
  });

  test('catches future promises', async () => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const nightmare = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

    const promises = [sleep(10), nightmare(5), sleep(4), nightmare(10), sleep(7), nightmare(2)];

    let err: AggregateError | undefined;
    try {
      await catchAllPromises(promises, 'oops');
    } catch (e) {
      err = e;
    }

    expect(err).toBeDefined();
    expect(err?.message).toBe('oops');
    expect(err?.errors.length).toBe(3);
  });
});

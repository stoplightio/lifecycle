import { AggregateError } from './AggregateError';

// A practical utility, kind of like Promise.allSettled.
export async function catchAllPromises(promises: Array<Promise<any>>, message: string) {
  const errors: any[] = [];
  promises.forEach(promise => promise.catch(e => errors.push(e)));
  for (const promise of promises) {
    try {
      await promise;
    } catch (_) {
      // already handled with .catches above
    }
  }
  if (errors.length > 0) {
    throw new AggregateError(errors, message);
  }
}

// a fake [AggregateError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError/AggregateError)
// At the time of writing, it is too new to rely on the browser native one.
export class AggregateError extends Error {
  constructor(public errors: any[], public message: string = '') {
    super(message);
  }
}

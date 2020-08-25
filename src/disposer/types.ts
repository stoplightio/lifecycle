export { IDisposable } from '../disposable';

export interface IAsyncDisposable {
  dispose(): void | Promise<void>;
}

export interface IDisposable {
  dispose(): void;
}

export interface IAsyncDisposable {
  dispose(): void | Promise<void>;
}

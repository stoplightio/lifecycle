import { IDisposable } from '../disposable';

export type EventEmitterOn<T> = (listener: EventEmitterListener<T>) => IDisposable;
export type EventEmitterListener<T> = (e: T) => void;

export interface IEventEmitter<T, N = string> extends IDisposable {
  on: (type: N) => EventEmitterOn<T>;
  emit: (type: N, e: T) => void;
  hasListeners: boolean;
}

import StrictEventEmitter from 'strict-event-emitter-types';
import { IDisposable } from '../disposable';

export interface IEventEmitter<E extends object> extends StrictEventEmitter<IEventEmitterInstance, E> {}

export interface IEventEmitterInstance extends IDisposable {
  on(type: number | string, listener: any): IDisposable;
  emit<A extends Array<unknown> = Array<unknown>>(type: number | string, ...args: A): void;
  hasListeners: boolean;
}

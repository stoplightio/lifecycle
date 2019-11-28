import StrictEventEmitter from 'strict-event-emitter-types';
import Emitter = require('wolfy87-eventemitter');
import { createDisposable, IDisposable } from '../disposable';

export interface IEventEmitter<E extends object> extends StrictEventEmitter<IEventEmitterInstance, E> {
  createEmitGroup(): {
    queueCount: number;
    emit: IEventEmitter<E>['emit'];
    flush: () => void;
    reset: () => void;
  };
}

export interface IEventEmitterInstance extends IDisposable {
  on(type: number | string, listener: any): IDisposable;
  emit<A extends Array<unknown> = Array<unknown>>(type: number | string, ...args: A): void;
  hasListeners: boolean;
}

export class EventEmitter<E extends object> implements IEventEmitter<E> {
  private _emitter = new Emitter();

  public on(type: unknown, listener: Function): IDisposable {
    this._emitter.on(String(type), listener);
    return createDisposable(() => {
      this._emitter.off(String(type), listener);
    });
  }

  public emit(type: unknown, ...args: Array<unknown>): void {
    this._emitter.trigger(String(type), args);
  }

  public get hasListeners() {
    const eventsToListeners = this._emitter.getListeners(/.*/);

    for (const ev in eventsToListeners) {
      if (!{}.hasOwnProperty.call(eventsToListeners, ev)) continue;

      const l = eventsToListeners[ev];
      if (l !== undefined && l.length > 0) {
        return true;
      }
    }

    return false;
  }

  public dispose() {
    this._emitter.removeAllListeners();
  }

  public createEmitGroup(): {
    queueCount: number;
    emit: EventEmitter<E>['emit'];
    flush: () => void;
    reset: () => void;
  } {
    const notifier = this;

    let eventQueue: Array<[unknown, Array<unknown>]> = [];

    return {
      get queueCount() {
        return eventQueue.length;
      },

      emit(event: any, ...args: any) {
        eventQueue.push([event, args]);
      },

      flush() {
        for (const [event, args] of eventQueue) {
          notifier.emit(event, ...args);
        }

        this.reset();
      },

      reset() {
        eventQueue = [];
      },
    };
  }
}

// needed to make typings work correctly when subclassing the emitter
// see https://github.com/bterlson/strict-event-emitter-types/issues/3
// example usage `class MyClass extends createEventEmitter<IEvents>() { }`
export function createEventEmitter<T extends object>() {
  const TypedEmitter: new () => StrictEventEmitter<IEventEmitterInstance, T> = EventEmitter;

  return TypedEmitter;
}

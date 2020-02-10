import StrictEventEmitter from 'strict-event-emitter-types';
import Emitter = require('wolfy87-eventemitter');
import { createDisposable, IDisposable } from '../disposable';

export interface IEmitGroup<E extends object> {
  queueCount: number;
  emit: EventEmitter<E>['emit'];
  flush: () => void;
  reset: () => void;
}

export interface IEventEmitter<E extends object> extends StrictEventEmitter<IEventEmitterInstance, E> {
  createEmitGroup(): IEmitGroup<E>;
}

export interface IEventEmitterInstance extends IDisposable {
  on(type: number | string, listener: any): IDisposable;
  emit<A extends unknown[] = unknown[]>(type: number | string, ...args: A): void;
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

  public emit(type: unknown, ...args: unknown[]): void {
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

  public createEmitGroup(): IEmitGroup<E> {
    const notifier = this;

    const eventQueue: Array<[string, unknown[]]> = [];
    let flushed = false;

    return {
      get queueCount() {
        return eventQueue.length;
      },

      emit(event: string, ...args: any) {
        // if we've already flushed this group, emit any subsequent events immediately
        if (flushed) {
          notifier.emit(event, ...args);
        } else {
          eventQueue.push([event, args]);
        }
      },

      flush() {
        for (const [event, args] of eventQueue) {
          try {
            notifier.emit(event, ...args);
          } catch (e) {
            // noop
          }
        }

        this.reset();
        flushed = true;
      },

      reset() {
        eventQueue.length = 0;
        flushed = false;
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

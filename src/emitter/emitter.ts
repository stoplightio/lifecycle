import Emitter = require('wolfy87-eventemitter');
import { createDisposable, IDisposable } from '../disposable';

export type EventMap = {
  [key: string]: (...args: any) => void;
};

export interface IEmitGroup<E extends EventMap> {
  queueCount: number;
  emit<P extends keyof E>(type: P, args: Parameters<E[P]>): void;
  flush: () => void;
  reset: () => void;
}

export interface IEventEmitter<E extends EventMap> extends IDisposable {
  on<P extends keyof E>(type: P, listener: E[P]): IDisposable;
  emit<P extends keyof E>(type: P, args: Parameters<E[P]>): void;
  hasListeners: boolean;
  createEmitGroup(): IEmitGroup<E>;
}

export class EventEmitter<E extends EventMap> implements IEventEmitter<E> {
  private _emitter = new Emitter();

  public on<P extends keyof E>(type: P, listener: E[P]): IDisposable {
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

    const eventQueue: Array<[string | number | symbol, unknown[]]> = [];
    let flushed = false;

    return {
      get queueCount() {
        return eventQueue.length;
      },

      emit(event, ...args: any) {
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

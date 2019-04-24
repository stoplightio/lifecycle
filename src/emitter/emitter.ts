import Emitter = require('wolfy87-eventemitter');

import { createDisposable, IDisposable } from '../disposable';
import { IEventEmitter } from './types';

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
}

import Emitter = require('wolfy87-eventemitter');

import { createDisposable } from '../disposable';
import { EventEmitterOn, IEventEmitter } from './types';

export class EventEmitter<T, N = string> implements IEventEmitter<T, N> {
  // @ts-ignore the mitt typings are wrong
  private _emitter = new Emitter();

  public on(type: N): EventEmitterOn<T> {
    return listener => {
      // @ts-ignore
      this._emitter.on(type, listener);
      return createDisposable(() => {
        // @ts-ignore
        this._emitter.off(type, listener);
      });
    };
  }

  public emit(type: N, e: T): void {
    // @ts-ignore
    this._emitter.trigger(type, [e]);
  }

  public get hasListeners() {
    const eventsToListeners = this._emitter.getListeners(/.*/);

    for (const ev in eventsToListeners) {
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

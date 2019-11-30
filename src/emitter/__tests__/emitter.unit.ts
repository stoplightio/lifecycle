import { EventEmitter, IEventEmitter } from '..';

describe('emitter', () => {
  test('emit', () => {
    const onEventFired1 = jest.fn();
    const onEventFired2 = jest.fn();
    const onEventFired3 = jest.fn();

    const e = new EventEmitter();

    const listener1 = e.on('go', onEventFired1);
    const listener2 = e.on('go', onEventFired2);
    const listener3 = e.on('go', onEventFired3);

    expect(e.hasListeners).toBe(true);

    e.emit('go', 'yo');

    expect(onEventFired1).toHaveBeenCalledWith('yo');
    expect(onEventFired2).toHaveBeenCalledWith('yo');
    expect(onEventFired3).toHaveBeenCalledWith('yo');

    listener2.dispose();
    onEventFired2.mockClear();

    e.emit('go', 'yo-again', 'moin');
    expect(onEventFired1).toHaveBeenCalledWith('yo-again', 'moin');
    expect(onEventFired2).not.toHaveBeenCalled();
    expect(onEventFired3).toHaveBeenCalledWith('yo-again', 'moin');

    listener1.dispose();
    listener3.dispose();

    expect(e.hasListeners).toBe(false);
  });

  test('dispose', () => {
    const onEventFired1 = jest.fn();
    const onEventFired2 = jest.fn();
    const onEventFired3 = jest.fn();

    const e = new EventEmitter();

    e.on('go', onEventFired1);
    e.on('go', onEventFired2);
    e.on('go', onEventFired3);

    e.dispose();

    onEventFired1.mockClear();
    onEventFired2.mockClear();
    onEventFired3.mockClear();
    e.emit('go', 'yo');

    expect(onEventFired1).not.toHaveBeenCalled();
    expect(onEventFired2).not.toHaveBeenCalled();
    expect(onEventFired3).not.toHaveBeenCalled();
  });

  describe('createEmitGroup', () => {
    test('works', () => {
      const onGo1Fired = jest.fn();
      const onGo2Fired = jest.fn();
      const onBrakeFired = jest.fn();

      const e: IEventEmitter<{
        go: (x: string) => void;
        brake: () => void;
      }> = new EventEmitter();

      const go1Disposer = e.on('go', onGo1Fired);
      e.on('go', onGo2Fired);
      e.on('brake', onBrakeFired);

      const emitGroup = e.createEmitGroup();

      emitGroup.emit('go', 'yo');
      emitGroup.emit('brake');

      expect(onGo1Fired).not.toHaveBeenCalled();
      expect(onGo2Fired).not.toHaveBeenCalled();
      expect(onBrakeFired).not.toHaveBeenCalled();

      expect(emitGroup.queueCount).toEqual(2);

      emitGroup.flush();

      expect(onGo1Fired).toHaveBeenCalledWith('yo');
      expect(onGo2Fired).toHaveBeenCalledWith('yo');
      expect(onBrakeFired).toHaveBeenCalledWith();
      expect(emitGroup.queueCount).toEqual(0);

      onGo1Fired.mockClear();
      onGo2Fired.mockClear();
      onBrakeFired.mockClear();

      // reset

      emitGroup.emit('go', 'yo');
      expect(emitGroup.queueCount).toEqual(1);
      emitGroup.reset();
      expect(emitGroup.queueCount).toEqual(0);

      onGo1Fired.mockClear();
      onGo2Fired.mockClear();
      onBrakeFired.mockClear();

      // disposed listener

      go1Disposer.dispose();
      emitGroup.emit('go', 'yo');
      emitGroup.flush();
      expect(onGo1Fired).not.toHaveBeenCalled();
      expect(onGo2Fired).toHaveBeenCalledWith('yo');
      expect(emitGroup.queueCount).toEqual(0);
    });

    test('continues even if a listener throws an error', () => {
      const onGoFired = jest.fn();
      const onThrowFired = jest.fn(() => {
        throw new Error('stop');
      });

      const e = new EventEmitter();

      const emitGroup = e.createEmitGroup();

      e.on('go', onGoFired);
      e.on('throw', onThrowFired);

      emitGroup.emit('go', 'yo');
      emitGroup.emit('throw');
      emitGroup.emit('go', 'yo2');
      emitGroup.flush();

      expect(onGoFired).toHaveBeenCalledTimes(2);
      expect(onGoFired).toHaveBeenCalledWith('yo');
      expect(onGoFired).toHaveBeenCalledWith('yo2');

      expect(onThrowFired).toHaveBeenCalled();
      expect(onThrowFired).toThrowError();
    });
  });
});

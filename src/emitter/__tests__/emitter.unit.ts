import { EventEmitter } from '..';

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
});

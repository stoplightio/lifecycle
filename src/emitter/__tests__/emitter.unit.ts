import { EventEmitter } from '..';

describe('emitter', () => {
  test('emit', () => {
    const onEventFired1 = jest.fn();
    const onEventFired2 = jest.fn();
    const onEventFired3 = jest.fn();

    const e = new EventEmitter<string, 'go'>();

    const listener1 = e.on('go')(onEventFired1);
    const listener2 = e.on('go')(onEventFired2);
    const listener3 = e.on('go')(onEventFired3);

    expect(e.hasListeners).toBe(true);

    e.emit('go', 'yo');

    expect(onEventFired1).toHaveBeenCalledWith('yo');
    expect(onEventFired2).toHaveBeenCalledWith('yo');
    expect(onEventFired3).toHaveBeenCalledWith('yo');

    listener2.dispose();

    e.emit('go', 'yo-again');
    expect(onEventFired1).toHaveBeenCalledWith('yo-again');
    expect(onEventFired2).not.toHaveBeenCalledWith('yo-again');
    expect(onEventFired3).toHaveBeenCalledWith('yo-again');

    listener1.dispose();
    listener3.dispose();

    expect(e.hasListeners).toBe(false);
  });

  test('dispose', () => {
    const onEventFired1 = jest.fn();
    const onEventFired2 = jest.fn();
    const onEventFired3 = jest.fn();

    const e = new EventEmitter<string>();

    e.on('go')(onEventFired1);
    e.on('go')(onEventFired2);
    e.on('go')(onEventFired3);

    e.dispose();

    e.emit('go', 'yo');

    expect(onEventFired1).not.toHaveBeenCalledWith('yo');
    expect(onEventFired2).not.toHaveBeenCalledWith('yo');
    expect(onEventFired3).not.toHaveBeenCalledWith('yo');
  });
});

import { Activatable, ActivatableCollection } from '../';
import { ThingWhereOrderMatters } from './__helpers__/ThingWhereOrderMatters';

const sleep = (ms: number) => new Promise((resolve, reject) => setTimeout(resolve, ms));

class ThingThatDoesntFail extends Activatable {
  protected async doActivate() {
    await sleep(10);
  }
  protected async doDeactivate() {
    await sleep(10);
  }
}

class ThingThatFailsToActivate extends Activatable {
  protected async doActivate() {
    await sleep(10);
    throw new Error('fail');
  }
  protected async doDeactivate() {
    await sleep(10);
  }
}

class ThingThatFailsToDeactivate extends Activatable {
  protected async doActivate() {
    await sleep(10);
  }
  protected async doDeactivate() {
    await sleep(10);
    throw new Error('fail');
  }
}

describe('activatable collection', () => {
  test('happy path', async () => {
    const activatables = new ActivatableCollection();
    const a = new ThingThatDoesntFail();
    const b = new ThingThatDoesntFail();
    activatables.push(a);
    activatables.push(b);

    expect(activatables.state).toBe('deactivated');
    await activatables.activate();
    expect(a.state).toEqual('activated');
    expect(b.state).toEqual('activated');
    expect(activatables.state).toEqual('activated');

    await activatables.deactivate();
    expect(activatables.state).toEqual('deactivated');
    expect(a.state).toEqual('deactivated');
    expect(b.state).toEqual('deactivated');
  });

  test('deactivate in reverse order of activating', async () => {
    const activatables = new ActivatableCollection();
    const orderDeactivated: string[] = [];
    const a = new ThingWhereOrderMatters(orderDeactivated, 'a');
    const b = new ThingWhereOrderMatters(orderDeactivated, 'b');
    activatables.push(a);
    activatables.push(b);

    await activatables.activate();
    await activatables.deactivate();
    expect(orderDeactivated).toEqual(['a', 'b', 'b', 'a']);
  });

  test('unhappy path (one item fails to activate)', async () => {
    const activatables = new ActivatableCollection();
    const a = new ThingThatDoesntFail();
    const b = new ThingThatFailsToActivate();
    activatables.push(a);
    activatables.push(b);

    expect(activatables.state).toBe('deactivated');
    const res = activatables.activate();
    await expect(res).rejects.toThrow('fail');
    expect(a.state).toEqual('deactivated');
    expect(b.state).toEqual('deactivated');
    expect(activatables.state).toEqual('deactivated');
  });

  test('unhappy path (one item fails to deactivate)', async () => {
    const activatables = new ActivatableCollection();
    const a = new ThingThatDoesntFail();
    const b = new ThingThatFailsToDeactivate();
    const c = new ThingThatDoesntFail();
    activatables.push(a);
    activatables.push(b);
    activatables.push(c);

    expect(activatables.state).toBe('deactivated');
    await activatables.activate();
    const res = activatables.deactivate();
    await expect(res).rejects.toThrow('fail');
    expect(c.state).toEqual('deactivated');
    expect(b.state).toEqual('activated');
    expect(a.state).toEqual('activated');
    expect(activatables.state).toEqual('activated');
  });
});

import { Activatable, ActivatableCollection } from '../';

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

  test('unhappy path (one item fails to activate)', async () => {
    const activatables = new ActivatableCollection();
    const a = new ThingThatDoesntFail();
    const b = new ThingThatFailsToActivate();
    activatables.push(a);
    activatables.push(b);

    expect(activatables.state).toBe('deactivated');
    const res = activatables.activate();
    await expect(res).rejects.toThrow('fail');
    expect(a.state).toEqual('activated');
    expect(b.state).toEqual('deactivated');
    expect(activatables.state).toEqual('deactivated');
  });

  test('unhappy path (one item fails to deactivate)', async () => {
    const activatables = new ActivatableCollection();
    const a = new ThingThatDoesntFail();
    const b = new ThingThatFailsToDeactivate();
    activatables.push(a);
    activatables.push(b);

    expect(activatables.state).toBe('deactivated');
    await activatables.activate();
    const res = activatables.deactivate();
    await expect(res).rejects.toThrow('fail');
    expect(a.state).toEqual('deactivated');
    expect(b.state).toEqual('activated');
    expect(activatables.state).toEqual('activated');
  });
});

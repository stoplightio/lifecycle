import { Activatable } from '../';

const sleep = (ms: number) => new Promise((resolve, reject) => setTimeout(resolve, ms));

describe('activatable', () => {
  test('happy path', async () => {
    let counter = 0;

    class MyActivatableThing extends Activatable {
      protected async doActivate() {
        await sleep(100);
        counter++;
      }
      protected async doDeactivate() {
        await sleep(100);
        counter--;
      }
    }

    const activatable = new MyActivatableThing();

    for (const _ of [0, 1]) {
      // Initial state
      expect(activatable.state).toEqual('deactivated');
      await expect(activatable.deactivate()).resolves.toBeUndefined();

      // Activating
      let promise = activatable.activate();
      expect(activatable.state).toEqual('isActivating');
      await expect(activatable.deactivate()).rejects.toThrow();
      await expect(activatable.activate()).rejects.toThrow();

      // Activated
      await promise;
      expect(activatable.state).toEqual('activated');
      expect(counter).toEqual(1);

      // Deactivating
      promise = activatable.deactivate();
      expect(activatable.state).toEqual('isDeactivating');
      await expect(activatable.deactivate()).rejects.toThrow();
      await expect(activatable.activate()).rejects.toThrow();

      // Deactivated
      await promise;
      expect(activatable.state).toEqual('deactivated');
      expect(counter).toEqual(0);
    }
  });

  test('unhappy path (activation fails)', async () => {
    let counter = 0;

    class MyActivatableThing extends Activatable {
      protected async doActivate() {
        counter++;
        if (counter === 2) throw new Error('AGH!!');
      }
      protected async doDeactivate() {
        // noop
      }
    }

    const activatable = new MyActivatableThing();
    await activatable.activate();
    await activatable.deactivate();

    // Errored
    let error = null;
    try {
      await activatable.activate();
    } catch (e) {
      error = e;
    } finally {
      expect(error).not.toBeNull();
      expect(activatable.state).toEqual('deactivated');
    }
  });

  test('unhappy path (deactivation fails)', async () => {
    let counter = 0;

    class MyActivatableThing extends Activatable {
      protected async doActivate() {
        // noop
      }
      protected async doDeactivate() {
        counter++;
        if (counter === 2) throw new Error('AGH!!');
      }
    }

    const activatable = new MyActivatableThing();
    await activatable.activate();
    await activatable.deactivate();
    await activatable.activate();

    // Errored
    let error = null;
    try {
      await activatable.deactivate();
    } catch (e) {
      error = e;
    } finally {
      expect(error).not.toBeNull();
      expect(activatable.state).toEqual('activated');
    }
  });
});

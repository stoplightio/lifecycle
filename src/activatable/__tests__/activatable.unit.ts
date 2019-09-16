import { Activatable, LifecycleState } from '../';

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

    for (const i of [0, 1]) {
      // Initial state
      if (i === 0) {
        expect(activatable.state).toEqual(LifecycleState.Created);
      } else {
        expect(activatable.state).toEqual(LifecycleState.Deactivated);
      }
      expect(activatable.isFailed).toEqual(false);
      if (i === 0) {
        await expect(activatable.deactivate()).rejects.toThrow();
      } else {
        await expect(activatable.deactivate()).resolves.toBeUndefined();
      }

      // Activating
      let promise = activatable.activate();
      expect(activatable.state).toEqual(LifecycleState.Activating);
      expect(activatable.isActivating).toEqual(true);
      await expect(activatable.deactivate()).rejects.toThrow();
      await expect(activatable.activate()).rejects.toThrow();

      // Activated
      await promise;
      expect(activatable.state).toEqual(LifecycleState.Activated);
      expect(activatable.isActivating).toEqual(false);
      expect(activatable.isActivated).toEqual(true);
      expect(counter).toEqual(1);

      // Deactivating
      promise = activatable.deactivate();
      expect(activatable.state).toEqual(LifecycleState.Deactivating);
      expect(activatable.isActivating).toEqual(false);
      expect(activatable.isDeactivating).toEqual(true);
      await expect(activatable.deactivate()).rejects.toThrow();
      await expect(activatable.activate()).rejects.toThrow();

      // Deactivated
      await promise;
      expect(activatable.state).toEqual(LifecycleState.Deactivated);
      expect(activatable.isDeactivating).toEqual(false);
      expect(activatable.isDeactivated).toEqual(true);
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
    try {
      await activatable.activate();
    } catch (e) {
      // uncaught promises must be caught because.
    } finally {
      expect(activatable.isActivating).toEqual(false);
      expect(activatable.isActivated).toEqual(false);
      expect(activatable.isDeactivating).toEqual(false);
      expect(activatable.isDeactivated).toEqual(false);
      expect(activatable.isFailed).toEqual(true);
    }

    // Can no longer activate or deactivate it
    await expect(activatable.activate()).rejects.toThrow();
    await expect(activatable.deactivate()).rejects.toThrow();
    await expect(activatable.activate()).rejects.toThrow();
    await expect(activatable.deactivate()).rejects.toThrow();
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
    try {
      await activatable.deactivate();
    } catch (e) {
      // uncaught promises must be caught because.
    } finally {
      expect(activatable.isActivating).toEqual(false);
      expect(activatable.isActivated).toEqual(false);
      expect(activatable.isDeactivating).toEqual(false);
      expect(activatable.isDeactivated).toEqual(false);
      expect(activatable.isFailed).toEqual(true);
    }

    // Can no longer activate or deactivate it
    await expect(activatable.activate()).rejects.toThrow();
    await expect(activatable.deactivate()).rejects.toThrow();
    await expect(activatable.deactivate()).rejects.toThrow();
    await expect(activatable.activate()).rejects.toThrow();
  });
});

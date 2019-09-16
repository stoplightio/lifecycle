import { Activatable, ActivatableCollection } from '../';

const sleep = (ms: number) => new Promise((resolve, reject) => setTimeout(resolve, ms));

describe('activatable', () => {
  test('collection', async () => {
    class MyActivatableThing extends Activatable {
      protected async doActivate() {
        await sleep(100);
      }
      protected async doDeactivate() {
        await sleep(100);
      }
    }
    const createActivatable = () => new MyActivatableThing();

    const activatables = new ActivatableCollection();
    const a = createActivatable();
    const b = createActivatable();
    activatables.push(a);
    activatables.push(b);

    expect(activatables.isActivated).toEqual(false);
    await activatables.activate();
    expect(a.isActivated).toEqual(true);
    expect(b.isActivated).toEqual(true);
    expect(activatables.isActivated).toEqual(true);

    await activatables.deactivate();
    expect(activatables.isDeactivated).toEqual(true);
    expect(a.isDeactivated).toEqual(true);
    expect(b.isDeactivated).toEqual(true);
  });
});

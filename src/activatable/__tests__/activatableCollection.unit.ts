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
});

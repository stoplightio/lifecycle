import { Activatable } from '../..';

export class ThingWhereOrderMatters extends Activatable {
  constructor(public ordering: string[], public id: string) {
    super();
  }
  protected async doActivate() {
    this.ordering.push(this.id);
  }
  protected async doDeactivate() {
    this.ordering.push(this.id);
  }
}

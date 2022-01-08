import { dbref } from "../models/dbref";
import { createThing, Thing } from "../models/thing";
import { Database } from "./interface";

export class MemoryDatabase implements Database {
  data: Record<dbref, Thing> = {};

  get(id: dbref): Thing | undefined {
    return this.data[id];
  }

  create(): Thing {
    const thing = createThing();
    this.data[thing.id] = thing;
    return thing;
  }

  destroy(id: dbref): void {
    delete this.data[id];
  }

  size(): number {
    return Object.keys(this.data).length;
  }
}

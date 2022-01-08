import { dbref } from "../dbref";

export class Thing {
  id: dbref;
  name: string;

  constructor(from: Thing) {
    this.id = from.id;
    this.name = from.name;
  }
}


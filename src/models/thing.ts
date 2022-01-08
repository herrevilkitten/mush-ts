import { Attribute, AttributeValueType, createAttribute } from "./attribute";
import { dbref, ID } from "./dbref";

export type ThingType = "room" | "exit" | "player";

export class Thing {
  id: dbref = 0;
  owner: dbref = 0;
  parent: dbref = -1;
  location: dbref = 0;
  name = "";

  contents = new Set<Thing>();
  attributes = new Map<string, Attribute>();

  getCommands() {
    return [...this.attributes.values()].filter((entry) => entry.type === "command");
  }

  getTriggers() {
    return [...this.attributes.values()].filter((entry) => entry.type === "trigger");
  }

  createAttribute(name: string, value: AttributeValueType) {
    const attribute = createAttribute();
    attribute.owner = this.id;
    attribute.name = name;
    attribute.type = "value";
    attribute.value = value;
    return attribute;
  }
}

export function createThing() {
  const thing = new Thing();
  thing.id = ID.get();
  return thing;
}

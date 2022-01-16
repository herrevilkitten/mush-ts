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
  properties = new Map<string, Attribute>();
  commands = new Map<string, string>();
  functions = new Map<string, Function>();

  getCommands() {
    return [...this.properties.values()].filter((entry) => entry.type === "command");
  }

  getTriggers() {
    return [...this.properties.values()].filter((entry) => entry.type === "trigger");
  }

  createAttribute(name: string, value: AttributeValueType) {
    const attribute = createAttribute();
    attribute.owner = this.id;
    attribute.name = name;
    attribute.type = "value";
    attribute.value = value;
    this.properties.set(name, attribute);
    return attribute;
  }
}

export function createThing() {
  const thing = new Thing();
  thing.id = ID.get();
  return thing;
}

export class ThingMap extends Map<dbref, Thing> {
  getByName(name: string) {
    const lcName = name.toLowerCase();
    for (let thing of this.values()) {
      if (thing.name.toLowerCase() === lcName) {
        return thing;
      }
    }
    return undefined;
  }

  getByOwner(owner: dbref) {
    for (let thing of this.values()) {
      if (thing.owner === owner) {
        return thing;
      }
    }
    return undefined;
  }
}

import { Attribute } from "./attribute";

export type ThingType = "room" | "exit" | "player";

export class Thing {
  id = 0;
  name = "";
  description = "";
  type: ThingType = "room";

  contents = new Set<Thing>();
  attributes = new Map<string, Attribute>();

  getCommands() {
    return [...this.attributes.values()].filter((entry) => entry.type === "command");
  }

  getTriggers() {
    return [...this.attributes.values()].filter((entry) => entry.type === "trigger");
  }
}

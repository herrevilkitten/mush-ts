import { MemoryDatabase } from "./database/memory";
import { Client, ClientMap } from "./clients/client";
import { consoleClient } from "./clients/console-client";
import { dbref } from "./models/dbref";
import { Thing, ThingMap } from "./models/thing";
import { Attribute } from "./models/attribute";
import { InternalCommands } from "./world/commands";
import { VirtualMachine } from "./world/virtual-machine";

export class World {
  database = new MemoryDatabase();
  clients = new ClientMap();
  players = new ThingMap();
  attributes = new Map<dbref, Map<dbref, Attribute>>();
  connections = new Map<Thing, Client>();
  settings: any = {
    starting: {
      room: 1,
    },
  };
  vm: VirtualMachine;
  commands: InternalCommands;

  constructor() {
    this.vm = new VirtualMachine(this);
    this.commands = new InternalCommands(this);
  }

  findInternalcommand(actor: Thing, text: string) {
    text = text.trim();
    const commandEndIndex = text.indexOf(" ");
    let command = "";
    if (commandEndIndex === -1) {
      command = text;
    } else {
      command = text.substring(0, commandEndIndex);
    }
    console.log("findInternalCommand", actor, text, command);
    switch (command) {
      case "@quit":
        return this.commands.doQuit(actor);
      case "@eval":
        return this.commands.doEval(actor, text);
      case "@who":
        return this.commands.doQuit(actor);
      case "@define-command":
        return this.commands.doDefineCommand(actor, text);
    }
    return false;
  }

  findCodedCommand(actor: Thing, text: string) {
    console.log("findCodedCommand", actor, text);
    return false;
  }

  findCommand(actor: Thing, text: string) {
    text = text.trim();

    if (text.startsWith("@")) {
      return this.findInternalcommand(actor, text);
    } else {
      return this.findCodedCommand(actor, text);
    }
  }

  startClientManagers() {
    consoleClient(this);
  }

  start() {
    this.startClientManagers();
  }
}

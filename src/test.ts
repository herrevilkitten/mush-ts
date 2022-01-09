import { MemoryDatabase } from "./database/memory";
//import { Attribute, createAttribute } from "./models/attribute";
import { dbref, isDbRef } from "./models/dbref";
//import { createThing, Thing, ThingType } from "./models/thing";
//import { executeScript } from "./vm/context";
/*
const database = new MemoryDatabase();

const thing = database.create();
const attribute = createAttribute();

attribute.owner = thing.id;
attribute.name = "emitToLocation";
attribute.value = `
console.log("This is a test");
console.log(actor.id);
actor.emitToLocation = "no";
console.log(actor);
console.log(actor.emit);
actor.emit("hello");
`;
thing.attributes.set(attribute.name, attribute);

function canViewAttribute(looker: Thing, attribute: Attribute) {
  let owner: dbref | undefined = attribute.owner;
  while (owner !== undefined) {
    if (looker.id === owner) {
      return true;
    }
    owner = database.get(owner)?.owner;
  }
}

function getAttributeValue(accessor: Thing, attribute: Attribute) {
  if (!canViewAttribute(accessor, attribute)) {
    return undefined;
  }
  return attribute.value;
}

export type BuiltinFunction = (this: Thing, ...args: any[]) => any;

export const BuiltIns: Record<string, BuiltinFunction> = {
  emit(this: Thing, text: string) {
    console.log(`${this.id} says ${text}`);
  },
};
*/
export interface DatabaseThng {
  id: dbref;
  parent: dbref;
  owner: dbref;
  name: string;

  properties: Map<string, string>;
  commands: Map<string, string>;
  functions: Map<string, Function>;
}

export class Thng {
  id: dbref;

  constructor(id: dbref) {
    this.id = id;
  }
}

const t = new Thng(1);
const db: DatabaseThng[] = [
  {
    id: 0,
    parent: -1,
    owner: -1,
    name: "Wizard",
    properties: new Map<string, string>(),
    commands: new Map<string, string>(),
    functions: new Map<string, Function>(),
  },
  {
    id: 1,
    parent: -1,
    owner: -1,
    name: "Eric",
    properties: new Map<string, string>(),
    commands: new Map<string, string>(),
    functions: new Map<string, Function>(),
  },
];

db[1].functions.set("emit", (...message: string[]) => {
  console.log(...message);
});

function getDatabaseThng(id: dbref): DatabaseThng | undefined {
  return db[id];
}

function createThingProxy(thing: Thng) {
  return new Proxy(thing, {
    get: function (target, prop, receiver) {
      console.log("get", target, prop, receiver);
      const t = getDatabaseThng(target.id);
      if (!t) {
        throw new Error(`Object #${target.id} does not exist.`);
      }
      if (typeof prop !== "string") {
        return undefined;
      }
      let value: any;
      if (prop in t) {
        if (typeof (t as any)[prop] === "object") {
          return undefined;
        }

        value = (t as any)[prop];
      }
      if (value === undefined) {
        value = t.properties.get(prop);
      }
      if (value === undefined) {
        value = t.functions.get(prop);
      }
      if (isDbRef(value)) {
        value = createThingProxy(new Thng(value));
      }
      console.log({ prop, value });
      return value;
    },
    set: function (target, prop, value, receiver) {
      console.log("set", target, prop, value, receiver);
      const t = getDatabaseThng(target.id);
      if (!t) {
        throw new Error(`Object #${target.id} does not exist.`);
      }
      if (typeof prop !== "string") {
        return false;
      }
      if (typeof value === "function") {
        t.functions.set(prop, value);
      }
      return true;
    },
    ownKeys: function (target: Thng) {
      const t = getDatabaseThng(target.id);
      if (!t) {
        throw new Error(`Object #${target.id} does not exist.`);
      }
      const keys = Object.keys(t).filter((key) => typeof (t as any)[key] !== "object");
      keys.push(...t.properties.keys());
      keys.push(...t.functions.keys());
      return keys;
    },
  });
}

const actor = createThingProxy(t);
//Object.freeze(actor);

import vm from "vm";
import { Attribute } from "./models/attribute";
import { Thing } from "./models/thing";

const scriptCache: Record<string, vm.Script> = {};

const contextOptions: vm.CreateContextOptions = {
  codeGeneration: {
    strings: false,
    wasm: false,
  },
};

const runScriptOptions: vm.RunningScriptOptions = {
  timeout: 100,
};

export function compileAttribute(attribute: string) {
  const scriptId = `1`;
  if (typeof attribute !== "string") {
    throw new Error(`VM error: attribute ${scriptId} is not a string.`);
  }

  console.debug(`Compiling ${scriptId}`);
  const script = new vm.Script(attribute, {
    filename: `#${scriptId}`,
  });
  scriptCache[scriptId] = script;
  return script;
}

export function executeScript(actor: Thng, attribute: string) {
  const scriptId = `1`;
  let script = scriptCache[scriptId];
  if (!script) {
    script = compileAttribute(attribute);
  }

  console.debug(`Creating VM context for ${scriptId}`);
  const context = vm.createContext(
    {
      me: actor,
      console: {
        log(...args: any[]) {
          console.log(...args);
        },
        error(...args: any[]) {
          console.error(...args);
        },
      },
    },
    contextOptions
  );
  console.debug(`Running ${scriptId}`);
  const result = script.runInContext(context, runScriptOptions);

  return result;
}

function main() {
  const result = executeScript(
    actor,
    `
  console.log("This is a test");
  console.log(me.id);
  me.emitToLocation = "no";
  me.say = function(...text) {
    console.error(...text)
  }
  console.log("me", me);
  console.log("me.emit", me.emit);
  me.emit("hello");
  me.say("I am saying something.")
  console.log(Object.keys(me))
  Object.getOwnPropertyNames(me).forEach((prop) => console.log(prop, me[prop]))
  `
  );
  console.log({ result });
}
main();

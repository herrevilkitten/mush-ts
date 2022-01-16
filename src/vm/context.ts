import vm from "vm";
import { Attribute } from "../models/attribute";
import { Thing } from "../models/thing";
import { World } from "../world";
import { dbref, isDbRef } from "../models/dbref";
import { Stream, Writable } from "stream";
import { Console } from "console";
import { ClientStream } from "../clients/client";

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

export function compileString(script: string, filename = "immediate") {
  console.debug(`Compiling ${script}`);
  const compiledScript = new vm.Script(script, { filename });
  return compiledScript;
}

export function compileAttribute(attribute: Attribute) {
  const scriptId = `#${attribute.owner}.#${attribute.id}`;
  if (typeof attribute.value !== "string") {
    throw new Error(`VM error: attribute ${scriptId} is not a string.`);
  }

  console.debug(`Compiling ${scriptId}`);
  const compiledScript = compileString(attribute.value, scriptId);
  scriptCache[scriptId] = compiledScript;
  return compiledScript;
}

function createThingProxy(world: World, thing: Thing) {
  return new Proxy(thing, {
    get: function (target, prop, receiver) {
      console.log("get", target, prop, receiver);
      const t = world.database.get(target.id);
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
        if (value) {
          value = value.value;
        }
      }
      if (value === undefined) {
        value = t.functions.get(prop);
      }
      if (isDbRef(value)) {
        const refenencedThing = world.database.get(value);
        if (!refenencedThing) {
          return undefined;
        }
        value = createThingProxy(world, refenencedThing);
      }
      console.log({ prop, value });
      return value;
    },
    set: function (target, prop, value, receiver) {
      console.log("set", target, prop, value, receiver);
      const t = world.database.get(target.id);
      if (!t) {
        throw new Error(`Object #${target.id} does not exist.`);
      }
      if (prop in t) {
        return false;
      }
      if (typeof prop !== "string") {
        return false;
      }
      if (typeof value === "function") {
        t.functions.set(prop, value);
      } else {
        t.createAttribute(prop, value);
      }
      return true;
    },
    ownKeys: function (target: Thing) {
      const t = world.database.get(thing.id);
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

export function executeScript(world: World, actor: Thing, script: string) {
  console.log("Executing", script);
  const compiledScript = compileString(script);
  const actorProxy = createThingProxy(world, actor);

  console.debug(`Creating VM context`);
  const client = world.connections.get(actor);
  let clientStream: Writable | undefined;
  if (!client) {
    clientStream = process.stdout;
  } else {
    clientStream = new ClientStream(client);
  }
  const clientConsole = new Console({ stdout: clientStream });
  const context = vm.createContext(
    {
      me: actorProxy,
      console: clientConsole,
    },
    contextOptions
  );
  console.debug(`Running`);
  const result = compiledScript.runInContext(context, runScriptOptions);

  return result;
}

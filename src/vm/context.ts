import vm from "node:vm";
import { Attribute } from "../models/attribute";
import { Thing } from "../models/thing";

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

export function compileAttribute(attribute: Attribute) {
  const scriptId = `${attribute.owner}.${attribute.name}`;
  if (typeof attribute.value !== "string") {
    throw new Error(`VM error: attribute ${scriptId} is not a string.`);
  }

  console.debug(`Compiling ${scriptId}`);
  const script = new vm.Script(attribute.value, {
    filename: `#${scriptId}`,
  });
  scriptCache[scriptId] = script;
  return script;
}

export function executeScript(actor: Thing, attribute: Attribute) {
  const scriptId = `${attribute.owner}.${attribute.name}`;
  let script = scriptCache[scriptId];
  if (!script) {
    script = compileAttribute(attribute);
  }

  console.debug(`Creating VM context for ${scriptId}`);
  const context = vm.createContext(
    {
      actor: actor,
      console: {
        log(...args: any[]) {
          console.log(...args);
        },
      },
    },
    contextOptions
  );
  console.debug(`Running ${scriptId}`);
  const result = script.runInContext(context, runScriptOptions);

  return result;
}

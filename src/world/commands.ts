import { Thing } from "../models/thing";
import { World } from "../world";

export class InternalCommands {
  world: World;
  constructor(world: World) {
    this.world = world;
  }

  doQuit(actor: Thing) {
    const client = this.world.connections.get(actor);
    if (!client) {
      return console.error("No client for actor", actor);
    }

    client.disconnect();
    return true;
  }

  doEval(actor: Thing, text: string) {
    const functionString = text.replace(/\@eval\s+/, "");
    const result = this.world.vm.executeScript(actor, functionString);
    console.log({ result });
    return true;
  }

  doDefineCommand(actor: Thing, text: string) {
    const expression = parseCommandDefinition(text.replace("@define-command", "").trim());
    console.log({ expression });
    return true;
  }
}

// /([*+?](:\w+)*)

const argumentPattern = /([*+?])((?:\:\w+)*)/gi;

function parseCommandDefinition(text: string) {
  text = text.trim();
  console.log({ text });
  const entries = [];
  for (let match of text.matchAll(argumentPattern)) {
    console.log(match);
    const type = match[1];
    let filters: string[] = [];
    if (match[2]) {
      filters = match[2].split(":").slice(1);
    }
    entries.push({ type, filters });
  }
  const expression = text.replace(/[+*?]/g, (value) => {
    switch (value) {
      case "?":
        return "(.)";
      case "+":
        return "(.+?)";
      case "*":
        return "(.*?)";
      default:
        return value;
    }
  });
  console.log(expression, entries);
  return { expression, entries };

  /*
  text = text.trim();
  let expression = "";
  let prev = "";
  const args = [];
  for (let c of text) {
    switch (c) {
      case "*":
        expression = expression + "(.*?)";
        args.push({ type: "string", optional: true });
        break;
      case "+":
        expression = expression + "(.+?)";
        args.push({ type: "string", optional: false });
        break;
      case "?":
        expression = expression + "(.)";
        args.push({ type: "string", optional: false });
        break;
      case ":":
        break;
      default:
        expression = expression + c;
        break;
    }
  }

  return { regexp: new RegExp(expression, "i"), args };
  */
}

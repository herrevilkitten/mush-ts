import { Thing } from "./models/thing";
import { executeScript } from "./vm/context";
import { World } from "./world";

export function doQuit(world: World, actor: Thing) {
  const client = world.connections.get(actor);
  if (!client) {
    return console.error("No client for actor", actor);
  }

  client.disconnect();
  return true;
}

export function doEval(world: World, actor: Thing, text: string) {
  const functionString = text.replace(/\@eval\s+/, "");
  const result = executeScript(world, actor, functionString);
  return true;
}

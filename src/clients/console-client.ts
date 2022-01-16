import { openStdin } from "process";
import { World } from "../world";
import { Client, ClientManager, CLIENTS } from "./client";

const CLIENT_ID = "console";

function consoleClientSend(clientId: string, text: string | string[]) {
  if (!Array.isArray(text)) {
    text = [text];
  }
  console.log(">>>", ...text);
}

function consoleClientDisconnect(clientId: string) {
  console.log("Disconnecting and terminating.");
  process.exit(0);
}

export const consoleClient: ClientManager = (world: World) => {
  console.log("Starting console client");
  const stdin = openStdin();

  stdin.addListener("data", (data) => {
    const text = data.toString().trim();
    console.log("<<", text);
    let client = world.clients.get(CLIENT_ID);
    if (!client) {
      client = new Client(CLIENT_ID, consoleClientSend, consoleClientDisconnect);
      world.clients.set(CLIENT_ID, client);
    }

    client.input.add(text);
  });
};

export function startConsoleClient() {
  const stdin = openStdin();

  stdin.addListener("data", (data) => {
    const text = data.toString().trim();
    console.log("<<", text);
    let client = CLIENTS.get(CLIENT_ID);
    if (!client) {
      client = new Client(CLIENT_ID, consoleClientSend, consoleClientDisconnect);
      CLIENTS.set(CLIENT_ID, client);
    }

    client.input.add(text);
  });
}

import { Client, CLIENTS, ClientState } from "./clients/client";
import { Thing } from "./models/thing";
import { startExpressServer } from "./servers/express-server";
import { World } from "./world";

const TICKS_PER_SECOND = 10;
const MILLISECONDS_PER_TICK = 1000 / TICKS_PER_SECOND;

export function main() {
  console.log("Starting main");
  const WORLD = new World();

  function processLoginInput(client: Client, input: string) {
    const args = input.split(/\s+/);
    const command = args.shift()?.toLowerCase();
    switch (command) {
      case "who":
        // List the players currently connected
        break;
      case "create":
        // Create a new player
        let playerName = args.shift();
        if (!playerName) {
          return client.send(`You must provide the name for your player.`);
        }
        if (WORLD.players.getByName(playerName)) {
          return client.send(`A player named '${playerName}' already exists.`);
        }
        let player = WORLD.database.create();
        player.name = playerName;
        client.player = player;
        WORLD.connections.set(player, client);
        player.location = WORLD.settings.starting.room;
        return client.send(`Welcome to the world, ${playerName}.`);
        break;
      case "connect":
        // Play an existing character
        playerName = args.shift();
        if (!playerName) {
          return client.send(`You must provide the name for your player.`);
        }
        if (!WORLD.players.getByName(playerName)) {
          return client.send(`No players named '${playerName}' exist.`);
        }
        break;
      default:
        client.send(`Unknown command '${command}'.`);
        break;
    }
  }

  function processPlayingInput(client: Client, input: string) {
    console.log("Playing", input);
    if (!input) {
      return client.send("Huh?");
    }
    if (!client.player) {
      return console.error("Client is sending commands with no attached player", client);
    }
    const results = WORLD.findCommand(client.player, input);
    if (!results) {
      return client.send(`Huh?`);
    }
  }

  function processInput(client: Client) {
    const input = client.input.get();
    if (!input) {
      return;
    }
    client.lastInput = Date.now();

    console.log(`Input from ${client.clientId}: ${input}`);
    if (!client.player) {
      // The client does not have an attached player, so only the "login" commands are
      // allowed.
      return processLoginInput(client, input);
    } else {
      return processPlayingInput(client, input);
    }
  }

  function processOutput(client: Client) {
    client.send(client.output);
  }

  function isIdle(client: Client) {
    return client.lastInput + 1000 * 60 * 5 < Date.now();
  }

  function isAFK(client: Client) {
    return client.lastInput + 1000 * 60 * 30 < Date.now();
  }

  function gameLoop() {
    console.log("Starting game loop");
    let inLoop = false;
    let counter = 0;
    const loopTimer = setInterval(() => {
      counter++;

      // If the previous iteration is still running, then skip this iteration
      if (counter % 100 == 0) {
        //        console.log(`Loop: ${WORLD.clients.size} clients`);
      }
      if (inLoop) {
        return;
      }
      inLoop = true;

      if (counter % 100 == 0) {
        //        console.log("Check input");
      }

      // Gather player input
      for (let client of WORLD.clients.values()) {
        processInput(client);
      }

      // Update world state

      // Send player output
      for (let client of WORLD.clients.values()) {
        processOutput(client);
      }

      // Disconnect players who are idle or in a strange state
      for (let client of WORLD.clients.values()) {
        if (client.state < ClientState.IDLE && isIdle(client)) {
          client.state = ClientState.IDLE;
          client.send("You are now idle.");
        } else if (isAFK(client)) {
          client.send("Disconnected for being idle too long.");
          client.disconnect();
        }
      }

      inLoop = false;
    }, MILLISECONDS_PER_TICK);
  }

  WORLD.start();

  startExpressServer();

  gameLoop();
}

main();

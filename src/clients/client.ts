import { Writable } from "stream";
import { Thing } from "../models/thing";
import { World } from "../world";

export enum ClientState {
  ACTIVE,
  IDLE,
  AFK,
}

export class ClientBuffer {
  buffer: string[] = [];

  add(input: string | string[]): number {
    if (Array.isArray(input)) {
      this.buffer.push(...input);
    } else {
      this.buffer.push(input);
    }
    return this.buffer.length;
  }

  clear() {
    this.buffer.length = 0;
  }

  get() {
    return this.buffer.shift();
  }
}

export class Client {
  player?: Thing;
  clientId = "";
  state = ClientState.ACTIVE;
  input = new ClientBuffer();
  output = new ClientBuffer();
  lastInput = Date.now();
  snoopyBy?: Client;
  sendCallback: ClientSendCallback;
  disconnectCallback: ClientDisconnectCallback;

  constructor(clientId: string, sendCallback: ClientSendCallback, disconnectCallback: ClientDisconnectCallback) {
    this.clientId = clientId;
    this.sendCallback = sendCallback;
    this.disconnectCallback = disconnectCallback;
  }

  send(buffer: string | string[] | ClientBuffer) {
    let output = [];
    if (buffer instanceof ClientBuffer) {
      output.push(...buffer.buffer);
      buffer.clear();
    } else if (Array.isArray(buffer)) {
      output.push(...buffer);
    } else {
      if (buffer === "") {
        return;
      }
      output.push(buffer);
    }

    if (output.length === 0) {
      return;
    }

    this.sendCallback(this.clientId, output);
  }

  disconnect() {
    this.disconnectCallback(this.clientId);
  }
}

export class ClientStream extends Writable {
  client: Client;
  constructor(client: Client) {
    super();
    this.client = client;
  }

  _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    this.client.send(chunk.toString());
    callback();
  }
}

export type ClientManager = (world: World) => void;

export type ClientSendCallback = (clientId: string, text: string | string[]) => boolean | void;

export type ClientDisconnectCallback = (clientId: string) => boolean | void;

export class ClientMap extends Map<string, Client> {}

export const CLIENTS = new ClientMap();

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

export abstract class Client {
  clientId = "";
  state = ClientState.ACTIVE;
  input = new ClientBuffer();
  output = new ClientBuffer();
  lastInput = Date.now();
  snoopyBy?: Client;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  abstract send(buffer: string | string[] | ClientBuffer): void;

  disconnect() {}
}

export class ClientMap extends Map<string, Client> {}

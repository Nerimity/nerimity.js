import EventEmitter from "eventemitter3";
import { WebSocket } from "ws";

export type EventMap = {
  ready: () => void;
};

const PORT_RANGES = [6463, 6472];

export interface EmitPayload {
  name: string;
  action?: string;
  title?: string;
  subtitle?: string;
  imgSrc?: string;
  startedAt?: number;
  endsAt?: number;
  speed?: number;
}
function findRunningServer(appId: string) {
  return new Promise<null | WebSocket>((res) => {
    let servers: WebSocket[] = [];
    let id = setTimeout(() => {
      res(null);
    }, 5000);
    for (let port = PORT_RANGES[0]; port < PORT_RANGES[1] + 1; port++) {
      const server = new WebSocket(`ws://localhost:${port}?appId=${appId}`);
      const index = servers.length;
      servers.push(server);

      server.on("message", (data) => {
        const message = jsonParseCatch(data.toString());
        if (message.name === "HELLO_NERIMITY_RPC") {
          clearTimeout(id);
          servers.forEach((server, i) => {
            if (i === index) return;
            server.removeAllListeners();
            server.close();
          });
          server.send(JSON.stringify(message));
          res(server);
        }
      });

      server.on("error", (err) => {});
    }
  });
}

export class RPCClient extends EventEmitter<EventMap> {
  appId?: string;
  ws?: WebSocket | null;
  loggedIn = false;
  constructor() {
    super();
  }

  send(payload: EmitPayload | null) {
    if (!this.ws) return;
    this.ws.send(
      JSON.stringify({
        name: "UPDATE_RPC",
        data: payload,
      })
    );
  }

  async login(appId: string): Promise<boolean> {
    if (this.loggedIn) return true;
    this.appId = appId;
    this.ws = await findRunningServer(appId);
    if (!this.ws) return await this.login(appId);
    this.loggedIn = true;
    this.emit("ready");
    return true;
  }
}

const jsonParseCatch = (json: string) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

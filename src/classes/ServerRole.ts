import { RawServerRole } from "../RawData";
import { Client } from "./Client";
import { Collection } from "./Collection";
import { Server } from "./Server";

export class ServerRoles {
  client: Client;
  cache: Collection<string, ServerRole>;
  constructor(client: Client) {
    this.client = client;
    this.cache = new Collection();
  }
  setCache(rawServerRole: RawServerRole) {
    const server = new ServerRole(this.client, rawServerRole);
    this.cache.set(server.id, server);
    return server;
  }
}

export class ServerRole {
  client: Client;
  id: string;
  name: string;
  permissions: number;
  hexColor: string;
  server: Server;
  order: number;
  isDefaultRole?: boolean;
  constructor(client: Client, role: RawServerRole) {
    this.client = client;
    this.server = this.client.servers.cache.get(role.serverId)!;

    this.id = role.id;
    this.name = role.name;
    this.permissions = role.permissions;
    this.hexColor = role.hexColor;
    this.order = role.order;
    this.isDefaultRole = this.server.defaultRoleId === this.id;
  }
}

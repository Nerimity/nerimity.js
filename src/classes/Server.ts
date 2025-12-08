import { RawServer } from "../RawData";
import {
  banServerMember,
  kickServerMember,
  unbanServerMember,
} from "../services/ServerService";
import { Client } from "./Client";
import { Collection } from "./Collection";
import { ServerMembers } from "./ServerMember";
import { ServerRoles } from "./ServerRole";

export class Servers {
  client: Client;
  cache: Collection<string, Server>;
  constructor(client: Client) {
    this.client = client;
    this.cache = new Collection();
  }
  setCache(rawServer: RawServer) {
    const server = new Server(this.client, rawServer);
    this.cache.set(server.id, server);
    return server;
  }
}

export class Server {
  client: Client;
  id: string;
  name: string;
  avatar?: string;
  defaultRoleId: string;
  createdById: string;

  members: ServerMembers;
  roles: ServerRoles;
  constructor(client: Client, server: RawServer) {
    this.client = client;

    this.id = server.id;
    this.name = server.name;
    this.avatar = server.avatar;
    this.members = new ServerMembers(this.client);
    this.roles = new ServerRoles(this.client);
    this.defaultRoleId = server.defaultRoleId;
    this.createdById = server.createdById;
  }

  async banMember(userId: string) {
    return banServerMember(this.client, this.id, userId);
  }
  async unbanMember(userId: string) {
    return unbanServerMember(this.client, this.id, userId);
  }
  async kickMember(userId: string) {
    return kickServerMember(this.client, this.id, userId);
  }
}

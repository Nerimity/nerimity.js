import { RawChannel } from "../RawData";
import { Channel } from "./Channel";
import { Client } from "./Client";
import { Server } from "./Server";

export class ServerChannel extends Channel {
  createdById: string;
  name: string;
  serverId: string;
  permissions: number;
  categoryId?: string;
  server: Server;

  constructor(client: Client, channel: RawChannel) {
    super(client, channel);
    this.name = channel.name;
    this.permissions = channel.permissions!;
    this.createdById = channel.createdById!;
    this.serverId = channel.serverId!;
    this.categoryId = channel.categoryId!;

    this.server = this.client.servers.cache.get(this.serverId)!;
  }
}

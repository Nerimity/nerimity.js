import { createChannel } from "../factory/ChannelFactory";
import { RawChannel } from "../RawData";
import { AllChannel } from "../types";
import { Client } from "./Client";
import { Collection } from "./Collection";

export class Channels {
  client: Client;
  cache: Collection<string, AllChannel>;
  constructor(client: Client) {
    this.client = client;
    this.cache = new Collection();
  }
  setCache(rawChannel: { id: string } & Omit<Partial<RawChannel>, "id">) {
    const channel = createChannel(this.client, rawChannel);

    this.cache.set(channel.id, channel);
    return channel;
  }
}

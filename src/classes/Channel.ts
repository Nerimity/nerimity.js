import { ChannelType, RawChannel } from "../RawData";
import { postMessage } from "../services/MessageService";
import { Client } from "./Client";
import { Collection } from "./Collection";
import { Message, MessageOpts } from "./Message";
import { Server } from "./Server";
import { ServerChannel } from "./ServerChannel";

export class Channels {
  client: Client;
  cache: Collection<string, AllChannel>;
  constructor(client: Client) {
    this.client = client;
    this.cache = new Collection();
  }
  setCache(rawChannel: { id: string } & Omit<Partial<RawChannel>, "id">) {
    let channel: AllChannel;
    if (rawChannel.serverId)
      channel = new ServerChannel(this.client, rawChannel as RawChannel);
    else channel = new Channel(this.client, rawChannel as RawChannel);
    this.cache.set(channel.id, channel);
    return channel;
  }
}

export class Channel {
  client: Client;
  id: string;

  type: ChannelType;
  createdAt?: number;
  lastMessagedAt?: number;
  server?: Server;
  constructor(client: Client, channel: RawChannel) {
    this.client = client;
    this.id = channel.id;
    this.type = channel.type;
    this.createdAt = channel.createdAt;
    this.lastMessagedAt = channel.lastMessagedAt;
    if (channel.serverId)
      this.server = this.client.servers.cache.get(channel.serverId)!;
  }

  async send(content: string, opts?: MessageOpts) {
    const RawMessage = await postMessage({
      client: this.client,
      channelId: this.id,
      content: content,
      silent: opts?.silent,
      nerimityCdnFileId: opts?.nerimityCdnFileId,
      htmlEmbed: opts?.htmlEmbed,
      buttons: opts?.buttons,
      replyToMessageIds: opts?.replyToMessageIds,
      mentionReplies: opts?.mentionReplies,
    });
    const message = new Message(this.client, RawMessage);
    return message;
  }
  toString() {
    return `[#:${this.id}]`;
  }
}

export type AllChannel = ServerChannel | Channel;

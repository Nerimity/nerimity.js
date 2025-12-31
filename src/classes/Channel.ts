import { AsyncFunctionQueue } from "../AsyncFunctionQueue";
import { ChannelType, RawChannel } from "../RawData";
import {
  deleteMessage as requestMessageDelete,
  postMessage,
} from "../services/MessageService";
import { Client } from "./Client";
import { Message, MessageOpts } from "./Message";
import { Server } from "./Server";

export class Channel {
  client: Client;
  id: string;

  messageSendQueue = new AsyncFunctionQueue();

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
    return this.messageSendQueue.add(async () => {
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
    });
  }
  toString() {
    return `[#:${this.id}]`;
  }
  async deleteMessage(messageId: string) {
    return requestMessageDelete({
      channelId: this.id,
      client: this.client,
      messageId: messageId,
    });
  }
}

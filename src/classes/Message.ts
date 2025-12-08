import {
  ChannelType,
  MessageType,
  RawMessage,
  RawMessageButton,
} from "../RawData";
import { deleteMessage, editMessage } from "../services/MessageService";
import { AllChannel } from "./Channel";
import { Client } from "./Client";
import { User } from "./User";

const UserMentionRegex = /\[@:([0-9]+)\]/gm;
const CommandRegex = /^(\/[^:\s]*):(\d+)( .*)?$/m;

export interface MessageOpts {
  htmlEmbed?: string;
  nerimityCdnFileId?: string;
  buttons?: RawMessageButton[];
  silent?: boolean;
  replyToMessageIds?: string[];
  mentionReplies?: boolean;
}

export class Message {
  client: Client;
  id: string;
  content?: string;
  type: MessageType;
  createdAt: number;
  channelId: string;
  channel: AllChannel;
  user: User;
  mentions: User[] = [];
  command?: { name: string; args: string[] };
  constructor(client: Client, message: RawMessage) {
    this.client = client;

    this.id = message.id;
    this.channelId = message.channelId;
    this.channel = client.channels.cache.get(this.channelId)!;
    this.content = message.content;
    this.type = message.type;
    this.createdAt = message.createdAt;
    this.user = this.client.users.cache.get(message.createdBy.id)!;

    const cmd = message.content?.match(CommandRegex);
    if (cmd?.[2] === this.client.user?.id) {
      this.command = {
        name: cmd?.[1]!.substring(1)!,
        args: message.content!.split(" ").slice(1),
      };
    }

    if (!this.user) {
      this.user = this.client.users.setCache(message.createdBy);
    }

    if (!this.channel) {
      this.channel = this.client.channels.setCache({
        id: this.channelId,
        type: ChannelType.DM_TEXT,
      });
    }

    if (this.content) {
      const mentionIds = [...this.content.matchAll(UserMentionRegex)].map(
        (exp) => exp[1]
      );
      this.mentions = mentionIds
        .map((id) => this.client.users.cache.get(id)!)
        .filter((u) => u);
    }
  }
  get member() {
    return this.channel.server?.members.cache.get(this.user.id);
  }
  reply(content: string, _opts?: MessageOpts) {
    const opts: MessageOpts = _opts || {};
    opts.replyToMessageIds = [this.id];
    return this.channel.send(content, opts);
  }
  async edit(content: string) {
    const RawMessage = await editMessage({
      client: this.client,
      channelId: this.channel.id,
      messageId: this.id,
      content: content,
    });
    const message = new Message(this.client, RawMessage);
    return message;
  }
  async delete() {
    return deleteMessage({
      channelId: this.channel.id,
      client: this.client,
      messageId: this.id,
    });
  }
  toString() {
    return `[q:${this.id}]`;
  }
}

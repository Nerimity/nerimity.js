import {
  ChannelType,
  MessageType,
  RawMessage,
  RawMessageButton,
} from "../RawData";
import {
  deleteMessage,
  editMessage,
  fetchMessage,
} from "../services/MessageService";
import { AllChannel } from "../types";
import { Client } from "./Client";
import { Collection } from "./Collection";
import { User } from "./User";

const UserMentionRegex = /\[@:([0-9]+)\]/gm;
const CommandRegex = /^(\/[^:\s]*):(\d+)( .*)?$/m;

export class Messages {
  client: Client;
  cache: Collection<string, Message>;
  constructor(client: Client, limit?: number) {
    this.client = client;
    this.cache = new Collection({ limit: limit ?? 1000 });
  }
  setCache(rawMessage: RawMessage) {
    const message = new Message(this.client, rawMessage);
    this.cache.set(message.id, message);
    return message;
  }
  async fetch(channelId: string, messageId: string, force = false) {
    if (!force) {
      const message = this.cache.get(messageId);
      if (message) return message;
    }
    const rawMessage = await fetchMessage({
      channelId: channelId,
      client: this.client,
      messageId: messageId,
    });

    if (!rawMessage) return undefined;

    const message = new Message(this.client, rawMessage);
    this.cache.set(message.id, message);

    return message;
  }
}

export interface MessageOpts {
  htmlEmbed?: string;
  nerimityCdnFileId?: string;
  buttons?: RawMessageButton[];
  silent?: boolean;
  replyToMessageIds?: string[];
  mentionReplies?: boolean;
}
interface EditMessageOpts {
  htmlEmbed?: string;
  buttons?: RawMessageButton[];
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
  editedAt?: number;
  replies: Collection<string, Message> = new Collection();
  raw: RawMessage;
  constructor(client: Client, message: RawMessage) {
    this.client = client;

    this.raw = message;
    this.id = message.id;
    this.channelId = message.channelId;
    this.channel = client.channels.cache.get(this.channelId)!;
    this.content = message.content;
    this.type = message.type;
    this.createdAt = message.createdAt;
    this.user = this.client.users.cache.get(message.createdBy.id)!;
    this.editedAt = message.editedAt;

    if (message.replyMessages?.length) {
      message.replyMessages.forEach((reply) => {
        if (reply.replyToMessage) {
          this.replies.set(
            reply.replyToMessage.id,
            new Message(client, reply.replyToMessage)
          );
        }
      });
    }

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
      this._updateMentions(this.content);
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
  async edit(content: string, opts?: EditMessageOpts) {
    const RawMessage = await editMessage({
      client: this.client,
      channelId: this.channel.id,
      messageId: this.id,
      content: content,
      htmlEmbed: opts?.htmlEmbed,
      buttons: opts?.buttons,
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

  private _updateMentions(content: string) {
    const mentionIds = [...content.matchAll(UserMentionRegex)].map(
      (exp) => exp[1]
    );
    this.mentions = mentionIds
      .map((id) => this.client.users.cache.get(id)!)
      .filter((u) => u);
  }
  _update(update: Partial<RawMessage>) {
    this.content = update.content || this.content;
    this.editedAt = update.editedAt || this.editedAt;
    if (this.content) {
      this._updateMentions(this.content);
    }
    this.client.messages.cache.set(this.id, this);
  }
  toString() {
    return `[q:${this.id}]`;
  }
}

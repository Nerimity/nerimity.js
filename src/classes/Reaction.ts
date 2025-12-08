import { Channel } from "./Channel";
import { Client } from "./Client";
import { Message } from "./Message";

export class Reaction {
  client: Client;

  name: string;
  count?: number;
  emojiId?: string;
  gif: boolean;
  partial: boolean = true;
  messageId: string = "";
  message?: Message;
  channel: Channel;
  constructor(
    client: Client,
    reaction: {
      messageId: string;
      gif?: boolean;
      name: string;
      emojiId?: string | null;
      channelId: string;
      count?: number;
    }
  ) {
    this.client = client;

    this.messageId = reaction.messageId;
    this.message = this.client.messages.cache.get(this.messageId);
    if (this.message) {
      this.partial = false;
    }

    this.count = reaction.count || 0;
    this.channel = this.client.channels.cache.get(reaction.channelId)!;
    this.gif = reaction.gif || false;
    this.name = reaction.name;
    this.emojiId = reaction.emojiId || undefined;
  }
  // fetch() {

  // }
}

import { MessageButtonClickPayload } from "../RawData";
import {
  ButtonCallback,
  buttonClickCallback,
} from "../services/MessageService";
import { Channel } from "./Channel";
import { Client } from "./Client";
import { Message } from "./Message";
import { User } from "./User";

export class MessageButton {
  client: Client;
  id: string;

  userId: string;
  messageId: string;
  message?: Message;
  channelId: string;

  user?: User;
  channel: Channel;

  data?: Record<string, string>;
  type: "modal_click" | "button_click";

  partial: boolean;

  constructor(client: Client, payload: MessageButtonClickPayload) {
    this.client = client;

    this.id = payload.buttonId;
    this.userId = payload.userId;
    this.channelId = payload.channelId;
    this.messageId = payload.messageId;
    this.user = this.client.users.cache.get(this.userId);

    this.channel = client.channels.cache.get(this.channelId)!;
    this.data = payload.data;
    this.type = payload.type;

    this.partial = true;

    this.message = this.client.messages.cache.get(this.messageId);

    if (this.message) {
      this.partial = false;
    }
  }

  async fetch() {
    if (this.partial) {
      this.message = await this.client.messages.fetch(
        this.channelId,
        this.messageId
      );
      this.partial = false;
    }
  }

  async respond(opts?: ButtonCallback) {
    await buttonClickCallback({
      client: this.client,
      buttonId: this.id,
      channelId: this.channelId,
      messageId: this.messageId,
      userId: this.userId,
      data: opts,
    });
  }
}

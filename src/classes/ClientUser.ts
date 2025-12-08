import { SocketClientEvents } from "../EventNames";
import { RawUser } from "../RawData";
import { Client } from "./Client";
import { User } from "./User";

export interface ActivityOpts {
  action: string;
  name: string;
  startedAt: number;
  endsAt?: number;

  imgSrc?: string;
  title?: string;
  subtitle?: string;
  link?: string;
}

export class ClientUser extends User {
  setActivity(activity?: ActivityOpts | null) {
    this.client.socket.emit(SocketClientEvents.UPDATE_ACTIVITY, activity);
  }

  constructor(client: Client, user: RawUser) {
    super(client, user);
  }
}

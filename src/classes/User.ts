import { RawUser } from "../RawData";
import { Client } from "./Client";
import { Collection } from "./Collection";

export class Users {
  client: Client;
  cache: Collection<string, User>;
  constructor(client: Client) {
    this.client = client;
    this.cache = new Collection();
  }
  setCache(rawUser: RawUser) {
    const user = new User(this.client, rawUser);
    this.cache.set(rawUser.id, user);
    return user;
  }
}
export class User {
  client: Client;
  id: string;
  avatar?: string;
  banner?: string;
  username: string;
  hexColor: string;
  tag: string;
  badges: number;
  joinedAt?: number;
  bot?: boolean;
  constructor(client: Client, user: RawUser) {
    this.client = client;

    this.id = user.id;
    this.username = user.username;
    this.tag = user.tag;

    this.hexColor = user.hexColor;
    this.badges = user.badges;
    this.joinedAt = user.joinedAt;
    this.avatar = user.avatar;
    this.banner = user.banner;
    this.bot = user.bot;
  }
  toString() {
    return `[@:${this.id}]`;
  }
}

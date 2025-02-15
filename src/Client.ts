import EventEmitter from "eventemitter3";
import { Socket, io } from "socket.io-client";
import {
  ClientEventMap,
  ClientEvents,
  SocketClientEvents,
  SocketServerEvents,
} from "./EventNames";
import {
  AuthenticatedPayload,
  ChannelType,
  MessageButtonClickPayload,
  MessageType,
  RawChannel,
  RawMessage,
  RawMessageButton,
  RawPost,
  RawServer,
  RawServerMember,
  RawUser,
} from "./RawData";
import {
  buttonClickCallback,
  deleteMessage,
  editMessage,
  postMessage,
} from "./services/MessageService";
import { path, updatePath } from "./services/serviceEndpoints";
import { deletePost, editPost, getPosts, postPost } from "./services/PostsService";

export const Events = ClientEvents;

export class Client extends EventEmitter<ClientEventMap> {
  socket: Socket;
  token: string | undefined;
  user: ClientUser | undefined;
  users: Users;
  channels: Channels;
  servers: Servers;
  posts: Posts;
  messages: Messages;

  constructor(opts?: { urlOverride?: string }) {
    super();
    if (opts?.urlOverride) {
      updatePath(opts.urlOverride);
    }
    this.socket = io(path, {
      transports: ["websocket"],
      autoConnect: false,
    });
    this.channels = new Channels(this);
    this.users = new Users(this);
    this.servers = new Servers(this);
    this.posts = new Posts(this);
    this.messages = new Messages(this);
    new EventHandlers(this);
  }

  public login(token: string) {
    this.token = token;
    this.socket.connect();
  }
}

class EventHandlers {
  client: Client;
  socket: Socket;
  constructor(client: Client) {
    this.client = client;
    this.socket = client.socket;

    client.socket.on(SocketServerEvents.CONNECT, this.onConnect.bind(this));
    client.socket.on(
      SocketServerEvents.USER_AUTHENTICATED,
      this.onAuthenticated.bind(this)
    );

    client.socket.on(
      SocketServerEvents.SERVER_MEMBER_JOINED,
      this.onServerMemberJoined.bind(this)
    );
    client.socket.on(
      SocketServerEvents.SERVER_MEMBER_LEFT,
      this.onServerMemberLeft.bind(this)
    );

    client.socket.on(
      SocketServerEvents.SERVER_JOINED,
      this.onServerJoined.bind(this)
    );
    client.socket.on(
      SocketServerEvents.SERVER_CHANNEL_CREATED,
      this.onServerChannelCreated.bind(this)
    );
    client.socket.on(
      SocketServerEvents.SERVER_CHANNEL_UPDATED,
      this.onServerChannelUpdated.bind(this)
    );
    client.socket.on(
      SocketServerEvents.SERVER_CHANNEL_DELETED,
      this.onServerChannelDeleted.bind(this)
    );

    client.socket.on(
      SocketServerEvents.SERVER_LEFT,
      this.onServerLeft.bind(this)
    );

    client.socket.on(
      SocketServerEvents.MESSAGE_CREATED,
      this.onMessageCreated.bind(this)
    );

    client.socket.on(
      SocketServerEvents.MESSAGE_BUTTON_CLICKED,
      this.onMessageButtonClicked.bind(this)
    );
  }
  onConnect() {
    this.socket.emit(SocketClientEvents.AUTHENTICATE, {
      token: this.client.token,
    });
  }
  onAuthenticated(payload: AuthenticatedPayload) {
    this.client.user = new ClientUser(this.client, payload.user);

    for (let i = 0; i < payload.servers.length; i++) {
      const server = payload.servers[i];
      this.client.servers.setCache(server);
    }

    for (let i = 0; i < payload.channels.length; i++) {
      const rawChannel = payload.channels[i];
      this.client.channels.setCache(rawChannel);
    }
    for (let i = 0; i < payload.serverMembers.length; i++) {
      const member = payload.serverMembers[i];
      this.client.users.setCache(member.user);
      const server = this.client.servers.cache.get(member.serverId);
      server?.members.setCache(member);
    }

    this.client.emit(ClientEvents.Ready);
  }

  onServerMemberJoined(payload: { serverId: string; member: RawServerMember }) {
    const server = this.client.servers.cache.get(payload.serverId);
    this.client.users.setCache(payload.member.user);
    const member = server?.members.setCache(payload.member);
    if (!member) return;
    this.client.emit("serverMemberJoined", member);
  }

  onServerJoined(payload: {
    server: RawServer;
    members: RawServerMember[];
    channels: RawChannel[];
    // roles: any[];
    // memberPresences: any[]
    // voiceChannelUsers: any[];
  }) {
    const server = this.client.servers.setCache(payload.server);

    for (let i = 0; i < payload.members.length; i++) {
      const member = payload.members[i];
      this.client.users.setCache(member.user);
      server?.members.setCache(member);
    }

    for (let i = 0; i < payload.channels.length; i++) {
      const channel = payload.channels[i];
      this.client.channels.setCache(channel);
    }
    this.client.emit(ClientEvents.ServerJoined, server);
  }
  onServerChannelCreated(payload: { serverId: string; channel: RawChannel }) {
    const channel = this.client.channels.setCache(payload.channel);
    this.client.emit(
      ClientEvents.ServerChannelCreated,
      channel as ServerChannel
    );
  }
  onServerChannelUpdated(payload: {
    serverId: string;
    channelId: string;
    updated: Partial<RawChannel>;
  }) {
    const channel = this.client.channels.cache.get(payload.channelId);
    const updated = payload.updated;
    if (channel) {
      updateClass<ServerChannel>(channel as ServerChannel, updated);
      this.client.emit(
        ClientEvents.ServerChannelUpdated,
        channel as ServerChannel
      );
    }
  }
  onServerChannelDeleted(payload: { serverId: string; channelId: string }) {
    const channel = this.client.channels.cache.has(payload.channelId);
    if (channel) {
      this.client.channels.cache.delete(payload.channelId);
      this.client.emit(ClientEvents.ServerChannelDeleted, {
        channelId: payload.channelId,
        serverId: payload.serverId,
      });
    }
  }
  onServerLeft(payload: { serverId: string }) {
    const server = this.client.servers.cache.get(payload.serverId);
    if (!server) return;
    this.client.emit(ClientEvents.ServerLeft, server);
    this.client.servers.cache.delete(payload.serverId);

    this.client.channels.cache.forEach((channel) => {
      if (
        channel instanceof ServerChannel &&
        channel.serverId === payload.serverId
      ) {
        this.client.channels.cache.delete(channel.id);
      }
    });
    server.members.cache.clear();
  }
  onServerMemberLeft(payload: { userId: string; serverId: string }) {
    const server = this.client.servers.cache.get(payload.serverId);
    const member = server?.members.cache.get(payload.userId);
    if (!member) return;
    this.client.emit("serverMemberLeft", member);
    server?.members.cache.delete(payload.userId);
  }
  onMessageCreated(payload: { message: RawMessage }) {
    const message = new Message(this.client, payload.message);
    this.client.messages.setCache(message);
    this.client.emit(ClientEvents.MessageCreate, message);
  }
  onMessageUpdated(payload: { channelId: string; messageId: string; updated: Partial<Message>}) {
    const message = this.client.messages.cache.get(payload.messageId);
    const updated = payload.updated;
    if (message) {
      updateClass<Message>(message as Message, updated);
      this.client.emit(
        ClientEvents.MessageUpdate,
        message as Message
      );
    }
  }
  onMessageButtonClicked(payload: MessageButtonClickPayload) {
    const button = new Button(this.client, payload);
    this.client.emit("messageButtonClick", button);
  }
}

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

export class Servers {
  client: Client;
  cache: Collection<string, Server>;
  constructor(client: Client) {
    this.client = client;
    this.cache = new Collection();
  }
  setCache(rawServer: RawServer) {
    const server = new Server(this.client, rawServer);
    this.cache.set(server.id, server);
    return server;
  }
}

export class Server {
  client: Client;
  id: string;
  name: string;
  avatar?: string;

  members: ServerMembers;
  constructor(client: Client, server: RawServer) {
    this.client = client;

    this.id = server.id;
    this.name = server.name;
    this.avatar = server.avatar;
    this.members = new ServerMembers(this.client);
  }
}

export class ServerMembers {
  client: Client;
  cache: Collection<string, ServerMember>;
  constructor(client: Client) {
    this.client = client;
    this.cache = new Collection();
  }
  setCache(rawMember: RawServerMember) {
    const member = new ServerMember(this.client, rawMember);
    this.cache.set(member.user.id, member);
    return member;
  }
}
export class ServerMember {
  client: Client;
  id: string;
  user: User;
  server: Server;

  constructor(client: Client, member: RawServerMember) {
    this.client = client;
    this.id = member.user.id;

    this.user = this.client.users.cache.get(member.user.id)!;
    this.server = this.client.servers.cache.get(member.serverId)!;
  }
  toString() {
    return `[@:${this.id}]`;
  }
}

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
      channel = new ServerChannel(this.client, rawChannel as any);
    else channel = new Channel(this.client, rawChannel as any);
    this.cache.set(channel.id, channel);
    return channel;
  }
}

export class Messages {
  client: Client;
  cache: Collection<string, Message>;
  constructor(client: Client) {
    this.client = client;
    this.cache = new Collection();
  }

  setCache(rawMessage: { id: string } & Omit<Partial<RawMessage>, "id">) {
    let message: Message = new Message(this.client, rawMessage as any);
    this.cache.set(message.id, message);
    return message;
  }
}

export type AllChannel = ServerChannel | Channel;

export interface MessageOpts {
  htmlEmbed?: string;
  nerimityCdnFileId?: string;
  buttons?: RawMessageButton[];
  silent?: boolean;
  replyToMessageIds?: string[];
  mentionReplies?: boolean;
}

export interface PostOpts {
  nerimityCdnFileId?: string;
  poll?: {
    choices: string[];
  };
}

export class Channel {
  client: Client;
  id: string;

  type: ChannelType;
  createdAt?: number;
  lastMessagedAt?: number;
  constructor(client: Client, channel: RawChannel) {
    this.client = client;
    this.id = channel.id;
    this.type = channel.type;
    this.createdAt = channel.createdAt;
    this.lastMessagedAt = channel.lastMessagedAt;
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

function updateClass<T extends object>(classInstance: T, update: Partial<T>) {
  for (const [key, value] of Object.entries(update) as [
    keyof T,
    T[keyof T]
  ][]) {
    classInstance[key] = value;
  }
}

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

const UserMentionRegex = /\[@:([0-9]+)\]/gm;

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
  constructor(client: Client, message: RawMessage) {
    this.client = client;

    this.id = message.id;
    this.channelId = message.channelId;
    this.channel = client.channels.cache.get(this.channelId)!;
    this.content = message.content;
    this.type = message.type;
    this.createdAt = message.createdAt;
    this.user = this.client.users.cache.get(message.createdBy.id)!;

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
  reply(content: string, opts?: MessageOpts) {
    let fOpts: MessageOpts = opts || {};
    fOpts.replyToMessageIds = [this.id];
    console.log(fOpts)
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

class Posts {
  client: Client;
  constructor(client: Client) {
    this.client = client;
  }

  async get(id?: string) {
    const RawPosts = await getPosts(this.client);
    const posts = RawPosts.map((post) => new Post(this.client, post));
    return id ? posts.find((p) => p.id === id) : posts;
  }

  async create(content: string, opts?: PostOpts) {
    const RawPost = await postPost({
      client: this.client,
      content: content,
      nerimityCdnFileId: opts?.nerimityCdnFileId,
      poll: opts?.poll,
    });

    const post = new Post(this.client, RawPost);

    return post;
  }
}

export class Post {
  client: Client;
  id: string;
  content?: string;
  attachments?: Array<any>;
  deleted: boolean;
  block?: boolean;
  commentToId: string;
  commentTo?: RawPost;
  createdBy: RawUser;
  createdAt: number;
  editedAt: number;
  likedBy: { id: string }[]; // if you liked this post, array will not be empty
  reposts: { id: string; createdBy: { id: string; username: string } }[];
  repost?: RawPost;
  _count: { likedBy: number; comments: number; reposts: number };
  views: number;
  announcement: any;
  poll?: any;

  constructor(client: Client, post: RawPost) {
    this.client = client;
    this.id = post.id;
    this.content = post.content;
    this.attachments = post.attachments;
    this.deleted = post.deleted;
    this.block = post.block;
    this.commentToId = post.commentToId;
    this.commentTo = post.commentTo;
    this.createdBy = post.createdBy;
    this.createdAt = post.createdAt;
    this.editedAt = post.editedAt;
    this.likedBy = post.likedBy;
    this.reposts = post.reposts;
    this.repost = post.repost;
    this._count = post._count;
    this.views = post.views;
    this.announcement = post.announcement;
    this.poll = post.poll;
  }

  async edit(content: string) {
    const RawPost = await editPost({
      client: this.client,
      content: content,
      postId: this.id,
    })

    const post = new Post(this.client, RawPost);
    return post;
  }

  async delete() {
    await deletePost({
      client: this.client,
      postId: this.id,
    })
  }

}

class User {
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

class ClientUser extends User {
  setActivity(activity?: ActivityOpts | null) {
    this.client.socket.emit(SocketClientEvents.UPDATE_ACTIVITY, activity);
  }

  constructor(client: Client, user: RawUser) {
    super(client, user);
  }
}

class Collection<K, V> extends Map<K, V> {
  constructor() {
    super();
  }
}

export class Button {
  client: Client;
  id: string;

  userId: string;
  messageId: string;
  channelId: string;

  user?: User;
  channel: Channel;

  constructor(client: Client, payload: MessageButtonClickPayload) {
    this.client = client;

    this.id = payload.buttonId;
    this.userId = payload.userId;
    this.channelId = payload.channelId;
    this.messageId = payload.messageId;
    this.user = this.client.users.cache.get(this.userId);

    this.channel = client.channels.cache.get(this.channelId)!;
  }

  async respond(opts?: { title?: string; content?: string }) {
    await buttonClickCallback({
      client: this.client,
      buttonId: this.id,
      channelId: this.channelId,
      messageId: this.messageId,
      userId: this.userId,
      title: opts?.title,
      content: opts?.content,
    });
  }
}

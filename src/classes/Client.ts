import EventEmitter from "eventemitter3";
import { Socket, io } from "socket.io-client";
import {
  ClientEventMap,
  ClientEvents,
  SocketClientEvents,
  SocketServerEvents,
} from "../EventNames";
import {
  AuthenticatedPayload,
  MessageButtonClickPayload,
  RawBotCommand,
  RawChannel,
  RawMessage,
  RawServer,
  RawServerMember,
  RawServerRole,
} from "../RawData";

import { path, updatePath } from "../services/serviceEndpoints";

import { updateCommands as postUpdateCommands } from "../services/ApplicationService";
import { MessageButton } from "./MessageButton";
import { ClientUser } from "./ClientUser";
import { Users } from "./User";

import { Servers } from "./Server";
import { Posts } from "./Post";
import { ServerMember } from "./ServerMember";
import { ServerChannel } from "./ServerChannel";
import { Message } from "./Message";
import { ServerRole } from "./ServerRole";
import { Channels } from "./Channels";

export const Events = ClientEvents;

export class Client extends EventEmitter<ClientEventMap> {
  socket: Socket;
  token: string | undefined;
  user: ClientUser | undefined;
  users: Users;
  channels: Channels;
  servers: Servers;
  posts: Posts;

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
    new EventHandlers(this);
  }

  updateCommands(token: string, commands: Omit<RawBotCommand, "botUserId">[]) {
    return postUpdateCommands(token, commands);
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
      SocketServerEvents.SERVER_MEMBER_UPDATED,
      this.onServerMemberUpdated.bind(this)
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
    client.socket.on(
      SocketServerEvents.SERVER_ROLE_CREATED,
      this.onServerRoleCreated.bind(this)
    );
    client.socket.on(
      SocketServerEvents.SERVER_ROLE_DELETED,
      this.onServerRoleDeleted.bind(this)
    );
    client.socket.on(
      SocketServerEvents.SERVER_ROLE_UPDATED,
      this.onServerRoleUpdated.bind(this)
    );
    client.socket.on(
      SocketServerEvents.SERVER_ROLE_ORDER_UPDATED,
      this.onServerRoleOrderUpdated.bind(this)
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

    for (let i = 0; i < payload.serverRoles.length; i++) {
      const role = payload.serverRoles[i];
      const server = this.client.servers.cache.get(role.serverId);
      server?.roles.setCache(role);
    }

    this.client.emit(ClientEvents.Ready);
  }

  onServerMemberJoined(payload: { serverId: string; member: RawServerMember }) {
    const server = this.client.servers.cache.get(payload.serverId);
    this.client.users.setCache(payload.member.user);
    const member = server?.members.setCache(payload.member);
    if (!member) return;
    this.client.emit(ClientEvents.ServerMemberJoined, member);
  }

  onServerMemberUpdated(payload: {
    serverId: string;
    userId: string;
    updated: {
      roleIds: string[];
    };
  }) {
    const server = this.client.servers.cache.get(payload.serverId);
    const member = server?.members.cache.get(payload.userId);
    if (!member) return;

    updateClass<ServerMember>(member, payload.updated);

    this.client.emit(ClientEvents.ServerMemberUpdated, member);
  }

  onServerJoined(payload: {
    server: RawServer;
    members: RawServerMember[];
    channels: RawChannel[];
    roles: RawServerRole[];
    // memberPresences: any[]
    // voiceChannelUsers: any[];
  }) {
    const server = this.client.servers.setCache(payload.server);

    for (let i = 0; i < payload.members.length; i++) {
      const member = payload.members[i];
      this.client.users.setCache(member.user);
      server?.members.setCache(member);
    }
    for (let i = 0; i < payload.roles.length; i++) {
      const role = payload.roles[i];
      server?.roles.setCache(role);
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
    this.client.emit(ClientEvents.ServerMemberLeft, member);
    server?.members.cache.delete(payload.userId);
  }
  onMessageCreated(payload: { message: RawMessage }) {
    const message = new Message(this.client, payload.message);
    this.client.emit(ClientEvents.MessageCreate, message);
  }
  onMessageButtonClicked(payload: MessageButtonClickPayload) {
    const button = new MessageButton(this.client, payload);
    this.client.emit(ClientEvents.MessageButtonClick, button);
  }
  onServerRoleCreated(payload: RawServerRole) {
    const server = this.client.servers.cache.get(payload.serverId);
    const role = server?.roles.setCache(payload);
    if (!role) return;
    this.client.emit(ClientEvents.ServerRoleCreated, role);
  }
  onServerRoleDeleted(payload: { serverId: string; roleId: string }) {
    const server = this.client.servers.cache.get(payload.serverId);
    const role = server?.roles.cache.get(payload.roleId);
    if (!role) return;
    server?.roles.cache.delete(payload.roleId);

    this.client.emit(ClientEvents.ServerRoleDeleted, role);
  }
  onServerRoleUpdated(payload: {
    serverId: string;
    roleId: string;
    updated: Partial<RawServerRole>;
  }) {
    const server = this.client.servers.cache.get(payload.serverId);
    const role = server?.roles.cache.get(payload.roleId);
    if (!role) return;

    updateClass<ServerRole>(role, payload.updated);

    this.client.emit(ClientEvents.ServerRoleUpdated, role);
  }
  onServerRoleOrderUpdated(payload: { serverId: string; roleIds: string[] }) {
    const server = this.client.servers.cache.get(payload.serverId);

    for (let i = 0; i < payload.roleIds.length; i++) {
      const roleId = payload.roleIds[i];
      const role = server?.roles.cache.get(roleId);
      if (!role) continue;
      role.order = i + 1;
    }

    this.client.emit(ClientEvents.ServerRoleOrderUpdated, server?.roles!);
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

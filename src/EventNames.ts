import { MessageButton } from "./classes/MessageButton";
import { Message } from "./classes/Message";
import { Server } from "./classes/Server";
import { ServerChannel } from "./classes/ServerChannel";
import { ServerMember } from "./classes/ServerMember";
import { ServerRole, ServerRoles } from "./classes/ServerRole";
import { Reaction } from "./classes/Reaction";
import { User } from "./classes/User";

export const ClientEvents = {
  Ready: "ready",
  MessageCreate: "messageCreate",
  MessageUpdate: "messageUpdate",
  MessageDelete: "messageDelete",
  MessageReactionAdded: "messageReactionAdded",
  MessageReactionRemoved: "messageReactionRemoved",
  ServerMemberLeft: "serverMemberLeft",
  ServerMemberJoined: "serverMemberJoined",
  ServerMemberUpdated: "serverMemberUpdated",
  ServerJoined: "serverJoined",
  ServerLeft: "serverLeft",
  MessageButtonClick: "messageButtonClick",
  ServerChannelCreated: "serverChannelCreated",
  ServerChannelUpdated: "serverChannelUpdated",
  ServerChannelDeleted: "serverChannelDeleted",
  ServerRoleCreated: "serverRoleCreated",
  ServerRoleDeleted: "serverRoleDeleted",
  ServerRoleUpdated: "serverRoleUpdated",
  ServerRoleOrderUpdated: "serverRoleOrderUpdated",
} as const;

export type ClientEventMap = {
  ready: () => void;
  messageCreate: (message: Message) => void;
  messageUpdate: (message: Message) => void;
  messageDelete: (data: { messageId: string; channelId: string }) => void;
  messageReactionAdded: (data: Reaction, user?: User) => void;
  messageReactionRemoved: (data: Reaction, user?: User) => void;
  serverMemberLeft: (member: ServerMember) => void;
  serverMemberJoined: (member: ServerMember) => void;
  serverMemberUpdated: (member: ServerMember) => void;
  serverJoined: (server: Server) => void;
  serverLeft: (server: Server) => void;
  messageButtonClick: (button: MessageButton) => void;
  serverChannelCreated: (channel: ServerChannel) => void;
  serverChannelUpdated: (channel: ServerChannel) => void;
  serverChannelDeleted: (data: { serverId: string; channelId: string }) => void;
  serverRoleCreated: (data: ServerRole) => void;
  serverRoleDeleted: (data: ServerRole) => void;
  serverRoleUpdated: (data: ServerRole) => void;
  serverRoleOrderUpdated: (data: ServerRoles) => void;
};

export const SocketClientEvents = {
  AUTHENTICATE: "user:authenticate",
  NOTIFICATION_DISMISS: "notification:dismiss",
  UPDATE_ACTIVITY: "user:update_activity",
};

export const SocketServerEvents = {
  CONNECT: "connect",
  AUTHENTICATE_ERROR: "user:authenticate_error",
  USER_UPDATED: "user:updated",

  USER_AUTHENTICATED: "user:authenticated",

  USER_PRESENCE_UPDATE: "user:presence_update",

  FRIEND_REQUEST_SENT: "friend:request_sent",
  FRIEND_REQUEST_PENDING: "friend:request_pending",
  FRIEND_REQUEST_ACCEPTED: "friend:request_accepted",
  FRIEND_REMOVED: "friend:removed",
  INBOX_OPENED: "inbox:opened",
  NOTIFICATION_DISMISSED: "notification:dismissed",

  SERVER_JOINED: "server:joined",
  SERVER_LEFT: "server:left",
  SERVER_UPDATED: "server:updated",
  SERVER_ROLE_CREATED: "server:role_created",
  SERVER_ROLE_UPDATED: "server:role_updated",
  SERVER_ROLE_ORDER_UPDATED: "server:role_order_updated",
  SERVER_CHANNEL_ORDER_UPDATED: "server:channel_order_updated",

  SERVER_ROLE_DELETED: "server:role_deleted",

  SERVER_MEMBER_JOINED: "server:member_joined",
  SERVER_MEMBER_LEFT: "server:member_left",
  SERVER_MEMBER_UPDATED: "server:member_updated",
  SERVER_CHANNEL_CREATED: "server:channel_created",
  SERVER_CHANNEL_UPDATED: "server:channel_updated",
  SERVER_CHANNEL_DELETED: "server:channel_deleted",
  SERVER_ORDER_UPDATED: "server:order_updated",

  MESSAGE_BUTTON_CLICKED: "message:button_clicked",

  MESSAGE_REACTION_ADDED: "message:reaction_added",
  MESSAGE_REACTION_REMOVED: "message:reaction_removed",

  CHANNEL_TYPING: "channel:typing",
  MESSAGE_CREATED: "message:created",
  MESSAGE_UPDATED: "message:updated",
  MESSAGE_DELETED: "message:deleted",
} as const;

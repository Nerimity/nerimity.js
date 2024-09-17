/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AuthenticatedPayload {
  user: RawUser;
  servers: RawServer[];
  serverMembers: RawServerMember[];
  messageMentions: any[];
  channels: RawChannel[];
  serverRoles: any[];
  presences: any[];
  friends: any[];
  inbox: any[];
  lastSeenServerChannelIds: Record<string, number>; // { [channelId]: timestamp }
}


export interface MessageButtonClickPayload {
  messageId: string;
  channelId: string;
  buttonId: string;
  userId: string;
}

export interface RawServer {
  id: string;
  name: string;
  hexColor: string;
  defaultChannelId: string;
  systemChannelId?: string;
  avatar?: string;
  banner?: string;
  defaultRoleId: string;
  createdById: string;
  createdAt: number;
  verified: boolean;
  customEmojis: any[];
  _count?: {
    welcomeQuestions: number;
  };
}

export interface RawUser {
  id: string;
  avatar?: string;
  banner?: string;
  username: string;
  bot?: boolean;
  hexColor: string;
  tag: string;
  badges: number;
  joinedAt?: number;
}

export enum MessageType {
  CONTENT = 0,
  JOIN_SERVER = 1,
  LEAVE_SERVER = 2,
  KICK_USER = 3,
  BAN_USER = 4,
}

export interface RawMessage {
  id: string;
  channelId: string;
  silent?: string;
  content?: string;
  createdBy: RawUser;
  type: MessageType;
  createdAt: number;
  editedAt?: number;
  mentions?: Array<RawUser>;
  attachments?: Array<any>;
  buttons?: RawMessageButton[]
}


export interface RawMessageButton {
  id: string;
  label: string;

  alert?: boolean;
}

export interface RawServerMember {
  serverId: string;
  user: RawUser;
  joinedAt: number;
  roleIds: string[];
}

export enum ChannelType {
  DM_TEXT = 0,
  SERVER_TEXT = 1,
  CATEGORY = 2,
}

export interface RawChannel {
  id: string;
  categoryId?: string;
  name: string;
  createdById?: string;
  serverId?: string;
  type: ChannelType;
  permissions?: number;
  createdAt: number;
  lastMessagedAt?: number;
  order?: number;
  _count?: { attachments: number };
}

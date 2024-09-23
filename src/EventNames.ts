import { Button, Message, Server, ServerChannel, ServerMember } from './Client';

export const ClientEvents = {
    Ready: 'ready',
    MessageCreate: 'messageCreate',
    ServerMemberLeft: 'serverMemberLeft',
    ServerMemberJoined: 'serverMemberJoined',
    ServerJoined: 'serverJoined',
    ServerLeft: 'serverLeft',
    MessageButtonClick: 'messageButtonClick',
    ServerChannelCreated: 'serverChannelCreated',
} as const;


export type ClientEventMap = {
    'ready': () => void;
    'messageCreate': (message: Message) => void;
    'serverMemberLeft': (member: ServerMember) => void;
    'serverMemberJoined': (member: ServerMember) => void;
    'serverJoined': (server: Server) => void;
    'serverLeft': (server: Server) => void;
    'messageButtonClick': (button: Button) => void;
    'serverChannelCreated': (channel: ServerChannel) => void;
}



export const SocketClientEvents = {
    AUTHENTICATE: 'user:authenticate',
    NOTIFICATION_DISMISS: 'notification:dismiss',
    UPDATE_ACTIVITY: 'user:update_activity',
};
  
export const SocketServerEvents = {
    CONNECT: 'connect',
    AUTHENTICATE_ERROR:'user:authenticate_error',
    USER_UPDATED: 'user:updated',
  
    USER_AUTHENTICATED: 'user:authenticated',
  
    USER_PRESENCE_UPDATE: 'user:presence_update',
  
    FRIEND_REQUEST_SENT: 'friend:request_sent',
    FRIEND_REQUEST_PENDING: 'friend:request_pending',
    FRIEND_REQUEST_ACCEPTED: 'friend:request_accepted',
    FRIEND_REMOVED: 'friend:removed',
    INBOX_OPENED: 'inbox:opened',
    NOTIFICATION_DISMISSED: 'notification:dismissed',
  
    SERVER_JOINED: 'server:joined',
    SERVER_LEFT: 'server:left',
    SERVER_UPDATED: 'server:updated',
    SERVER_ROLE_CREATED: 'server:role_created',
    SERVER_ROLE_UPDATED: 'server:role_updated',
    SERVER_ROLE_ORDER_UPDATED: 'server:role_order_updated',
    SERVER_CHANNEL_ORDER_UPDATED: 'server:channel_order_updated',
  
    SERVER_ROLE_DELETED: 'server:role_deleted',
  
  
    SERVER_MEMBER_JOINED: 'server:member_joined',
    SERVER_MEMBER_LEFT: 'server:member_left',
    SERVER_MEMBER_UPDATED: 'server:member_updated',
    SERVER_CHANNEL_CREATED: 'server:channel_created',
    SERVER_CHANNEL_UPDATED: 'server:channel_updated',
    SERVER_CHANNEL_DELETED: 'server:channel_deleted',
    SERVER_ORDER_UPDATED: 'server:order_updated',
  
    MESSAGE_BUTTON_CLICKED: 'message:button_clicked',
  
    CHANNEL_TYPING: 'channel:typing',
    MESSAGE_CREATED: 'message:created',
    MESSAGE_UPDATED: 'message:updated',
    MESSAGE_DELETED: 'message:deleted',
} as const;
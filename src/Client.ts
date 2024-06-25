import EventEmitter from 'eventemitter3';
import {Socket, io} from 'socket.io-client';
import { ClientEventMap, ClientEvents, SocketClientEvents, SocketServerEvents } from './EventNames';
import { AuthenticatedPayload, ChannelType, MessageType, RawChannel, RawMessage, RawServer, RawServerMember, RawUser } from './RawData';
import { editMessage, postMessage } from './services/MessageService';
import { path } from './services/serviceEndpoints';


export const Events = ClientEvents;

export class Client extends EventEmitter<ClientEventMap> {
    socket: Socket;
    token: string | undefined;
    user: ClientUser | undefined;
    users: Users;
    channels: Channels;
    servers: Servers;
    constructor() {
        super();
        this.socket = io(path, {
            transports: ['websocket'],
            autoConnect: false,
        });
        this.channels = new Channels(this);
        this.users = new Users(this);
        this.servers = new Servers(this);
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
        client.socket.on(SocketServerEvents.USER_AUTHENTICATED, this.onAuthenticated.bind(this));
        client.socket.on(SocketServerEvents.SERVER_MEMBER_JOINED, this.onServerMemberJoined.bind(this));
        client.socket.on(SocketServerEvents.SERVER_MEMBER_LEFT, this.onServerMemberLeft.bind(this));
        client.socket.on(SocketServerEvents.MESSAGE_CREATED, this.onMessageCreated.bind(this));
    }
    onConnect() {
        this.socket.emit(SocketClientEvents.AUTHENTICATE, {token: this.client.token});
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

    onServerMemberJoined(payload: {serverId: string; member: RawServerMember}) {
        const server = this.client.servers.cache.get(payload.serverId);
        this.client.users.setCache(payload.member.user);
        const member = server?.members.setCache(payload.member);
        if (!member) return;
        this.client.emit('serverMemberJoined', member);
    }
    onServerMemberLeft(payload: { userId: string, serverId: string }) {
        const server = this.client.servers.cache.get(payload.serverId);
        const member = server?.members.cache.get(payload.userId);
        if (!member) return;
        this.client.emit('serverMemberLeft', member);
        server?.members.cache.delete(payload.userId);  
    }
    onMessageCreated(payload: {message: RawMessage}) {
        const message = new Message(this.client, payload.message);
        this.client.emit(ClientEvents.MessageCreate, message);
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
    setCache(rawChannel: RawChannel) {
        let channel: AllChannel;
        if (rawChannel.serverId) channel = new ServerChannel(this.client, rawChannel);
        else channel = new Channel(this.client, rawChannel); 
        this.cache.set(channel.id, channel);
    }
}


export type AllChannel = ServerChannel | Channel

export interface MessageOpts {
    htmlEmbed?: string;
}

export class Channel {
    client: Client;
    id: string;
    
    type: ChannelType;
    createdAt: number;
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
            htmlEmbed: opts?.htmlEmbed
        });
        const message = new Message(this.client, RawMessage);
        return message;
    }
    toString() {
        return `[#:${this.id}]`;
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


export class Message {
    client: Client;
    id: string;
    content?: string;
    type: MessageType;
    createdAt: number;
    channelId: string;
    channel: AllChannel;
    user: User;
    constructor(client: Client, message: RawMessage) {
        this.client = client;
        
        this.id = message.id;
        this.channelId = message.channelId;
        this.channel = client.channels.cache.get(this.channelId)!;
        this.content = message.content;
        this.type = message.type;
        this.createdAt = message.createdAt;
        this.user = this.client.users.cache.get(message.createdBy.id)!;
    }
    reply(content: string, opts?: MessageOpts) {
        return this.channel.send(`${this.user} ${content}`, opts);
    }
    async edit(content: string) {
        const RawMessage = await editMessage({
            client: this.client,
            channelId: this.channel.id,
            messageId: this.id,
            content: content
        });
        const message = new Message(this.client, RawMessage);
        return message;
    }

    toString() {
        return `[q:${this.id}]`;
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
  
    imgSrc?: string
    title?: string
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
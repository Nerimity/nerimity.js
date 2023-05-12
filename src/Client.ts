import EventEmitter from 'eventemitter3';
import {Socket, io} from 'socket.io-client';
import { ClientEventMap, ClientEvents, SocketClientEvents, SocketServerEvents } from './EventNames';
import { AuthenticatedPayload, ChannelType, MessageType, RawChannel, RawMessage, RawUser } from './RawData';
import { editMessage, postMessage } from './services/MessageService';


export const Events = ClientEvents;

export class Client extends EventEmitter<ClientEventMap> {
    socket: Socket;
    token: string | undefined;
    user: ClientUser | undefined;
    channels: Channels;
    constructor() {
        super();
        this.socket = io('https://nerimity.com', {
            transports: ['websocket'],
            autoConnect: false,
        });
        this.channels = new Channels(this);
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
        client.socket.on(SocketServerEvents.MESSAGE_CREATED, this.onMessageCreated.bind(this));
    }
    onConnect() {
        this.socket.emit(SocketClientEvents.AUTHENTICATE, {token: this.client.token});
    }
    onAuthenticated(payload: AuthenticatedPayload) {
        this.client.user = new ClientUser(this.client, payload.user);

        for (let i = 0; i < payload.channels.length; i++) {
            const rawChannel = payload.channels[i];
            this.client.channels.setCache(rawChannel);
        }

        this.client.emit(ClientEvents.Ready);
    }
    onMessageCreated(payload: {message: RawMessage}) {
        const message = new Message(this.client, payload.message);
        this.client.emit(ClientEvents.MessageCreate, message);

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
    async send(content: string) {
        const RawMessage = await postMessage({
            client: this.client,
            channelId: this.id,
            content: content
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
    
    constructor(client: Client, channel: RawChannel) {
        super(client, channel);
        this.name = channel.name;
        this.permissions = channel.permissions!;
        this.createdById = channel.createdById!;
        this.serverId = channel.serverId!;
        this.categoryId = channel.categoryId!;
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
        this.user = new User(client, message.createdBy);
    }
    reply(content: string) {
        return this.channel.send(`${this.user} ${content}`);
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
    }
    toString() {
        return `[@:${this.id}]`;
    }
}

class ClientUser extends User {
    constructor(client: Client, user: RawUser) {
        super(client, user);
    }
}


class Collection<K, V> extends Map<K, V> {
    constructor() {
        super();
    }
}
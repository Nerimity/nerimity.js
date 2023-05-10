import EventEmitter from 'eventemitter3';
import {Socket, io} from 'socket.io-client';
import { ClientEventMap, ClientEvents, SocketClientEvents, SocketServerEvents } from './EventNames';
import { AuthenticatedPayload, MessageType, RawMessage, RawUser } from './RawData';


export const Events = ClientEvents;

export class Client extends EventEmitter<ClientEventMap> {
    socket: Socket;
    token: string | undefined;
    user: ClientUser | undefined;
    constructor() {
        super();
        this.socket = io('https://nerimity.com', {
            transports: ['websocket'],
            autoConnect: false,
        });
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

        this.client.emit(ClientEvents.Ready);
    }
    onMessageCreated(payload: {message: RawMessage}) {
        const message = new Message(this.client, payload.message);
        this.client.emit(ClientEvents.MessageCreate, message);

    }
}


export class Message {
    client: Client;
    id: string;
    content?: string;
    type: MessageType;
    createdAt: number;
    constructor(client: Client, message: RawMessage) {
        this.client = client;
        
        this.id = message.id;
        this.content = message.content;
        this.type = message.type;
        this.createdAt = message.createdAt;
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
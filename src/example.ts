import { Client, Events } from './Client';

const client = new Client();


client.on(Events.Ready, () => {
    console.log(`Connected as ${client.user?.username}!`);
});

client.on(Events.MessageCreate, message => {
    console.log(message.content);
});


client.login('token');

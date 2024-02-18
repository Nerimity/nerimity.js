import { Client, Events } from './Client';

const client = new Client();


client.on(Events.Ready, () => {
    console.log(`Connected as ${client.user?.username}!`);
});

client.on(Events.MessageCreate, message => {
    console.log(message.content);
    if (message.content === 'ping') {
        message.reply('Pong!');
    }
});


client.login('token');

/* eslint-disable */
const { Client, Events } = require("../build");

const client = new Client();

client.on(Events.Ready, () => {
  console.log(`Connected as ${client.user?.username}!`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.user.id === client.user.id) return;

  if (message.content === "!help") {
    const helpMessage = `
     commands:
    - !help: Display this help message
    `;
    await message.reply(helpMessage);
  }
});

client.login("token");



/* eslint-disable */
const {Client, Events} = require("../build");


const client = new Client();

client.on(Events.Ready, () => {
  console.log(`Connected as ${client.user?.username}!`);
});


// this function only to be run when updating command list. dont run every time the bot is running.
client.updateCommands("token", [
  {name: "help", description: "Shows the help list", args: "<page number>"},
]).then(console.log).catch(console.error);







client.on(Events.MessageCreate, async (message) => {
  if (message.command.name === "help") {
    message.reply("Help page " + (message.command.args[0] || "1"));
  }

})
client.login("token")
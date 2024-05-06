/* eslint-disable */
const {Client, Events} = require("../build");


const client = new Client();


client.on(Events.Ready, () => {
  console.log(`Connected as ${client.user?.username}!`);
});


client.on(Events.MessageCreate, async (message) => {
  if (message.user.id === client.user.id) return;
  
  if (message.content === "!ping") {
    const t0 = performance.now();
    const reply = await message.reply("Pong!");
    reply.edit(reply.content + ` (${(performance.now() - t0).toFixed(0)}ms)`);
  }
})




client.login("Token")
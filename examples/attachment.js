/* eslint-disable */
const {Client, Events, AttachmentBuilder} = require("../build");
const fs = require("fs");

const file = fs.openAsBlob("test.txt")

const client = new Client();


client.on(Events.Ready, async () => {
  console.log(`Connected as ${client.user?.username}!`);
  const attachment = new AttachmentBuilder(await file, "test.txt");
  console.log(await attachment.build())
});


client.on(Events.MessageCreate, async (message) => {
  if (message.user.id === client.user.id) return;
})


client.login("token")
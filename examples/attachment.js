/* eslint-disable */
const {Client, Events, AttachmentBuilder} = require("../build");
const fs = require("fs");

const file = fs.openAsBlob("test.txt")

const client = new Client();


client.on(Events.Ready, async () => {
  console.log(`Connected as ${client.user?.username}!`);
});


client.on(Events.MessageCreate, async (message) => {
  if (message.user.id === client.user.id) return;
  if (message.content === "!attachment") {
    let wads = new AttachmentBuilder(await file, "test.txt")
    const id = await wads.build(message.channel)
    await message.reply("hello", {
      nerimityCdnFileId: id
    })
  }
})


client.login("token")
## Example

```js
const { Client, Events } = require("@nerimity/nerimity.js");

const client = new Client();

client.on(Events.Ready, () => {
  console.log(`Connected as ${client.user?.username}!`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.user.id === client.user.id) return;

  if (message.content === "!ping") {
    const t0 = Date.now();
    const reply = await message.reply("Pong!");
    reply.edit(reply.content + ` (${Date.now() - t0}ms)`);
  }
});

client.login("paste token here");
```

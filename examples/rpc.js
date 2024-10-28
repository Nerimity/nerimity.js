const {RPCClient} = require("./build");


const client = new RPCClient()

client.on("ready", () => {
  console.log("ready");
  client.send({
    name: "Name",
    action: "Listening to",
    title: "Title",
    subtitle: "Subtitle",
    imgSrc: "https://nerimity.com/assets/logo.png",
    startedAt: Date.now(),
    endsAt: Date.now() + 120000
  })
})

client.login("appId")
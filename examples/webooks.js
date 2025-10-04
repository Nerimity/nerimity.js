const { WebhookBuilder } = require("../build");

const webhook = new WebhookBuilder({
  channelId: "1234",
  token: "token",
});

webhook.setAvatar("https://example.com/avatar.png");
webhook.setUsername("Test");
webhook.send("Hello, world!");

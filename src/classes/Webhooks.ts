/**
 * Options for sending a webhook message.
 */
export interface WebhookOptions {
  /** Message content. */
  content?: string;
  /** Username to display. */
  username?: string;
  /** Avatar URL to display. */
  avatarUrl?: string;
}

/**
 * Nerimity.js implementation for sending Nerimity webhooks.
 */
export class WebhookBuilder {
  private channelId: string = "";
  private token: string = "";
  private options: WebhookOptions;

  /**
   * Creates a new WebhookBuilder instance.
   *
   * @param webhook - The webhook identifier. Can be:
   *   - Full URL: `"https://nerimity.com/api/webhooks/{channelId}/{token}"`
   * @param options - Optional webhook message options (content, username, avatarUrl).
   *
   * @throws If the webhook format is invalid or missing required fields.
   */
  constructor(
    webhook: string | { channelId: string; token: string },
    options: WebhookOptions = {}
  ) {
    this.options = options;

    if (typeof webhook === "object") {
      if (!webhook.channelId || !webhook.token)
        throw new Error("Webhook object must have channelId and token");
      this.channelId = webhook.channelId;
      this.token = webhook.token;
    } else {
      this.parseWebhookString(webhook);
    }

    this.validateOptions(this.options);
  }

  /**
   * Parse webhook string format and extract channelId + token.
   *
   * @param webhook - Webhook string in one of the accepted formats.
   * @throws If the string is not a valid webhook format.
   */
  private parseWebhookString(webhook: string) {
    if (!webhook || typeof webhook !== "string")
      throw new Error("Webhook must be a non-empty string");

    if (webhook.startsWith("http")) {
      const match = webhook.match(/\/webhooks\/(\d+)\/(.+)$/);
      if (!match) throw new Error(`Invalid webhook URL: ${webhook}`);
      this.channelId = match[1];
      this.token = match[2];
    } else {
      throw new Error(`Unrecognized webhook format: ${webhook}`);
    }
  }

  /**
   * Validate message options (content, username, avatarUrl).
   *
   * @param options - The options object to validate.
   * @throws If an option type is invalid.
   */
  private validateOptions(options: WebhookOptions) {
    if (options.username && typeof options.username !== "string")
      throw new Error("Webhook option 'username' must be a string");
    if (options.avatarUrl && typeof options.avatarUrl !== "string")
      throw new Error("Webhook option 'avatarUrl' must be a string");
  }

  /**
   * Set the username override for the webhook.
   *
   * @param username - The custom username.
   * @returns The current WebhookBuilder instance (for chaining).
   *
   * @throws If username is not a string.
   */
  public setUsername(username: string) {
    if (typeof username !== "string")
      throw new Error("Username must be a string");
    this.options.username = username;
    return this;
  }

  /**
   * Set the avatar image for the webhook.
   *
   * @param avatarUrl - The avatar image URL.
   * @returns The current WebhookBuilder instance (for chaining).
   *
   * @throws If avatarUrl is not a string.
   */
  public setAvatar(avatarUrl: string) {
    if (typeof avatarUrl !== "string")
      throw new Error("Avatar URL must be a string");
    this.options.avatarUrl = avatarUrl;
    return this;
  }

  /**
   * Sends the webhook request to Nerimity's API.
   *
   * @returns A Promise resolving with the JSON response from the API.
   *
   * @throws If the request fails, is unauthorized, or returns invalid JSON.
   */
  public async send(content: string): Promise<any> {
    const url = `https://nerimity.com/api/webhooks/${this.channelId}/${this.token}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, ...this.options }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
          `HTTP ${res.status} ${res.statusText}${body ? ` - ${body}` : ""}`
        );
      }

      const json = await res.json().catch(() => {
        throw new Error("Webhook returned invalid JSON");
      });

      return json;
    } catch (err: any) {
      throw new Error(`Failed to send webhook: ${err.message}`);
    }
  }
}

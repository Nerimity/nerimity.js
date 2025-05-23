import { Client } from "../Client";
import { RawMessage, RawMessageButton } from "../RawData";
import { ServiceEndpoints } from "./serviceEndpoints";
import fetch from "node-fetch";

interface PostMessageOpts {
  client: Client;
  channelId: string;
  content: string;
  nerimityCdnFileId?: string;
  htmlEmbed?: string;
  buttons?: RawMessageButton[];
  replyToMessageIds?: string[];
  mentionReplies?: boolean;
  silent?: boolean;
}

export async function postMessage(opts: PostMessageOpts) {
  return await request<RawMessage>({
    client: opts.client,
    url: ServiceEndpoints.PostMessage(opts.channelId),
    method: "POST",
    body: {
      content: opts.content,
      nerimityCdnFileId: opts.nerimityCdnFileId,
      htmlEmbed: opts.htmlEmbed,
      buttons: opts.buttons,
      silent: opts.silent,
      mentionReplies: opts.mentionReplies,
      replyToMessageIds: opts.replyToMessageIds,
    },
    useToken: true,
  }).catch((err) => {
    const error = new Error(
      `Failed to send message. ${JSON.stringify(err.message)}`
    );
    (error as unknown as { raw: string }).raw = err.message;
    throw error;
  });
}

interface EditMessageOpts {
  client: Client;
  channelId: string;
  messageId: string;
  content: string;
}

export function editMessage(opts: EditMessageOpts) {
  return request<RawMessage>({
    client: opts.client,
    url: ServiceEndpoints.EditMessage(opts.channelId, opts.messageId),
    method: "PATCH",
    body: { content: opts.content },
    useToken: true,
  }).catch((err) => {
    throw err.message;
  });
}

interface DeleteMessageOpts {
  client: Client;
  channelId: string;
  messageId: string;
}
export function deleteMessage(opts: DeleteMessageOpts) {
  return request<{ message: string }>({
    client: opts.client,
    url: ServiceEndpoints.EditMessage(opts.channelId, opts.messageId),
    method: "DELETE",
    useToken: true,
  }).catch((err) => {
    throw err.message;
  });
}

interface ButtonClickCallbackOpts {
  client: Client;

  buttonId: string;
  channelId: string;
  messageId: string;

  userId: string;
  title?: string;
  content?: string;
}

export function buttonClickCallback(opts: ButtonClickCallbackOpts) {
  return request({
    client: opts.client,
    url: ServiceEndpoints.ButtonClickCallback(
      opts.channelId,
      opts.messageId,
      opts.buttonId
    ),
    method: "POST",
    body: {
      userId: opts.userId,
      title: opts.title,
      content: opts.content,
    },
    useToken: true,
  }).catch((err) => {
    throw err.message;
  });
}

interface RequestOpts {
  url: string;
  method: "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  useToken?: boolean;
  notJSON?: boolean;
  params?: Record<any, any>;
  client: Client;
}

export async function request<T>(opts: RequestOpts): Promise<T> {
  const url = new URL(opts.url);
  url.search = new URLSearchParams(opts.params || {}).toString();

  const response = await fetch(url, {
    method: opts.method,
    body: JSON.stringify(opts.body),
    headers: {
      "Content-Type": "application/json",
      Authorization: opts.useToken ? opts.client.token! : "",
    },
  }).catch((err) => {
    throw { message: "Could not connect to server. " + err.message };
  });

  const text = await response.text();
  if (opts.notJSON) return text as T;

  try {
    const json = JSON.parse(text);
    if (!response.ok) {
      return Promise.reject(json);
    }
    return json;
  } catch (e) {
    throw { message: text };
  }
}

import { Client } from "../classes/Client";
import { RawPost } from "../RawData";
import { request } from "./MessageService";
import { ServiceEndpoints } from "./serviceEndpoints";

interface PostPostOpts {
  client: Client;
  postId?: string;
  content: string;
  nerimityCdnFileId?: string;
  poll?: {
    choices: string[];
  };
}

interface EditPostOpts {
  client: Client;
  postId: string;
  content: string;
}

interface DeletePostOpts {
  client: Client;
  postId: string;
}

export async function getPosts(client: Client) {
  return await request<RawPost[]>({
    client: client,
    url: ServiceEndpoints.GetPosts(),
    method: "GET",
    useToken: true,
  });
}

export async function postPost(opts: PostPostOpts) {
  return await request<RawPost>({
    client: opts.client,
    url: ServiceEndpoints.PostPost(),
    method: "POST",
    body: {
      content: opts.content,
      nerimityCdnFileId: opts.nerimityCdnFileId,
      poll: opts.poll,
    },
    useToken: true,
  });
}

export async function editPost(opts: EditPostOpts) {
  return await request<RawPost>({
    client: opts.client,
    url: ServiceEndpoints.EditPost(opts.postId),
    method: "PATCH",
    body: { content: opts.content },
    useToken: true,
  });
}

export async function deletePost(opts: DeletePostOpts) {
  return await request({
    client: opts.client,
    url: ServiceEndpoints.DeletePost(opts.postId),
    method: "DELETE",
    useToken: true,
  });
}

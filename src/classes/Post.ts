import { RawPost, RawUser } from "../RawData";
import {
  deletePost,
  editPost,
  getPosts,
  postPost,
} from "../services/PostsService";
import { Client } from "./Client";

export interface PostOpts {
  nerimityCdnFileId?: string;
  poll?: {
    choices: string[];
  };
}
export class Posts {
  client: Client;
  constructor(client: Client) {
    this.client = client;
  }

  async get(id?: string) {
    const RawPosts = await getPosts(this.client);
    const posts = RawPosts.map((post) => new Post(this.client, post));
    return id ? posts.find((p) => p.id === id) : posts;
  }

  async create(content: string, opts?: PostOpts) {
    const RawPost = await postPost({
      client: this.client,
      content: content,
      nerimityCdnFileId: opts?.nerimityCdnFileId,
      poll: opts?.poll,
    });

    const post = new Post(this.client, RawPost);

    return post;
  }
}

export class Post {
  client: Client;
  id: string;
  content?: string;
  attachments?: Array<any>;
  deleted: boolean;
  block?: boolean;
  commentToId: string;
  commentTo?: RawPost;
  createdBy: RawUser;
  createdAt: number;
  editedAt: number;
  likedBy: { id: string }[]; // if you liked this post, array will not be empty
  reposts: { id: string; createdBy: { id: string; username: string } }[];
  repost?: RawPost;
  _count: { likedBy: number; comments: number; reposts: number };
  views: number;
  announcement: any;
  poll?: any;

  constructor(client: Client, post: RawPost) {
    this.client = client;
    this.id = post.id;
    this.content = post.content;
    this.attachments = post.attachments;
    this.deleted = post.deleted;
    this.block = post.block;
    this.commentToId = post.commentToId;
    this.commentTo = post.commentTo;
    this.createdBy = post.createdBy;
    this.createdAt = post.createdAt;
    this.editedAt = post.editedAt;
    this.likedBy = post.likedBy;
    this.reposts = post.reposts;
    this.repost = post.repost;
    this._count = post._count;
    this.views = post.views;
    this.announcement = post.announcement;
    this.poll = post.poll;
  }

  async edit(content: string) {
    const RawPost = await editPost({
      client: this.client,
      content: content,
      postId: this.id,
    });

    const post = new Post(this.client, RawPost);
    return post;
  }

  async delete() {
    await deletePost({
      client: this.client,
      postId: this.id,
    });
  }
}

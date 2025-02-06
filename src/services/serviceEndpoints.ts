// export const path = 'http://localhost:8080';
export let path = 'https://nerimity.com';
let BaseUrl = path + '/api';

export const updatePath = (newPath: string) => {
    path = newPath;
    BaseUrl = path + '/api';
};
const GetMessages = (channelId: string) => `${BaseUrl}/channels/${channelId}/messages`;
const PostMessage = (channelId: string) => `${BaseUrl}/channels/${channelId}/messages`;
const EditMessage = (channelId: string, messageId: string) => `${BaseUrl}/channels/${channelId}/messages/${messageId}`;

// Posts
const GetPosts = () => `${BaseUrl}/posts`;
const PostPost = () => `${BaseUrl}/posts`;
const EditPost = (postId: string) => `${BaseUrl}/posts/${postId}`;
const DeletePost = (postId: string) => `${BaseUrl}/posts/${postId}`;


const ButtonClickCallback = (channelId: string, messageId: string, buttonId: string) => `${BaseUrl}/channels/${channelId}/messages/${messageId}/buttons/${buttonId}/callback`;

export const ServiceEndpoints = {
    GetMessages,
    PostMessage,
    EditMessage,
    GetPosts,
    PostPost,
    EditPost,
    DeletePost,
    ButtonClickCallback
};
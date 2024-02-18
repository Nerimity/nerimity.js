// export const path = 'http://localhost:8080';
export const path = 'https://nerimity.com';
const BaseUrl = path + '/api';
const GetMessages = (channelId: string) => `${BaseUrl}/channels/${channelId}/messages`;
const PostMessage = (channelId: string) => `${BaseUrl}/channels/${channelId}/messages`;
const EditMessage = (channelId: string, messageId: string) => `${BaseUrl}/channels/${channelId}/messages/${messageId}`;

export const ServiceEndpoints = {
    GetMessages,
    PostMessage,
    EditMessage
};
const BaseUrl = 'https://nerimity.com/api';
const GetMessages = (channelId: string) => `${BaseUrl}/channels/${channelId}/messages`;
const PostMessage = (channelId: string) => `${BaseUrl}/channels/${channelId}/messages`;
const EditMessage = (channelId: string, messageId: string) => `${BaseUrl}/channels/${channelId}/messages/${messageId}`;

export const ServiceEndpoints = {
    GetMessages,
    PostMessage,
    EditMessage
};
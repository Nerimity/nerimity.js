import { Channel } from './Client';
import { RawCDNUpload } from './RawData';

const url = 'https://cdn.nerimity.com';
const uploadUrl = `${url}/upload`;
const saveUrl = `${url}/attachments`;

export class AttachmentBuilder {
    private file: Blob;
    private name: string;

    constructor(file: Blob, name: string) {
        this.file = file;
        this.name = name;
    }

    public async build(channel: Channel): Promise<string> {
        const formData = new FormData();
        formData.set('file', this.file, this.name);
        const response = await upload(formData);
        await sendUploadChannel(channel.id, response);
        return response.fileId;
    }
}

async function sendUploadChannel(id: string, cdn: RawCDNUpload) {
    const response = await fetch(`${saveUrl}/${id}/${cdn.fileId}`, {
        method: 'POST',
        body: JSON.stringify(cdn),
    });

    if (!response.ok) {
        throw new Error(`Failed to send attachment: ${response.statusText}`);
    }

    return await response.json();
}

async function upload(dat: FormData) {
    const response = await fetch(uploadUrl, {
        method: 'POST',
        body: dat,
    });

    if (!response.ok) {
        throw new Error(`Failed to upload attachment: ${response.statusText}`);
    }

    return await response.json();
}

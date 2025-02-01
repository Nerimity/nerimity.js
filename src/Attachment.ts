let url = "https://cdn.nerimity.com"
let uploadUrl = `${url}/upload`

export class AttachmentBuilder {
    private file: Blob;
    private name: string;

    constructor(file: Blob, name: string) {
        this.file = file;
        this.name = name;
    }

    public async build() : Promise<string> {
        const formData = new FormData();
        formData.set("file", this.file, this.name);
        const response = await Upload(formData);
        return response.fileId;
    }
}

async function Upload(dat: FormData) {
    const response = await fetch(uploadUrl, {
        method: 'POST',
        body: dat,
    })

    if (!response.ok) {
        throw new Error(`Failed to upload attachment: ${response.statusText}`);
    }

    return await response.json();
}
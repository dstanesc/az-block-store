import { BlockBlobClient, ContainerClient } from "@azure/storage-blob"

const blockStore = ({ cache, containerClient }: { cache?: any, containerClient: ContainerClient }) => {

    const put = async (block: { cid: any, bytes: Uint8Array }): Promise<void> => {
        if (cache)
            cache[block.cid.toString()] = block.bytes
        const blobClient: BlockBlobClient = containerClient.getBlockBlobClient(block.cid.toString())
        await blobClient.upload(block.bytes, block.bytes.byteLength)
    }

    const get = async (cid: any): Promise<Uint8Array> => {
        let bytes
        if (cache)
            bytes = cache[cid.toString()]
        if (!bytes) {
            const blobClient: BlockBlobClient = containerClient.getBlockBlobClient(cid.toString())
            const blobResponse = await blobClient.download(0)
            bytes = await toBuffer(blobResponse.readableStreamBody)
        }
        return bytes
    }

    return { get, put }
}

const toBuffer = async (readableStream:  NodeJS.ReadableStream): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on("error", reject);
    });
}

export { blockStore }
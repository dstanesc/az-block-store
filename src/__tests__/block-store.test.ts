import { DefaultAzureCredential } from "@azure/identity";
import * as dotenv from "dotenv";
import { chunkyStore } from "@dstanesc/store-chunky-bytes";
import { codec, chunkerFactory, byteArray, retrieve } from "./util";
import { blockStore } from "../index";
import { v1 as uuid } from "uuid";
import * as assert from "assert";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

const RECORD_COUNT = 100;
const RECORD_SIZE_BYTES = 36;

let containerClient: ContainerClient;

// Setup AZ ContainerClient
beforeEach(() => {
  dotenv.config();
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME
  const blobServiceClient: BlobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  )
  const randomContainerName = `test-${uuid()}`
  containerClient = blobServiceClient.getContainerClient(randomContainerName)
  const createPromise = containerClient.create()
  return Promise.all([createPromise])
})

// Delete AZ ContainerClient
afterEach(() => {
  const deletePromise = containerClient.delete()
  return Promise.all([deletePromise])
});

test("demo az cas usage in the context of @dstanesc/store-chunky-bytes", async () => {
  // optional cache
  const cache = {};

  // az-block-store api
  const { get, put } = blockStore({ /*cache,*/ containerClient });

  // chunking config
  const { encode, decode } = codec();
  const { create, read } = chunkyStore();
  const { fastcdc } = chunkerFactory({ fastAvgSize: 512 });

  // demo data
  const { buf, records } = byteArray(RECORD_COUNT, RECORD_SIZE_BYTES);

  // chunk the data (content defined)
  const { root, blocks } = await create({ buf, chunk: fastcdc, encode });

  // store the chunks to the az-block-store
  for (const block of blocks) {
    console.log(`Save block: ${block.cid} len: ${block.bytes.byteLength}`);
    await put(block);
  }

  // read back a slice of data from the az-block-store
  const retrieved = await retrieve(read, 0, 10, RECORD_SIZE_BYTES, {
    root,
    decode,
    get,
  });
  console.log(retrieved);

  assert.equal(retrieved.length, 10);
  assert.deepEqual(records.slice(0, 10), retrieved);
});

# Azure Block Store

Simple content-addressable storage (CAS) based on [Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/). 

## API

```ts
put: (block: { cid: any, bytes: Uint8Array }) => Promise<void>
get: (cid: any) => Promise<Uint8Array>
```

## Usage

```ts
  // connect to Azure, see more @ https://learn.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-nodejs 
  const accountName = ...
  const blobServiceClient: BlobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  )
  const randomContainerName = ...
  containerClient: ContainerClient = blobServiceClient.getContainerClient(randomContainerName)
  await containerClient.create()

  // optional cache
  const cache = {}

  // az-block-store api
  const { get, put } = blockStore({ /*cache,*/ containerClient })

```

## Build

```sh
npm run clean
npm install
npm run build
npm run test
```

## Licenses

Licensed under either [Apache 2.0](http://opensource.org/licenses/MIT) or [MIT](http://opensource.org/licenses/MIT) at your option.

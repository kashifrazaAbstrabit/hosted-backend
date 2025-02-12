import { BlobSASPermissions, BlobServiceClient } from "@azure/storage-blob";


const CONTAINER_NAME = 'intellidev';


const blobStorage = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_STORAGE_CONNECTION_STRING!);


const getBlobContainerClient = (containerName: string) => {
    return blobStorage.getContainerClient(containerName);
}

const createBlobContainer = async (containerName: string) => {
    const containerClient = getBlobContainerClient(containerName);

    return await containerClient.create();
}

const initializeContainer = async () => {
    const containerClient = getBlobContainerClient(CONTAINER_NAME);
    const exists = await containerClient.exists();
    if (!exists) {
        await createBlobContainer(CONTAINER_NAME);
    }
    return containerClient;
};


const generateWriteSasToken = async (blobPath: string) => {

    const containerClient = getBlobContainerClient(CONTAINER_NAME);

    const permissions = new BlobSASPermissions();
    permissions.read = true;
    permissions.write = true;
    permissions.create = true;

    const blobClient = containerClient.getBlobClient(blobPath);
    const sasToken = await blobClient.generateSasUrl({
        permissions: permissions,
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 15 * 60 * 1000), // 15 minutes
    });

    return {
        sasToken,
        blobClient
    };
}


const generateReadSasToken = async (blobPath: string) => {

    const containerClient = getBlobContainerClient(CONTAINER_NAME);

    const blobClient = containerClient.getBlockBlobClient(blobPath);

    const permissions = new BlobSASPermissions();
    permissions.read = true;

    return await blobClient.generateSasUrl({
        permissions: permissions,
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 60 * 60 * 1000), // 1 hour
    });
};

const deleteBlob = async (blobPath: string) => {
    const containerClient = getBlobContainerClient(CONTAINER_NAME);
    const blobClient = containerClient.getBlobClient(blobPath);
    await blobClient.delete();
}

export const BlobStorageService = {
    initializeContainer,
    getBlobContainerClient,
    generateWriteSasToken,
    generateReadSasToken,
    deleteBlob
}
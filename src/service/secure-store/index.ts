import { CredentialsStoreService } from "./credentials-store"
import { FileStoreService } from "./file-store";


const getSecureStoreByUserId = async (params: { userId: number, projectId: number }) => {
    const credentials = await CredentialsStoreService.getCredentialsByUserId(params);
    const files = await FileStoreService.getFileStoreByUserId(params);

    return {
        credentials,
        files
    }
}

export const SecureStoreService = {
    createCredentialsStore: CredentialsStoreService.createCredentialsStore,
    updateCredentialsStore: CredentialsStoreService.updateCredentialStore,
    deleteCredentialsStore: CredentialsStoreService.deleteCredentialStore,
    getCredentialById: CredentialsStoreService.getCredentialById,
    createFileStore: FileStoreService.createFilesStore,
    updateFileStore: FileStoreService.updateFileStore,
    deleteFileStore: FileStoreService.deleteFileStore,
    getFileStoreById: FileStoreService.getFileStoreById,
    generatePresignedUrl: FileStoreService.generatePresignedUrl,
    getSecureStoreByUserId
}
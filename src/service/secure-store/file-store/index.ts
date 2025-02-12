import { CredentialStore, FileStore } from "@prisma/client";
import prisma from "../../../config/database";
import { ProjectDML } from "../../../dml/project_dml";
import { BlobStorageService } from "../../external/azure/blob-storage";
import { BRError } from "../../../common/utils/errors";


interface createFileStoreReq extends FileStore {
    isShared?: boolean
}

const FILES_STORE_PREFIX = "files-store";


const generateFileStoreBlobPath = async (userId: number, projectId: number) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!project) {
        throw new Error('Project not found');
    }
    return `${userId}/${project.name}/${FILES_STORE_PREFIX}/`
}


const generatePresignedUrl = async (params: { userId: number, projectId: number, fileName: string }) => {
    const { userId, projectId, fileName } = params;

    await ProjectDML.verifyProjectClientOwnership(userId, projectId);

    const prefix = await generateFileStoreBlobPath(userId, projectId);

    const blobPath = `${prefix}${fileName}`;

    const { sasToken, blobClient } = await BlobStorageService.generateWriteSasToken(blobPath);

    return {
        fileName,
        uploadUrl: sasToken,
        blobPath,
        finalUrl: blobClient.url
    };
}


const createFilesStore = async (params: createFileStoreReq) => {
    const { isShared = false, ...fileStoreData } = params;
    const { ownerId, projectId } = fileStoreData;
    await ProjectDML.verifyProjectClientOwnership(ownerId, projectId);


    let developerIds: number[] = [];
    if (isShared) {
        developerIds = await ProjectDML.getDevelopersByProjectId(fileStoreData.projectId);
    }
    return await prisma.$transaction(async (tx) => {
        const fileStore = await tx.fileStore.create({
            data: {
                ...fileStoreData,
                sharedWith: {
                    create: developerIds.map(id => ({
                        sharedWithId: id
                    }))
                }
            },
        });

        return fileStore;
    });

}



interface updateFileStoreReq extends CredentialStore {
    isShared?: boolean
}

const updateFileStore = async (params: updateFileStoreReq) => {
    const { isShared = false, ...fileData } = params;

    const { ownerId, projectId } = fileData;

    await ProjectDML.verifyProjectClientOwnership(ownerId, projectId);
    
    return await prisma.$transaction(async (tx) => {
        // First get current credential to check if isShared changed
        const currentFileStore = await tx.fileStore.findUnique({
            where: { id: fileData.id },
            include: { sharedWith: true }
        });

        if (!currentFileStore) {
            throw new BRError({
                status: 404,
                type: "FILE_DATA_NOT_FOUND",
                message: "File Data not found"
            });
        }

        // Check if isShared status changed
        const isSharedChanged = currentFileStore.sharedWith.length > 0 !== isShared;

        let sharedWithUpdate = {};
        
        if (isSharedChanged) {
            let developerIds: number[] = [];
            if (isShared) {
                developerIds = await ProjectDML.getDevelopersByProjectId(fileData.projectId);
            }
            console.log(developerIds);


            sharedWithUpdate = {
                sharedWith: {
                    ...(isShared ? {
                        deleteMany: {},
                        create: developerIds.map(id => ({
                            sharedWithId: id
                        }))
                    } : {
                        deleteMany: {}
                    })
                }
            };
        }

        const fileStore = await tx.fileStore.update({
            where: {
                id: fileData.id
            },
            data: {
                ...fileData,
                ...sharedWithUpdate
            },
        });

        return fileStore;
    });
};

const deleteFileStore = async (params: { id: number, ownerId: number }) => {
    const { id,ownerId } = params;

    const fileStore = await prisma.fileStore.findUnique({
        where: { id }
    });

    if (!fileStore) {
        throw new BRError({
            status: 404,
            type: "FILE_DATA_NOT_FOUND",
            message: "File Data not found"
        });
    }

    const { projectId } = fileStore;

    await ProjectDML.verifyProjectClientOwnership(ownerId, projectId);
    return await prisma.fileStore.delete({
        where: {
            id
        }
    });
}

const getFileStoreByUserId = async (params: { userId: number, projectId: number }) => {
    try {
        const fileStore = await prisma.fileStore.findMany({
            where: {
                projectId: params.projectId,
                OR: [
                    { ownerId: params.userId },
                    {
                        sharedWith: {
                            some: {
                                sharedWithId: params.userId
                            }
                        }
                    }
                ]
            },
        });

        // Generate read URLs for each file's blobPath
        const filesWithUrls = await Promise.all(
            fileStore.map(async (file) => {
                if (file.fileUrl) {
                    const sasUrl = await BlobStorageService.generateReadSasToken(file.fileUrl);
                    return {
                        ...file,
                        fileUrl: sasUrl
                    };
                }
                return file;
            })
        );

        return filesWithUrls;
    } catch (error) {
        throw error;
    }
};

const getFileStoreById = async (params: {id:number,userId:number}) => {
    const res= await prisma.fileStore.findUnique({
        where: { id: params.id }
    });

    if(!res){
        throw new BRError({
            status: 404,
            type: "FILE_DATA_NOT_FOUND",
            message: "File Data not found"
        });
    }

    return res;
}


export const FileStoreService = {
    createFilesStore,
    generatePresignedUrl,
    getFileStoreByUserId,
    updateFileStore,
    deleteFileStore,
    getFileStoreById
}


import { CredentialStore } from "@prisma/client";
import prisma from "../../../config/database";
import { ProjectDML } from "../../../dml/project_dml";
import { BRError } from "../../../common/utils/errors";


interface createCredentialsStoreReq extends CredentialStore { 
    isShared?: boolean
} 



const createCredentialsStore = async (params: createCredentialsStoreReq) => {
    const { isShared = false, ...credentialsData } = params;

    const {ownerId} = credentialsData;

    await ProjectDML.verifyProjectClientOwnership(ownerId, credentialsData.projectId);


    let developerIds: number[] = [];
    if (isShared) {
        developerIds = await ProjectDML.getDevelopersByProjectId(credentialsData.projectId);
    }

    return await prisma.$transaction(async (tx) => {
        // Create credential
        const credential = await tx.credentialStore.create({
            data: {
                ...credentialsData,
                sharedWith: {
                    create: developerIds.map(id => ({
                        sharedWithId: id
                    }))
                }
            },
        });

        return credential;
    });

}

interface updateCredentialStoreReq extends CredentialStore {
    isShared?: boolean
}

const updateCredentialStore = async (params: updateCredentialStoreReq) => {
    const { isShared = false, ...credentialData } = params;

    const {ownerId} = credentialData;

    await ProjectDML.verifyProjectClientOwnership(ownerId, credentialData.projectId);
    
    return await prisma.$transaction(async (tx) => {
        // First get current credential to check if isShared changed
        const currentCredential = await tx.credentialStore.findUnique({
            where: { id: credentialData.id },
            include: { sharedWith: true }
        });

        if (!currentCredential) {
            throw new BRError({
                status: 404,
                type: "CREDENTIAL_NOT_FOUND",
                message: "Credential not found"
            });
        }

        // Check if isShared status changed
        const isSharedChanged = currentCredential.sharedWith.length > 0 !== isShared;

        let sharedWithUpdate = {};
        
        if (isSharedChanged) {
            let developerIds: number[] = [];
            if (isShared) {
                developerIds = await ProjectDML.getDevelopersByProjectId(credentialData.projectId);
            }

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

        const credential = await tx.credentialStore.update({
            where: {
                id: credentialData.id
            },
            data: {
                ...credentialData,
                ...sharedWithUpdate
            },
        });

        return credential;
    });
};

const deleteCredentialStore = async (params: { id: number, ownerId: number }) => {
    const { id, ownerId } = params;
    
    const credentialData = await prisma.credentialStore.findUnique({
        where: {
            id
        }
    });

    if(!credentialData){
        throw new BRError({
            status: 404,
            type: "CREDENTIAL_NOT_FOUND",
            message: "Credential not found"
        });
    }

    await ProjectDML.verifyProjectClientOwnership(ownerId, credentialData?.projectId);

    if(!credentialData){
        throw new BRError({
            status: 404,
            type: "CREDENTIAL_NOT_FOUND",
            message: "Credential not found"
        });
    }

    await ProjectDML.verifyProjectClientOwnership(ownerId, credentialData?.projectId);

    return await prisma.credentialStore.delete({
        where: {
            id
        }
    });
}



const getCredentialsByUserId = async (params: { userId: number, projectId: number }) => {
    try {
        const credentials = await prisma.credentialStore.findMany({
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

        return credentials;
    } catch (error) {
        throw error;
    }
};

const getCredentialById = async (params: {id:number,userId: number}) => {
    const res= await prisma.credentialStore.findUnique({
        where: {
            id: params.id
        }
    });

    if(!res){
        throw new BRError({
            status: 404,
            type: "CREDENTIAL_NOT_FOUND",
            message: "Credential not found"
        });
    }

    return res;
}

export const CredentialsStoreService = {
    createCredentialsStore,
    getCredentialsByUserId,
    updateCredentialStore,
    deleteCredentialStore,
    getCredentialById
}
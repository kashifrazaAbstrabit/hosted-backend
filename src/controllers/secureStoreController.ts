import { Request, Response } from "express";
import { SecureStoreService } from "../service/secure-store";


const createCredentialsStore = async (req:Request, res:Response) => {
    const { user, ...params} = req.body;
    const userId = user.id;
    try {
        const res= await SecureStoreService.createCredentialsStore({ ...params, ownerId: userId });
        return res;
    } catch (error) {
        throw error;
    }
}

const createFileStore = async (req:Request, res:Response) => {
    const { user, ...params} = req.body;
    const userId = user.id;
    try {
        const res= await SecureStoreService.createFileStore({ ...params, ownerId: userId });
        return res;
    } catch (error) {
        throw error;
    }
}

const generatePresignedUrl = async (req:Request, res:Response) => {
    const { user, ...params} = req.body;
    const userId = user.id;
    try {
        const res= await SecureStoreService.generatePresignedUrl({ ...params, userId: userId });
        return res;
    } catch (error) {
        throw error;
    }
}


const getFileStoreByUserId = async (req:Request, res:Response) => {
    const { user, projectId} = req.body;
    const userId = user.id;
    try {
        const res= await SecureStoreService.getSecureStoreByUserId({ projectId, userId });
        return res;
    } catch (error) {
        throw error;
    }
}

const updateFileStore = async (req:Request, res:Response) => {
    const { user, ...params} = req.body;
    const userId = user.id;
    try {
        const res= await SecureStoreService.updateFileStore({ ...params, ownerId: userId });
        return res;
    } catch (error) {
        throw error;
    }
}

const deleteFileStore = async (req:Request, res:Response) => {
    const { id, user } = req.body;
    const userId = user.id;

    try {
        const res= await SecureStoreService.deleteFileStore({ id, ownerId: userId });
        return res;
    } catch (error) {
        throw error;
    }
}

const updateCredentialsStore = async (req:Request, res:Response) => {
    const { user, ...params} = req.body;
    const userId = user.id;
    try {
        const res= await SecureStoreService.updateCredentialsStore({ ...params, ownerId:userId });
        return res;
    } catch (error) {
        throw error;
    }
}

const deleteCredentialsStore = async (req:Request, res:Response) => {
    const { id, user } = req.body;
    const userId = user.id;

    try {
        const res= await SecureStoreService.deleteCredentialsStore({ id, ownerId: userId });
        return res;
    } catch (error) {
        throw error;
    }
}

const getFileStoreById = async (req:Request, res:Response) => {
    const id = Number(req.query.id);
    const { user } = req.body;
    const userId = user.id;
    try {
        if (isNaN(id)) {
            throw new Error('Invalid id parameter');
        }
        const res= await SecureStoreService.getFileStoreById({ id, userId });
        return res;
    } catch (error) {
        throw error;
    }
}


const getCredentialById = async (req:Request, res:Response) => {
    const id = Number(req.query.id);
    const { user } = req.body;
    const userId = user.id;
    try {
        const res= await SecureStoreService.getCredentialById({ id, userId });
        return res;
    } catch (error) {
        throw error;
    }
}


export const SecureStoreController = {
    createCredentialsStore,
    createFileStore,
    generatePresignedUrl,
    getFileStoreByUserId,
    updateFileStore,
    deleteFileStore,
    getFileStoreById,
    getCredentialById,
    updateCredentialsStore,
    deleteCredentialsStore
}
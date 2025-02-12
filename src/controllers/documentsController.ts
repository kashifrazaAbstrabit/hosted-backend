import { Request, Response } from "express";
import { DocumentsService } from "../service/documents";

const generateGoogleAuthUrl = async (req: Request, res: Response) => {
  try {
    return await DocumentsService.generateGoogleAuthUrl();
  } catch (error) {
    throw error;
  }
};

const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    const { id: loggedInUser } = req.body.user;
    return await DocumentsService.handleGoogleCallback({
      code,
      userId: loggedInUser,
    });
  } catch (error) {
    throw error;
  }
};

const getGoogleDocsFiles = async (req: Request, res: Response) => {
  try {
    const { id: loggedInUser } = req.body.user;
    const { projectId } = req.body;

    return await DocumentsService.getGoogleDocsFiles({
      userId: loggedInUser,
      projectId: projectId,
    });
  } catch (error) {
    throw error;
  }
};

const createGoogleDocsFile = async (req: Request, res: Response) => {
  try {
    const { projectId, title, isShared } = req.body;
    const { id: loggedInUser } = req.body.user;

    return await DocumentsService.createGoogleDocsFile({
      userId: loggedInUser,
      projectId,
      title,
      isShared,
    });
  } catch (error) {
    throw error;
  }
};

const deleteGoogleDocsFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.body;
    const { id: loggedInUser } = req.body.user;

    return await DocumentsService.deleteGoogleDocsFile({
      userId: loggedInUser,
      fileId,
    });
  } catch (error) {
    throw error;
  }
};

const addAllProjectDevelopersToGoogleDoc = async (
  req: Request,
  res: Response
) => {
  try {
    const { projectId, fileId } = req.body;
    const { id: loggedInUser } = req.body.user;

    return await DocumentsService.addAllProjectDevelopersToGoogleDoc({
      userId: loggedInUser,
      projectId,
      fileId,
    });
  } catch (error) {
    throw error;
  }
};

const removeProjectDevelopersFromGoogleDoc = async (
  req: Request,
  res: Response
) => {
  try {
    const { id: loggedInUser } = req.body.user;
    const { projectId, fileId } = req.body;
    return await DocumentsService.removeProjectDevelopersFromGoogleDoc({
      userId: loggedInUser,
      projectId,
      fileId,
    });
  } catch (error) {
    throw error;
  }
};

const getUploadUrl = async (req: Request, res: Response) => {
  try {
    const { id: loggedInUser } = req.body.user;
    const { projectId, fileName, contentType } = req.body;
    return await DocumentsService.generatePresignedUrl({
      userId: loggedInUser,
      projectId,
      fileName,
      contentType,
    });
  } catch (error) {
    throw error;
  }
};

const listDocuments = async (req: Request, res: Response) => {
  try {
    const { id: loggedInUser } = req.body.user;
    const { projectId } = req.body;
    return await DocumentsService.listDocuments({
      userId: loggedInUser,
      projectId,
    });
  } catch (error) {
    throw error;
  }
};

const deleteDocuments = async (req: Request, res: Response) => {
  try {
    const { fileName, projectId } = req.body;
    const { id: loggedInUser } = req.body.user;

    return await DocumentsService.deleteDocument({
      userId: loggedInUser,
      projectId,
      fileName,
    });
  } catch (error) {
    throw error;
  }
};

export const DocumentController = {
  generateGoogleAuthUrl,
  handleGoogleCallback,
  getGoogleDocsFiles,
  createGoogleDocsFile,
  deleteGoogleDocsFile,
  addAllProjectDevelopersToGoogleDoc,
  removeProjectDevelopersFromGoogleDoc,
  getUploadUrl,
  listDocuments,
  deleteDocuments,
};

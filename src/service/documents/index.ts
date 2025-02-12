import prisma from "../../config/database";
import { GoogleDriveService } from "./google-drive"
import { BlobStorageService } from "../external/azure/blob-storage";
import { BRError } from "../../common/utils/errors";
import { ProjectDML } from "../../dml/project_dml";

const getDevelopersByProjectId = async (projectId: number) => {
  // get all developers of the project
  const project = await prisma.project.findFirst({
    where: { id: projectId },
    include: {
      assigned_people: {
        include: {
          developer: {
          }
        }
      }
    }
  });

  if (!project) {
    return [];
  }
  return project.assigned_people.map(assigned => assigned.developer);
}

const PROJECT_KNOWLEDGE_PREFIX ="project-knowledge";


const createGoogleDocsFile = async (params: { userId: number, projectId: number, title: string, isShared: true }) => {
  try {
    const { userId, projectId, title, isShared=false } = params;
    const res=await GoogleDriveService.createGoogleDocsFile({ userId, projectId, title });
    
    if(isShared){
      await addAllProjectDevelopersToGoogleDoc({ userId, fileId: res.fileId, projectId });
    }

    return res;
  } catch (error) {
    throw error;
  }
}


const addAllProjectDevelopersToGoogleDoc = async (params: { userId: number, fileId: string, projectId: number }) => {
  const { userId, fileId, projectId } = params;

  // get all developers of the project
  const developers = await getDevelopersByProjectId(projectId);

  const emails = developers.map(developer => developer.email);

  const res= await GoogleDriveService.addUsersToGoogleDoc({ userId, fileId, emails });

  return res;
}

const removeProjectDevelopersFromGoogleDoc = async (params: { userId: number, fileId: string, projectId: number }) => {
  const { userId, fileId, projectId } = params;

  // get all developers of the project
  const developers = await getDevelopersByProjectId(projectId);

  const emails = developers.map(developer => developer.email);

  const res = await GoogleDriveService.removeUsersFromGoogleDoc({ userId, fileId, emails });

  return res;
}



const getGoogleDocsFiles = async (params: { userId: number, projectId: number }) => {
  const { userId, projectId } = params;

  const isClient = await prisma.project.findFirst({
    where: {
      id: projectId,
      client_id: userId,
    },
  });
  if(isClient) {
    return await GoogleDriveService.getGoogleDocsFiles({ userId, projectId, isClient: true });
  }else {
    const { isAssigned, clientId } = await ProjectDML.verifyDeveloperProjectAccess({ developerId: userId, projectId });

    if (!isAssigned) {
      throw new BRError({
        status: 403,
        type: 'NOT_AUTHORIZED',
        message: 'Developer is not assigned to this project'
      });
    }

    return await GoogleDriveService.getGoogleDocsFiles({ userId: clientId!, projectId, isClient: false });
  }
}



const generateProjectKnowledgeBlobPath = async (userId: number, projectId: number) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error('Project not found');
  }

  return `${userId}/${project.name}/${PROJECT_KNOWLEDGE_PREFIX}/`;
};


const listDocuments = async (params: { userId: number, projectId: number }) => {
  const { userId, projectId } = params;
  const prefix = await generateProjectKnowledgeBlobPath(userId, projectId);
  const documents = [];

  const containerClient = await BlobStorageService.initializeContainer();
  for await (const blob of containerClient.listBlobsFlat({ prefix })) {
    const sasUrl = await BlobStorageService.generateReadSasToken(blob.name);

    documents.push({
      name: blob.name.replace(prefix, ''),
      url: sasUrl,
      createdOn: blob.properties.createdOn,
      lastModified: blob.properties.lastModified
    });
  }
  return documents;
};

const deleteDocument = async (params: {
  userId: number,
  projectId: number,
  fileName: string
}) => {
  const { userId, projectId, fileName } = params;

  const prefix = await generateProjectKnowledgeBlobPath(userId, projectId);
  const blobPath = `${prefix}${fileName}`;

  await BlobStorageService.deleteBlob(blobPath);

  return {
    fileName
  };
};

const generatePresignedUrl = async (params: {
  userId: number,
  projectId: number,
  fileName: string,
  contentType: string
}) => {
  const { userId, projectId, fileName } = params;

  const prefix = await generateProjectKnowledgeBlobPath(userId, projectId);
  const blobPath = `${prefix}${fileName}`;

  const { sasToken, blobClient } = await BlobStorageService.generateWriteSasToken(blobPath);

  return {
    fileName,
    uploadUrl: sasToken,
    blobPath,
    finalUrl: blobClient.url
  };
};

export const DocumentsService = {
  ...GoogleDriveService,
  createGoogleDocsFile,
  getGoogleDocsFiles,
  addAllProjectDevelopersToGoogleDoc,
  removeProjectDevelopersFromGoogleDoc,
  listDocuments,
  deleteDocument,
  generatePresignedUrl,
}
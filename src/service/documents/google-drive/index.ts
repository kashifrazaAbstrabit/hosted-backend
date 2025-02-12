import prisma from "../../../config/database";
import { BRError } from "../../../common/utils/errors";
import { google, drive_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: `${process.env.CLIENT_URL}/google-drive/callback`,
});

type DriveType = drive_v3.Drive;

const withGoogleAuth = async (
  userId: number,
  operation: (drive: DriveType) => Promise<any>
) => {
  try {
    // 1. Get user's refresh token
    const userIntegration = await prisma.userIntegration.findUnique({
      where: {
        userId,
      },
    });

    if (!userIntegration?.google_refresh_token) {
      throw new BRError({
        status: 404,
        type: "GOOGLE_DRIVE_NOT_LINKED",
        message: "User has not linked Google Drive",
      });
    }

    // 2. Set credentials
    oauth2Client.setCredentials({
      refresh_token: userIntegration.google_refresh_token,
    });

    // 3. Refresh access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    // 4. Initialize drive
    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // 5. Execute operation
    const result = await operation(drive);

    return result;
  } catch (error) {
    throw error;
  }
};

const createGoogleDriveFolder = async (params: {
  folderName: string;
  parentFolderId: string;
  drive: DriveType;
}) => {
  const { folderName, parentFolderId, drive } = params;

  const fileMetadata = {
    name: folderName,
    parents: parentFolderId ? [parentFolderId] : undefined,
    mimeType: "application/vnd.google-apps.folder",
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    fields: "id, name, webViewLink",
  });

  return {
    folderId: response.data.id,
    folderName: response.data.name,
    webViewLink: response.data.webViewLink,
  };
};

// Generate auth URL : /google/drive/auth
const generateGoogleAuthUrl = async () => {
  const scopes = ["https://www.googleapis.com/auth/drive"];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
  return {
    authUrl,
  };
};

// Handle callback: /google/drive/callback google callback
const handleGoogleCallback = async (params: { code: any; userId: number }) => {
  try {
    const { code, userId } = params;
    const { tokens } = await oauth2Client.getToken(code as string);

    oauth2Client.setCredentials(tokens);

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const userIntegration = await prisma.userIntegration.findUnique({
      where: {
        userId
      },
    });

    if (userIntegration?.drive_folder_id) {
      await prisma.userIntegration.update({
        where: {
            userId,
        },
        data: {
          google_refresh_token: tokens.refresh_token!,
        },
      });

      return {
        message: "Google Drive successfully connected",
      };
    }

    const fileMetadata = {
      name: "IntelliDev Resources",
      mimeType: "application/vnd.google-apps.folder",
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id,name,webViewLink",
    });

    const folderId = response.data.id;

    await prisma.userIntegration.upsert({
      where: {
        userId
      },
      update: {
        google_refresh_token: tokens.refresh_token!,
        drive_folder_id: folderId,
      },
      create: {
        userId,
        google_refresh_token: tokens.refresh_token!,
        drive_folder_id: folderId,
      },
    });

    return {
      message: "Google Drive successfully connected",
    };
  } catch (error) {
    throw error;
  }
};

const getGoogleDocsFiles = async (params: {
  userId: number;
  projectId: number;
  isClient: boolean
}) => {
  const { userId, projectId, isClient } = params;
  return withGoogleAuth(userId, async (drive) => {
    const projectFolderId = await getOrCreateProjectFolder({
      userId,
      projectId,
      drive,
    });
    const response = await drive.files.list({
      q: `'${projectFolderId}' in parents and mimeType='application/vnd.google-apps.document'`,
      orderBy: "modifiedTime desc",
      fields:
      "nextPageToken, files(id, name, webViewLink, modifiedTime, createdTime, shared)",
      spaces: "drive",
    });

    // If user is client, return all files
    if (isClient) {
      return response.data.files;
    }
    // Otherwise only return shared files
    return response.data.files?.filter(file => file.shared) || [];
  });
};

const getOrCreateProjectFolder = async (params: {
  userId: number;
  projectId: number;
  drive: DriveType;
}) => {
  const { userId, projectId, drive } = params;

  // Get project details
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new BRError({
      status: 404,
      type: "PROJECT_NOT_FOUND",
      message: "Project not found",
    });
  }

  if(project.client_id !== userId) {
    throw new BRError({
      status: 403,
      type: "FORBIDDEN",
      message: "You do not have access to this project",
    });
  }

  // Return existing folder if exists
  if (project.project_folder_id) {
    return project.project_folder_id;
  }

  // Get user's root folder
  const userIntegration = await prisma.userIntegration.findUnique({
    where: {
        userId,
    },
  });

  // Create new project folder
  const { folderId } = await createGoogleDriveFolder({
    folderName: project.name,
    parentFolderId: userIntegration?.drive_folder_id!,
    drive,
  });

  // Update project with new folder ID
  await prisma.project.update({
    where: { id: projectId },
    data: { project_folder_id: folderId },
  });

  return folderId;
};

const createGoogleDocsFile = async (params: {
  userId: number;
  projectId: number;
  title: string;
}) => {
  const { userId, projectId, title } = params;
  return withGoogleAuth(userId, async (drive) => {
    const projectFolderId = await getOrCreateProjectFolder({
      userId,
      projectId,
      drive,
    });

    const fileMetadata = {
      name: title,
      mimeType: "application/vnd.google-apps.document",
      parents: projectFolderId ? [projectFolderId] : undefined,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id, name, webViewLink",
    });

    return {
      fileId: response.data.id,
      fileName: response.data.name,
      webViewLink: response.data.webViewLink,
    };
  });
};

const deleteGoogleDocsFile = async (params: {
  userId: number;
  fileId: string;
}) => {
  const { userId, fileId } = params;
  return withGoogleAuth(userId, async (drive) => {
    await drive.files.delete({
      fileId,
    });
    return {
      fileId,
    };
  });
};

const addUsersToGoogleDoc = async (params: {
  userId: number;
  fileId: string;
  emails: string[];
}) => {
  const { userId, fileId, emails } = params;

  return withGoogleAuth(userId, async (drive) => {
    const permissionRequests = emails.map((email) => {
      return {
        fileId,
        requestBody: {
          role: "writer",
          type: "user",
          emailAddress: email,
        },
      };
    });

    const responses = await Promise.all(
      permissionRequests.map((permissionRequest) => {
        return drive.permissions.create(permissionRequest);
      })
    );

    return responses.map((response) => response.data);
  });
};

const removeUsersFromGoogleDoc = async (params: {
  userId: number;
  fileId: string;
  emails: string[];
}) => {
  const { userId, fileId, emails } = params;

  return withGoogleAuth(userId, async (drive) => {
    // First, get all permissions for the file
    const permissions = await drive.permissions.list({
      fileId,
      fields: "permissions(id,emailAddress)",
    });

    // Find permission IDs for the emails we want to remove
    const permissionsToDelete =
      permissions.data.permissions?.filter((permission) =>
        emails.includes(permission.emailAddress || "")
      ) || [];

    // Delete permissions
    const responses = await Promise.all(
      permissionsToDelete.map((permission) =>
        drive.permissions.delete({
          fileId,
          permissionId: permission.id as string,
        })
      )
    );

    return responses.map((response) => response.data);
  });
};

export const GoogleDriveService = {
  generateGoogleAuthUrl,
  handleGoogleCallback,
  getGoogleDocsFiles,
  createGoogleDocsFile,
  deleteGoogleDocsFile,
  addUsersToGoogleDoc,
  removeUsersFromGoogleDoc,
};

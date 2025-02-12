import { Octokit } from '@octokit/rest';
import prisma from "../../../config/database";
import { BRError } from "../../../common/utils/errors";
import { response } from 'express';

const withGithubAuth = async (
  userId: number,
  operation: (octokit: Octokit) => Promise<any>
) => {
  try {
    // 1. Get user's GitHub access token
    const userIntegration = await prisma.userIntegration.findUnique({
      where: {
        userId
      },
    });

    if (!userIntegration?.github_access_token) {
      throw new BRError({
        status: 404,
        type: "GITHUB_NOT_LINKED",
        message: "User has not linked GitHub account",
      });
    }

    // 2. Initialize Octokit
    const octokit = new Octokit({
      auth: userIntegration.github_access_token,
    });

    // 3. Execute operation
    return await operation(octokit);
  } catch (error) {
    throw error;
  }
};

const generateGithubAuthUrl = () => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${
    process.env.GITHUB_CLIENT_ID
  }&scope=${encodeURIComponent('repo admin:org user')}`;
  
  return { authUrl: githubAuthUrl };
};

const handleGithubCallback = async (params: { code: string; userId: number }) => {
  try {
    const { code, userId } = params;
    
    const response=await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();
    const accessToken = data.access_token;

    // Store the token
    await prisma.userIntegration.upsert({
      where: {
          userId: userId,
      },
      update: {
        github_access_token: accessToken,
      },
      create: {
        userId: userId,
        github_access_token: accessToken,
      },
    });

    return { message: "GitHub successfully connected" };
  } catch (error) {
    throw error;
  }
};

const createRepository = async (params: {
  userId: number;
  projectId: number;
  repoName: string;
  isPrivate: boolean;
}) => {
  const { userId, projectId, repoName, isPrivate } = params;

  return withGithubAuth(userId, async (octokit) => {
    const response = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      private: isPrivate,
      auto_init: true,
    });

    // Store repo info in project
    await prisma.project.update({
      where: { id: projectId },
      data: { github_repo_id: response.data.id.toString() },
    });

    return {
      repoId: response.data.id,
      repoName: response.data.name,
      htmlUrl: response.data.html_url,
    };
  });
};

// const addCollaborator = async (params: {
//   userId: number;
//   repoName: string;
//   username: string;
//   permission: 'pull' | 'push' | 'admin';
// }) => {
//   const { userId, repoName, username, permission } = params;

//   return withGithubAuth(userId, async (octokit) => {
//     const { data } = await octokit.repos.addCollaborator({
//       owner: username,
//       repo: repoName,
//       username,
//       permission,
//     });

//     return data;
//   });
// };

// const removeCollaborator = async (params: {
//   userId: number;
//   repoName: string;
//   username: string;
// }) => {
//   const { userId, repoName, username } = params;

//   return withGithubAuth(userId, async (octokit) => {
//     await octokit.repos.removeCollaborator({
//       owner: username,
//       repo: repoName,
//       username,
//     });

//     return { message: 'Collaborator removed successfully' };
//   });
// };

// const deleteRepository = async (params: {
//   userId: number;
//   repoName: string;
// }) => {
//   const { userId, repoName } = params;

//   return withGithubAuth(userId, async (octokit) => {
//     const { data: user } = await octokit.users.getAuthenticated();
    
//     await octokit.repos.delete({
//       owner: user.login,
//       repo: repoName,
//     });

//     return { message: 'Repository deleted successfully' };
//   });
// };

export const GitHubService = {
  generateGithubAuthUrl,
  handleGithubCallback,
  createRepository,
  // addCollaborator,
  // removeCollaborator,
  // deleteRepository,
};
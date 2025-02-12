import { Request } from "express";
import { GitHubService } from "../service/external/github";


const generateGithubAuthUrl = (req: Request) => {
    try {
        return GitHubService.generateGithubAuthUrl();
    } catch (error) {
        throw error;
    }
}

const handleGithubCallback = async (req: Request) => {
    const code = String(req.query.code);
    // const { userId } = req.body.user;
    try {
        return await GitHubService.handleGithubCallback({code, userId: 3});
    } catch (error) {
        throw error;
    }
}

const createRepository = async (req: Request) => {
    const { projectId, repoName, isPrivate } = req.body;
    const { userId } = req.body.user;
    try {
        return await GitHubService.createRepository({userId, projectId, repoName, isPrivate});
    } catch (error) {
        throw error;
    }
}

export const DevelopmentController = {
    generateGithubAuthUrl,
    handleGithubCallback,
    createRepository
}
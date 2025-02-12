import { BRError } from "../common/utils/errors";
import prisma from "../config/database";

const getDevelopersByProjectId = async (projectId: number) => {
    let developerIds: number[] = [];
    const assignedDevelopers = await prisma.project.findMany({
        where: {
            id: projectId
        },
        select: {
            assigned_people: {
                select: {
                    developer_id: true
                }
            }
        }
    });

    developerIds = assignedDevelopers.flatMap(developer =>
        developer.assigned_people.map(assigned => assigned.developer_id)
    );

    return developerIds;
}

const verifyProjectClientOwnership = async (userId: number, projectId: number) => {
    try {
        
        // Check if owner is project's client
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { client_id: true }
        });
    
        if (!project) {
            throw new BRError({
                status: 404,
                type: "PROJECT_NOT_FOUND",
                message: "Project not found"
            });
        }
    
        if (project.client_id !== userId) {
            throw new BRError({
                status: 403,
                type: "NOT_AUTHORIZED",
                message: "Only project client can perform this action"
            });
        }

        return true;

    } catch (error) {
        throw error;
        
    }
}

const verifyDeveloperProjectAccess = async (params: {
    developerId: number;
    projectId: number;
}): Promise<{
    isAssigned: boolean;
    clientId?: number;
}> => {
    const project = await prisma.project.findFirst({
        where: {
            id: params.projectId,
            assigned_people: {
                some: {
                    developer_id: params.developerId
                }
            }
        },
        select: {
            client_id: true
        }
    });

    return {
        isAssigned: !!project,
        clientId: project?.client_id
    };
};

export const ProjectDML = {
    getDevelopersByProjectId,
    verifyProjectClientOwnership,
    verifyDeveloperProjectAccess
}
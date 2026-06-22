import { connectDB } from "@/lib/db/connect";
import { Project } from "@/lib/db/models/ProjectFiles";
import { verifyToken } from "@/lib/middleware/auth";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = verifyToken(req);

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "Unauthorized"
                },
                {
                    status: 401
                }
            );
        }

        await connectDB();

        const { id } = await context.params;

        const project = await Project.findOne({
            projectId: id
        });

        if (!project) {
            return Response.json(
                {
                    success: false,
                    message: "Project not found"
                },
                {
                    status: 404
                }
            );
        }

        return Response.json({
            success: true,
            projectId: project.projectId,
            version: project.version,
            files: project.files
        });

    } catch (error) {
        console.error(error);

        return Response.json(
            {
                success: false,
                message: "Failed to load files"
            },
            {
                status: 500
            }
        );
    }
}
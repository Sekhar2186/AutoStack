import { verifyToken } from "@/lib/middleware/auth";
import { getUsers } from "@/lib/services/userService";

export async function GET(req: Request) {
    try {
        const user = verifyToken(req);

        if (!user) {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const users = getUsers();
        const currentUser = users.find((u: any) => u.id === user.id);

        if (!currentUser) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            projects: currentUser.projects || []
        });

    } catch (error) {
        console.error("Error fetching projects:", error);
        return Response.json({
            success: false,
            message: "Failed to fetch projects"
        }, { status: 500 });
    }
}

import { verifyToken } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

export async function GET(req: Request) {
    try {
        await connectDB();
        const decoded = verifyToken(req);

        if (!decoded) {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const user = await User.findById((decoded as any).id);

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            projects: user.projects || []
        });

    } catch (error) {
        console.error("Error fetching projects:", error);
        return Response.json({
            success: false,
            message: "Failed to fetch projects"
        }, { status: 500 });
    }
}

import { verifyToken } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

export async function DELETE(req: Request) {
    try {
        await connectDB();
        
        // Verify the user is authenticated securely
        const decoded = verifyToken(req);

        if (!decoded) {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const userId = (decoded as any).id;

        // Delete the user from the database
        // This will also effectively orphan/delete the nested projects
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: "Account deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting user account:", error);
        return Response.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}

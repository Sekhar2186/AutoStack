import { verifyToken } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        await connectDB();
        const decoded = verifyToken(req);

        if (!decoded) {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return Response.json({
                success: false,
                message: "Missing required fields"
            }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return Response.json({
                success: false,
                message: "New password must be at least 6 characters"
            }, { status: 400 });
        }

        const user = await User.findById((decoded as any).id);
        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return Response.json({
                success: false,
                message: "Incorrect current password"
            }, { status: 400 });
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return Response.json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change password error:", error);
        return Response.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}

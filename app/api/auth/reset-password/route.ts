import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { token, email, newPassword } = await req.json();

        if (!token || !email || !newPassword) {
            return Response.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return Response.json({ success: false, message: "Password must be at least 6 characters" }, { status: 400 });
        }

        // Hash the token from URL to compare with stored hash
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            email,
            resetPasswordToken: tokenHash,
            resetPasswordExpires: { $gt: new Date() } // must not be expired
        });

        if (!user) {
            return Response.json({
                success: false,
                message: "Invalid or expired reset token. Please request a new one."
            }, { status: 400 });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return Response.json({
            success: true,
            message: "Password reset successfully. You can now sign in."
        });

    } catch (error) {
        console.error("Reset password error:", error);
        return Response.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

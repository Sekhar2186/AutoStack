import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { email } = await req.json();

        if (!email) {
            return Response.json({ success: false, message: "Email is required" }, { status: 400 });
        }

        const user = await User.findOne({ email });

        // Always return success to avoid email enumeration attacks
        if (!user) {
            return Response.json({
                success: true,
                message: "If this email exists, a reset link has been sent."
            });
        }

        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

        // Log the reset link to console for development (no email service configured)
        console.log("=== PASSWORD RESET LINK (Dev Mode) ===");
        console.log(resetUrl);
        console.log("======================================");

        // In production, send email here using nodemailer or Resend.
        // For now, we return the reset link in the response for dev/testing.
        return Response.json({
            success: true,
            message: "If this email exists, a reset link has been sent.",
            // Remove `resetUrl` from response in production
            resetUrl: process.env.NODE_ENV === "production" ? undefined : resetUrl
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        return Response.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

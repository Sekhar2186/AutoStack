import { verifyToken } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

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

        const { name, email, avatar } = await req.json();

        const user = await User.findById((decoded as any).id);
        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        // Validate email uniqueness if changed
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return Response.json({
                    success: false,
                    message: "Email is already in use"
                }, { status: 400 });
            }
            user.email = email;
        }

        if (name !== undefined) user.name = name;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();

        return Response.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                name: user.name || "",
                email: user.email,
                avatar: user.avatar || ""
            }
        });

    } catch (error) {
        console.error("Update profile error:", error);
        return Response.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}

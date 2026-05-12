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

        const user = await User.findById((decoded as any).id).select("-password");

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                credits: user.credits,
                plan: user.plan,
                totalCredits: user.plan === "pro" ? 500 : 20
            }
        });

    } catch (error) {
        console.error("Error fetching user details:", error);
        return Response.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}

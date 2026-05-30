import { verifyToken } from "@/lib/middleware/auth";
import { getOffer } from "@/lib/services/priceService";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

export async function POST(req: Request) {
    try {
        const user = verifyToken(req);
        if (!user) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { plan, duration } = body; // e.g. plan = "pro" | "enterprise", duration = 1 | 12

        await connectDB();
        const dbUser = await User.findById((user as any).id);
        if (!dbUser) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const offer = getOffer(plan, duration);

        //  APPLY PLAN
        dbUser.plan = plan;

        // Reset and grant credits corresponding to the plan
        let newCredits = 20;
        if (plan === "pro") {
            newCredits = 500;
        } else if (plan === "enterprise") {
            newCredits = 1000;
        }
        dbUser.credits = newCredits;
        dbUser.lastReset = new Date();

        //  SET PLAN EXPIRY
        dbUser.planExpiresAt = new Date(
            Date.now() + duration * 30 * 24 * 60 * 60 * 1000
        );

        // Log to credit history
        if (!dbUser.creditHistory) {
            dbUser.creditHistory = [];
        }
        dbUser.creditHistory.unshift({
            action: `Upgrade to ${plan === "pro" ? "Pro" : "Enterprise"}`,
            amount: newCredits,
            timestamp: new Date()
        });

        await dbUser.save();

        return Response.json({
            success: true,
            message: "Plan upgraded",
            offer
        });

    } catch (err) {
        console.error("Error in upgrade route:", err);
        return Response.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
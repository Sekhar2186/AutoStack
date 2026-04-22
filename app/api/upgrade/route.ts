import { verifyToken } from "@/lib/middleware/auth";
import { getOffer } from "@/lib/services/priceservice";
import { getUsers, saveUsers } from "@/lib/services/userService";

export async function POST(req: Request) {
    try {
        const user = verifyToken(req);
        if (!user) {
            return Response.json({ success: false, message: "Unauthorized" });
        }

        const body = await req.json();
        const { plan, duration } = body;

        const users = getUsers();
        const currentUser = users.find((u: any) => u.id === user.id);

        const offer = getOffer(plan, duration);

        // 🔥 APPLY PLAN
        currentUser.plan = plan;

        // 🔥 SET PLAN EXPIRY
        currentUser.planExpiresAt = new Date(
            Date.now() + duration * 30 * 24 * 60 * 60 * 1000
        ).toISOString();

        saveUsers(users);

        return Response.json({
            success: true,
            message: "Plan upgraded",
            offer
        });

    } catch (err) {
        console.error(err);
        return Response.json({ success: false });
    }
}
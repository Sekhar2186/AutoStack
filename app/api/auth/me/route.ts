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

        const user = await User.findById((decoded as any).id).select("-password -resetPasswordToken -resetPasswordExpires");

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        // Daily reset check
        const now = new Date();
        const last = new Date(user.lastReset || 0);
        const isNewDay =
            now.getDate() !== last.getDate() ||
            now.getMonth() !== last.getMonth() ||
            now.getFullYear() !== last.getFullYear();

        if (isNewDay) {
            let maxCredits = 20;
            if (user.plan === "pro") maxCredits = 500;
            else if (user.plan === "enterprise") maxCredits = 1000;

            user.credits = maxCredits;
            user.lastReset = now;

            if (!user.creditHistory) user.creditHistory = [];
            user.creditHistory.unshift({
                action: "Daily Reset",
                amount: maxCredits,
                timestamp: now
            });

            await user.save();
        }

        const totalCredits = user.plan === "pro" ? 500 : user.plan === "enterprise" ? 1000 : 20;

        // Calculate REAL credits used today (from credit history)
        // Credits used = sum of all negative amounts in creditHistory for today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const creditsUsedToday = (user.creditHistory || []).reduce((sum: number, entry: any) => {
            const entryDate = new Date(entry.timestamp);
            if (entryDate >= todayStart && entry.amount < 0) {
                return sum + Math.abs(entry.amount);
            }
            return sum;
        }, 0);

        // Build 30-day usage trend from credit history
        // For each of the last 30 days, sum up negative (consumed) credits
        const usageTrend: number[] = [];
        for (let i = 29; i >= 0; i--) {
            const dayStart = new Date();
            dayStart.setHours(0, 0, 0, 0);
            dayStart.setDate(dayStart.getDate() - i);

            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const dayUsage = (user.creditHistory || []).reduce((sum: number, entry: any) => {
                const entryDate = new Date(entry.timestamp);
                if (entryDate >= dayStart && entryDate < dayEnd && entry.amount < 0) {
                    return sum + Math.abs(entry.amount);
                }
                return sum;
            }, 0);

            usageTrend.push(dayUsage);
        }

        // Real generation count = count of "App Generation" entries in credit history
        const genHistoryCount = (user.creditHistory || []).filter(
            (entry: any) => entry.action === "App Generation"
        ).length;

        return Response.json({
            success: true,
            user: {
                id: user._id,
                name: user.name || "",
                email: user.email,
                avatar: user.avatar || "",
                credits: user.credits,
                plan: user.plan,
                totalCredits,
                creditsUsedToday,
                genHistoryCount,
                projectCount: (user.projects || []).length,
                creditHistory: (user.creditHistory || []).slice(0, 50), // last 50 entries
                usageTrend
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

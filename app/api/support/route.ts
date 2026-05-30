import { verifyToken } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db/connect";

export async function POST(req: Request) {
    try {
        const decoded = verifyToken(req);
        if (!decoded) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { subject, message } = await req.json();
        if (!subject || !message) {
            return Response.json({ success: false, message: "Subject and message are required" }, { status: 400 });
        }

        // Simulate support ticket creation (logs to console & returns success)
        console.log(`[Support Ticket] User ID: ${(decoded as any).id} | Subject: ${subject} | Message: ${message}`);

        return Response.json({
            success: true,
            message: "Support ticket submitted successfully! Our team will contact you shortly."
        });
    } catch (error) {
        console.error("Support API error:", error);
        return Response.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db/connect";
import { UserAISettings } from "@/lib/db/models/UserAISettings";
import { decrypt } from "@/lib/services/ai/encryption";

export async function POST(req: NextRequest) {
    const decoded = verifyToken(req as unknown as Request);
    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let body: { provider: string; apiKey: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
    }

    let { provider, apiKey } = body;

    if (!provider) {
        return NextResponse.json({ success: false, message: "Provider is required" }, { status: 400 });
    }

    if (!apiKey) {
        await connectDB();
        const settings = await UserAISettings.findOne({ userId: decoded.id });
        const providerConfig = settings?.providers?.[provider];
        if (!providerConfig || !providerConfig.apiKey) {
            return NextResponse.json({ success: false, message: "API Key is required" }, { status: 400 });
        }
        apiKey = decrypt(providerConfig.apiKey);
    }

    try {
        let res: Response;
        
        if (provider === "gemini") {
            res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash?key=${apiKey}`);
        } else if (provider === "openai") {
            res = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${apiKey}` }});
        } else if (provider === "groq") {
            res = await fetch("https://api.groq.com/openai/v1/models", { headers: { Authorization: `Bearer ${apiKey}` }});
        } else if (provider === "claude") {
            res = await fetch("https://api.anthropic.com/v1/models", { 
                headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
            });
        } else {
            return NextResponse.json({ success: false, message: "Unsupported provider" }, { status: 400 });
        }

        if (res.ok) {
            return NextResponse.json({ success: true, message: "Connection successful" });
        } else {
            const errData = await res.json().catch(() => ({}));
            return NextResponse.json({ 
                success: false, 
                message: errData.error?.message || "Invalid API key or connection failed." 
            }, { status: res.status });
        }
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ success: false, message: err.message || "Connection failed" }, { status: 500 });
    }
}

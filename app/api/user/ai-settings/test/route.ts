import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/services/ai/providerFactory";
import { verifyToken } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db/connect";
import { UserAISettings } from "@/lib/db/models/UserAISettings";
import { decrypt } from "@/lib/services/ai/encryption";
import { isAuthError, isQuotaError, isTimeoutError } from "@/lib/services/ai/errorUtils";

export async function POST(req: NextRequest) {
    try {
        const decoded = verifyToken(req as unknown as Request);
        if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        let body: { provider: string; apiKey?: string; model?: string };
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
        }

        let { provider, apiKey, model } = body;

        if (!provider) {
            return NextResponse.json({ success: false, message: "Provider is required" }, { status: 400 });
        }

        if (!apiKey) {
            await connectDB();
            const settings = await UserAISettings.findOne({ userId: decoded.id });
            const providerConfig = settings?.providers?.[provider as any];
            if (!providerConfig || !providerConfig.apiKey) {
                return NextResponse.json({ success: false, message: "API Key is required" }, { status: 400 });
            }
            apiKey = decrypt(providerConfig.apiKey);
        }

        if (!model) {
            model = provider === "gemini" ? "gemini-2.5-flash" 
                  : provider === "openai" ? "gpt-4o" 
                  : provider === "claude" ? "claude-3-5-sonnet-20241022" 
                  : "llama-3.3-70b-versatile";
        }

        const aiProvider = getProvider(provider);

        // Minimal prompt to test connection
        await aiProvider.generate({
            prompt: "Hi",
            model,
            apiKey: apiKey!,
            config: { maxOutputTokens: 10, temperature: 0 },
        });

        return NextResponse.json({ success: true, message: "Connection successful" });
    } catch (error: any) {
        console.error(`[TestConnection API] ${error.message || error}`);
        
        let errorMessage = "Invalid API key or connection failed.";
        
        if (isAuthError(error)) {
            errorMessage = "Invalid API Key or unauthorized access.";
        } else if (isQuotaError(error)) {
            errorMessage = "Quota exceeded or rate limited.";
        } else if (isTimeoutError(error)) {
            errorMessage = "Network timeout while connecting to provider.";
        } else if (error.message) {
            errorMessage = error.message;
        }

        return NextResponse.json({ success: false, message: errorMessage }, { status: 400 });
    }
}

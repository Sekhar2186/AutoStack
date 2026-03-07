import { plannerAgent } from "@/lib/agents/plannerAgent";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const prompt = body.prompt;

        const blueprint = await plannerAgent(prompt);

        return Response.json({
            success: true,
            blueprint: blueprint
        });
    }
    catch (error) {
        console.error(error);
        return Response.json({
            success: false,
            message: "Failed to generate blueprint"
        });
    }
}
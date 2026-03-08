import { plannerAgent } from "@/lib/agents/plannerAgent";
import { coderAgent } from "@/lib/agents/coderAgent";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const prompt = body.prompt;

        const blueprint = await plannerAgent(prompt);
        const code = await coderAgent(blueprint);

        return Response.json({
            success: true,
            blueprint: blueprint,
            code: code
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
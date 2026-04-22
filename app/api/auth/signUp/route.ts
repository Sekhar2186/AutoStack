import { createUser, findUserByEmail } from "@/lib/services/userService";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    const body = await req.json();
    const { email, password } = body;

    const existing = findUserByEmail(email);

    if (existing) {
        return Response.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: Date.now().toString(),
        email,
        password: hashedPassword,

        plan: "pro",
        credits: 500,

        trialEndsAt: new Date(
            Date.now() + 60 * 24 * 60 * 60 * 1000   // 60 days
        ).toISOString(),

        lastReset: new Date().toISOString()
    };
    createUser(newUser);

    return Response.json({ success: true, message: "User created" });
}

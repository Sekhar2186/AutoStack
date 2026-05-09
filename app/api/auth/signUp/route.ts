//import { createUser, findUserByEmail } from "@/lib/services/userService";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const { name, email, password } = body;

        if (!email || !password) {
            return Response.json(
                { success: false, message: "Missing fields" },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return Response.json(
                { success: false, message: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,

            plan: "free",
            credits: 20,

            trialEndsAt: new Date(
                Date.now() + 60 * 24 * 60 * 60 * 1000
            ),

            lastReset: new Date()
        });

        return Response.json({
            success: true,
            message: "User created successfully"
        });

    } catch (error) {
        console.error(error);

        return Response.json(
            { success: false, message: "Server Error" },
            { status: 500 }
        );
    }
}

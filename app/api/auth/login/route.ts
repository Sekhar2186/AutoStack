//import { findUserByEmail } from "@/lib/services/userService";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return Response.json(
                { success: false, message: "Missing fields" },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email });

        if (!user) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return Response.json(
                { success: false, message: "Invalid password" },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                plan: user.plan
            },
            SECRET,
            { expiresIn: "7d" }
        );

        return Response.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                plan: user.plan,
                credits: user.credits
            }
        });

    } catch (error) {
        console.error(error);

        return Response.json(
            { success: false, message: "Server Error" },
            { status: 500 }
        );
    }
}
import { findUserByEmail } from "@/lib/services/userService";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = "your_secret_key";

export async function POST(req: Request) {
    const body = await req.json();
    const { email, password } = body;

    const user = findUserByEmail(email);

    if (!user) {
        return Response.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return Response.json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        SECRET,
        { expiresIn: "7d" }
    );

    return Response.json({
        success: true,
        token
    });
}
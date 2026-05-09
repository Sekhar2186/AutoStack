import jwt from "jsonwebtoken";
import { getUsers } from "../services/userService";

const SECRET = process.env.JWT_SECRET || "your_secret_key";

export function verifyToken(req: Request) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) return null;

    const token = authHeader.split(" ")[1];

    // Optional: Keep a simpler demo-token if needed, but remove JSON dependency
    if (token === "demo-token") {
        return { id: "demo-user", email: "demo@example.com", plan: "pro" };
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        return decoded;
    } catch {
        return null;
    }
}
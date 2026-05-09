import jwt from "jsonwebtoken";
import { getUsers } from "../services/userService";

const SECRET = "your_secret_key";

export function verifyToken(req: Request) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) return null;

    const token = authHeader.split(" ")[1];

    // For testing/demo purposes from the dashboard
    if (token === "demo-token") {
        const users = getUsers();
        // Return the first user (or the specific pro user) as the authenticated user
        return users.length > 0 ? users[users.length - 1] : null; 
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        return decoded;
    } catch {
        return null;
    }
}
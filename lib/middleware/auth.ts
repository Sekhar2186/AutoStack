import jwt from "jsonwebtoken";

const SECRET = "your_secret_key";

export function verifyToken(req: Request) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) return null;

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET);
        return decoded;
    } catch {
        return null;
    }
}
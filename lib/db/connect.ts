import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = {
        conn: null,
        promise: null,
    };
}

export async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!MONGODB_URI) {
        console.error("MONGODB_URI missing");
        return null;
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI)
            .then((mongoose) => mongoose);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

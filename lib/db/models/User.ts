import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    plan: { type: String, default: "free" },
    credits: { type: Number, default: 20 },
    trialEndsAt: { type: Date },
    lastReset: { type: Date, default: Date.now },
    projects: [
        {
            projectId: String,
            appName: String,
            description: String,
            createdAt: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
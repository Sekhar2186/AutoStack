import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    credits: {
        type: Number,
        default: 20
    },
    plan: {
        type: String,
        default: "free"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const User =
    mongoose.models.User ||
    mongoose.model("User", UserSchema);

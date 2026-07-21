import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import crypto from "crypto";

const SECRET = process.env.JWT_SECRET || "your_secret_key";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const code = url.searchParams.get("code");

        if (!code) {
            return NextResponse.redirect(`${url.origin}/auth?error=MissingAuthCode`);
        }

        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
            console.error("Missing Google OAuth credentials in env variables");
            return NextResponse.redirect(`${url.origin}/auth?error=ServerConfigurationError`);
        }

        const redirectUri = `${url.origin}/api/auth/callback/google`;

        // 1. Exchange the authorization code for an access token
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            console.error("Google Token Error:", tokenData);
            return NextResponse.redirect(`${url.origin}/auth?error=TokenExchangeFailed`);
        }

        const accessToken = tokenData.access_token;

        // 2. Fetch the user's profile from Google using the access token
        const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const googleUser = await userResponse.json();

        if (!googleUser.email) {
            return NextResponse.redirect(`${url.origin}/auth?error=GoogleEmailMissing`);
        }

        // 3. Find or Create the user in MongoDB
        await connectDB();

        let user = await User.findOne({ email: googleUser.email });

        if (!user) {
            // Generate a random password since the schema requires it
            const randomPassword = crypto.randomBytes(16).toString("hex");
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await User.create({
                name: googleUser.name,
                email: googleUser.email,
                avatar: googleUser.picture,
                password: hashedPassword,
                plan: "free",
                credits: 20,
            });
        }

        // 4. Generate JWT for our app
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                plan: user.plan
            },
            SECRET,
            { expiresIn: "7d" }
        );

        // 5. Redirect back to the frontend with the token
        return NextResponse.redirect(`${url.origin}/auth/callback?token=${token}`);

    } catch (error) {
        console.error("OAuth Callback Error:", error);
        return NextResponse.redirect(`${new URL(req.url).origin}/auth?error=ServerError`);
    }
}

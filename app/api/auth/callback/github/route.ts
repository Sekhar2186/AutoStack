import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import crypto from "crypto";

const SECRET = process.env.JWT_SECRET || "your_secret_key";
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const code = url.searchParams.get("code");

        if (!code) {
            return NextResponse.redirect(`${url.origin}/auth?error=MissingAuthCode`);
        }

        if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
            console.error("Missing GitHub OAuth credentials in env variables");
            return NextResponse.redirect(`${url.origin}/auth?error=ServerConfigurationError`);
        }

        // 1. Exchange the authorization code for an access token
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            console.error("GitHub Token Error:", tokenData);
            return NextResponse.redirect(`${url.origin}/auth?error=TokenExchangeFailed`);
        }

        const accessToken = tokenData.access_token;

        // 2. Fetch the user's profile from GitHub using the access token
        const userResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
            },
        });

        const githubUser = await userResponse.json();
        
        let primaryEmail = githubUser.email;

        // If the user's primary email is private, we need to fetch their emails specifically
        if (!primaryEmail) {
            const emailsResponse = await fetch("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/vnd.github.v3+json",
                },
            });
            const emails = await emailsResponse.json();
            const primaryEmailObj = emails.find((e: any) => e.primary && e.verified);
            if (primaryEmailObj) {
                primaryEmail = primaryEmailObj.email;
            }
        }

        if (!primaryEmail) {
            return NextResponse.redirect(`${url.origin}/auth?error=GitHubEmailMissing`);
        }

        // 3. Find or Create the user in MongoDB
        await connectDB();

        let user = await User.findOne({ email: primaryEmail });

        if (!user) {
            // Generate a random password since the schema requires it
            const randomPassword = crypto.randomBytes(16).toString("hex");
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await User.create({
                name: githubUser.name || githubUser.login, // GitHub might not have a name set
                email: primaryEmail,
                avatar: githubUser.avatar_url,
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
        console.error("GitHub OAuth Callback Error:", error);
        return NextResponse.redirect(`${new URL(req.url).origin}/auth?error=ServerError`);
    }
}

"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
            console.error("OAuth Error:", error);
            // Redirect back to login with error state
            router.replace(`/auth?error=${error}`);
            return;
        }

        if (token) {
            // Save token and redirect to dashboard
            localStorage.setItem("token", token);
            router.replace("/dashboard");
        } else {
            // No token and no error, fallback to auth
            router.replace("/auth");
        }
    }, [router, searchParams]);

    return (
        <main className="min-h-screen w-full bg-[#000000] text-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 animate-pulse">Completing sign in...</p>
        </main>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen w-full bg-[#000000] text-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            </main>
        }>
            <CallbackContent />
        </Suspense>
    );
}

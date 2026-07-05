import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AutoStack — The Future of Web Development",
  description:
    "AutoStack is the AI-powered platform that generates full-stack web applications from a single prompt. Build, preview, and deploy in seconds.",
  keywords: ["AI web development", "code generation", "AutoStack", "full-stack AI", "app builder"],
  openGraph: {
    title: "AutoStack — The Future of Web Development",
    description: "Generate complete web applications with AI. From prompt to production in seconds.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-slate-50`}>
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#f1f5f9",
              borderRadius: "16px",
              fontSize: "14px",
              fontWeight: 600,
            },
          }}
        />
      </body>
    </html>
  );
}
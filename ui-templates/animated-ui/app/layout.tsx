"use client";

import { motion } from "framer-motion";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-linear-to-br from-gray-900 via-black to-gray-800 text-white min-h-screen">
                <motion.main
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl mx-auto p-6"
                >
                    {children}
                </motion.main>
            </body>
        </html>
    );
}
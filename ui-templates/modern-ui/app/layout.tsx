"use client";

import { useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [dark, setDark] = useState(false);

    return (
        <html lang="en">
            <body className={dark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}>
                <div className="p-4 flex justify-end">
                    <button
                        onClick={() => setDark(!dark)}
                        className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                        Toggle Theme
                    </button>
                </div>

                <main className="max-w-3xl mx-auto p-6">
                    {children}
                </main>
            </body>
        </html>
    );
}

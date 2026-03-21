export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-linear-to-br from-purple-500 to-blue-500 min-h-screen flex items-center justify-center">
                <div className="backdrop-blur-lg bg-white/20 border border-white/30 rounded-xl p-8 shadow-xl w-full max-w-xl">
                    {children}
                </div>
            </body>
        </html>
    );
}
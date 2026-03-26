import "./global.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-linear-to-br from-purple-500 to-blue-500 min-h-screen">
                <div className="backdrop-blur-lg bg-white/10 w-full min-h-screen">
                    {children}
                </div>
            </body>
        </html>
    );
}
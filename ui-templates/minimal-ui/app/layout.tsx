import "./globals.css";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}
) {
    return (
        <html lang="en">
            <body className="bg-gray-100 text-gray-900">
                <div className="min-h-screen w-full bg-white">
                    {children}
                </div>
            </body>
        </html>
    );
}

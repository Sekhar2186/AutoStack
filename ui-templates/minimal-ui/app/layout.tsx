export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}
) {
    return (
        <html lang="en">
            <body className="bg-gray-100 text-gray-900">
                <div className="min-h-screen flex items-center justify-center">
                    <div className="w-full max-w-xl bg-white shadow-md rounded-lg p-6">
                        {children}
                    </div>
                </div>
            </body>
        </html>
    );
}

import "./globals.css";

export const metadata = {
  title: "IoT Dashboard",
  description: "ESP32 + Firebase + Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-black">
        {children}
      </body>
    </html>
  );
}

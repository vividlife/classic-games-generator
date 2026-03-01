import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Classic Games",
  description: "Play Snake and Tetris with multiple themes and difficulty levels",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}

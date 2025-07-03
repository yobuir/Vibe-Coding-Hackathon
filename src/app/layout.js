import { Geist, Geist_Mono } from "next/font/google";
import "./globals-simple.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CivicSpark AI - Gamified Civic Education Platform",
  description: "Learn about civic rights, duties, and democratic processes through interactive AI-powered microlearning designed for Rwanda and beyond.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
        style={{ backgroundColor: '#ffffff', color: '#171717' }}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

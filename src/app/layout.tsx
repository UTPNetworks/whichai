import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import OnboardingGuard from "@/components/OnboardingGuard";
import ThemeToggle from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WhichAi.cloud — The World's AI at Your Fingertips",
  description:
    "Compare, connect, and conquer with the best AI models. Exclusive member rates on Claude 4.6, GPT-5, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300`}
      >
        <AuthProvider>
          <OnboardingGuard>
            {children}
            <ThemeToggle />
          </OnboardingGuard>
        </AuthProvider>
      </body>
    </html>
  );
}

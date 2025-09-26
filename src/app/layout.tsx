// Updated layout.tsx with proper viewport configuration
import "mydive/styles/globals.css";
import { type Metadata, type Viewport } from "next";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Geist } from "next/font/google";
import { Providers } from "./providers";
import { checkRole } from "mydive/utils/roles";
import { AdminNavigation } from "./_layouts/AdminNavigation";
import { UserNavigation } from "./_layouts/UserNavigation";
import { GuestNavigation } from "./_layouts/GuestNavigation";

export const metadata: Metadata = {
  title: "MyDive Skydiving",
  description: "Private Skydiving. Anywhere.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isAdmin = await checkRole("admin");

  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="overflow-x-hidden">
        <Providers>
          <header className="fixed top-0 right-0 left-0 z-50 flex h-16 w-full items-center justify-between bg-black/10 px-3 backdrop-blur-sm sm:px-4">
            {/* Left side - Navigation */}
            <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-3 md:gap-6">
              <SignedIn>
                {isAdmin ? <AdminNavigation /> : <UserNavigation />}
              </SignedIn>
              <SignedOut>
                <GuestNavigation />
              </SignedOut>
            </div>

            {/* Right side - Auth buttons */}
            <div className="flex flex-shrink-0 items-center justify-end gap-1 sm:gap-2 md:gap-4">
              {/* Show admin badge if user is admin */}
              {isAdmin && (
                <span className="hidden rounded-full bg-red-500/20 px-2 py-1 text-xs font-semibold text-red-200 backdrop-blur-sm sm:inline-block sm:px-3">
                  Admin
                </span>
              )}
              <SignedOut>
                <div className="block">
                  <SignInButton>
                    <button className="px-2 py-1 text-sm text-black hover:text-gray-300">
                      Sign In
                    </button>
                  </SignInButton>
                </div>
                <SignUpButton>
                  <button className="h-8 cursor-pointer rounded-full bg-white px-3 text-xs font-medium text-black hover:bg-gray-100 sm:h-9 sm:px-4 sm:text-sm">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}

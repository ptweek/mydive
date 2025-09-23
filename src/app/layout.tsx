import "mydive/styles/globals.css";
import { type Metadata } from "next";
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
      <body>
        <Providers>
          <header className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between bg-black/10 px-4 backdrop-blur-sm">
            <div className="flex items-center gap-6">
              <SignedIn>
                {isAdmin ? <AdminNavigation /> : <UserNavigation />}
              </SignedIn>
              <SignedOut>
                <GuestNavigation />
              </SignedOut>
            </div>
            <div className="flex items-center justify-end gap-4">
              {/* Show admin badge if user is admin */}
              {isAdmin && (
                <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-200 backdrop-blur-sm">
                  Admin
                </span>
              )}
              <SignedOut>
                <SignInButton />
                <SignUpButton>
                  <button className="text-ceramic-white h-10 cursor-pointer rounded-full bg-white px-4 text-sm font-medium sm:h-12 sm:px-5 sm:text-base">
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

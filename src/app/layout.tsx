import "mydive/styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { type Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MyDive Skydiving",
  description: "Private Skydiving. Anywhere.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <Providers>
          <header className="fixed top-0 right-0 z-50 flex h-16 items-center justify-end gap-4 p-4">
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
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}

"use client";

import { NextUIProvider } from "@nextui-org/react";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "mydive/trpc/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <TRPCReactProvider>
        <NextUIProvider>{children}</NextUIProvider>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}

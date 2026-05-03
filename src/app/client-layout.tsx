"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { RecordsProvider } from "./providers";

const PUBLIC = ["/login", "/signup", "/share", "/invite"];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "?"));

  useEffect(() => {
    if (!isLoading && !user && !isPublic) {
      router.replace("/login");
    }
  }, [user, isLoading, isPublic, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-accent" />
      </div>
    );
  }

  if (!user && !isPublic) return null;
  if (isPublic) return <>{children}</>;
  return <RecordsProvider>{children}</RecordsProvider>;
}

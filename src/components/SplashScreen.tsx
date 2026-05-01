"use client";

import { useEffect } from "react";
import { AikiLogo } from "./AikiLogo";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F0E9]">
      <div className="animate-[fadeIn_0.6s_ease]">
        <AikiLogo size="lg" />
      </div>
    </div>
  );
}

"use client";
import { useEffect } from "react";
export function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(), 1600);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F6F1E8]">
      <img src="/aiki-splash.svg" style={{ width: 520 }} alt="스플래시" />
    </div>
  );
}

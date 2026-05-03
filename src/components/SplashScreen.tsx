"use client";
import { useEffect, useState } from "react";
export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-[#F7F4EE]">
        <img src="/aiki-splash.svg" className="w-[160px]" />
      </div>
    );
  }
  return <>{children}</>;
}

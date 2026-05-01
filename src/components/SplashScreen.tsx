"use client";

import { useEffect } from "react";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2300);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="aiki-splash fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-[#F6F1E8]">
      <div className="aiki-splash-glow" />
      <div className="aiki-splash-hill aiki-splash-hill-left" />
      <div className="aiki-splash-hill aiki-splash-hill-right" />

      <div className="relative flex flex-col items-center text-center">
        <div className="aiki-splash-orb">
          <div className="aiki-splash-mark-wrap">
            <img
              src="/aiki-logo.png"
              alt="아이키 로고"
              className="aiki-splash-mark h-[150px] w-[150px] rounded-full object-contain shadow-[0_18px_38px_rgba(138,124,102,0.14)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

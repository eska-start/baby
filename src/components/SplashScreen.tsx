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
            <svg viewBox="0 0 120 120" className="aiki-splash-mark" aria-hidden="true">
              <path className="aiki-splash-stem-left" d="M62 100C42 84 30 65 29 42" fill="none" stroke="#8AA56F" strokeWidth="9" strokeLinecap="round" />
              <path className="aiki-splash-stem-right" d="M61 99C76 80 83 59 78 36" fill="none" stroke="#8AA56F" strokeWidth="9" strokeLinecap="round" />
              <path className="aiki-splash-leaf-left" d="M55 54C39 39 29 27 22 14C39 17 52 28 61 43" fill="#B9C68D" />
              <path className="aiki-splash-leaf-right" d="M67 50C79 31 94 20 110 17C103 34 89 47 70 57" fill="#A6B87A" />
              <path className="aiki-splash-ground" d="M58 66C47 56 37 51 25 50C31 64 43 72 58 72" fill="#D8CFA7" />
              <circle className="aiki-splash-dot" cx="77" cy="17" r="6" fill="#F2AF79" />
            </svg>
          </div>
        </div>

        <div className="aiki-splash-title font-serif font-semibold tracking-[-0.04em] text-[#8F9873]">아이키</div>
        <div className="aiki-splash-subtitle text-[#9A8F83]">데이터로 확인하는 우리 아이의 성장</div>
      </div>
    </div>
  );
}

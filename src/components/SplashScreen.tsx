"use client";

import { useEffect, useState } from "react";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => onDone(), 2300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F6F1E8]">
      <div
        className={`transition-all duration-700 ease-out flex flex-col items-center ${phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <img
          src="/aiki-logo.png"
          alt="아이키 로고"
          className={`rounded-full transition-all duration-700 ${phase === 2 ? "scale-105" : "scale-90"}`}
          style={{ width: 140, height: 140 }}
        />

        {phase >= 2 && (
          <div className="mt-6 text-center transition-opacity duration-700 opacity-100">
            <div className="text-[36px] font-semibold text-[#8F9873]">아이키</div>
            <div className="mt-2 text-[14px] text-[#9A8F83]">데이터로 확인하는 우리 아이의 성장</div>
          </div>
        )}
      </div>
    </div>
  );
}

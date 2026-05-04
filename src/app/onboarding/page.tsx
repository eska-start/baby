"use client";

import { useRouter } from "next/navigation";
import { AikiLogo } from "@/components/AikiLogo";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F0E9] px-6 text-center">
      <AikiLogo size="lg" />

      <div className="mt-10 w-full max-w-sm space-y-4">
        <div className="rounded-[18px] bg-white p-4 shadow">
          <div className="text-[15px] font-semibold">성장 기록</div>
          <div className="text-[13px] text-[#9A8F83]">키, 몸무게를 간편하게 기록</div>
        </div>

        <div className="rounded-[18px] bg-white p-4 shadow">
          <div className="text-[15px] font-semibold">AI 문서 인식</div>
          <div className="text-[13px] text-[#9A8F83]">검진지를 자동 분석</div>
        </div>

        <div className="rounded-[18px] bg-white p-4 shadow">
          <div className="text-[15px] font-semibold">그래프 분석</div>
          <div className="text-[13px] text-[#9A8F83]">성장 추이를 한눈에</div>
        </div>
      </div>

      <button
        onClick={() => router.push("/settings")}
        className="mt-10 w-full max-w-sm rounded-[20px] bg-[#E58A61] py-4 text-white font-bold"
      >
        시작하기
      </button>
    </div>
  );
}

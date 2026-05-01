"use client";

import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm rounded-[22px] border border-line bg-card p-6 text-center shadow-soft">
        <h1 className="font-serif text-2xl text-ink">회원가입 안내</h1>
        <p className="mt-2 text-sm text-ink-mute">이 서비스는 Firebase Google 로그인만 지원합니다.</p>
        <button onClick={() => router.replace('/login')} className="mt-4 w-full rounded-[12px] bg-ink py-3 text-white">로그인 페이지로 이동</button>
      </div>
    </div>
  );
}

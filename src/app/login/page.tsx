"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider";

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const result = await loginWithGoogle();
    if (result.ok) router.replace("/");
    else {
      setError(result.error ?? "로그인 중 오류가 발생했어요.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm rounded-[22px] border border-line bg-card p-6 shadow-soft">
        <h1 className="mb-2 text-center font-serif text-[30px] font-semibold text-ink">아이키</h1>
        <p className="mb-6 text-center text-[13px] text-ink-mute">구글 계정으로 로그인해서 성장기록을 저장하세요</p>
        {error && <div className="mb-3 rounded-[10px] bg-red-50 px-4 py-2.5 text-[12px] text-red-500">{error}</div>}
        <button type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full rounded-[12px] bg-ink py-3.5 text-[14px] font-semibold text-white disabled:opacity-60">{loading ? "로그인 중..." : "Google로 로그인"}</button>
      </div>
    </div>
  );
}

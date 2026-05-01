"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider";

export default function LoginPage() {
  const { user, isLoading, loginWithGoogle, loginWithEmail } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isLoading && user) router.replace("/");
  }, [isLoading, user, router]);

  const handleEmailLogin = async () => {
    setLoading(true);
    setError("");
    const result = await loginWithEmail(email.trim(), password);
    if (!result.ok) {
      setError(result.error ?? "로그인 중 오류가 발생했어요.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const result = await loginWithGoogle();
    if (!result.ok) {
      setError(result.error ?? "로그인 중 오류가 발생했어요.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f1ec] p-4">
      <div className="w-full max-w-md rounded-[36px] border border-[#ece7df] bg-[#faf8f4] p-7 shadow-soft">
        <h1 className="mt-8 text-center font-serif text-[56px] font-semibold tracking-tight text-[#A6A686]">아이키</h1>
        <p className="mb-8 mt-3 text-center text-[16px] text-[#9f8f7f]">데이터로 확인하는 우리 아이의 성장</p>

        {error && <div className="mb-3 rounded-[10px] bg-red-50 px-4 py-2.5 text-[12px] text-red-500">{error}</div>}

        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="이메일 주소" className="mb-3 w-full rounded-[18px] border border-[#e5e0d7] bg-white px-5 py-4 text-[20px] outline-none" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="비밀번호" className="mb-6 w-full rounded-[18px] border border-[#e5e0d7] bg-white px-5 py-4 text-[20px] outline-none" />

        <button type="button" onClick={handleEmailLogin} disabled={loading} className="w-full rounded-[20px] bg-[#eba17f] py-4 text-[20px] font-semibold text-white disabled:opacity-60">{loading ? "로그인 중..." : "로그인"}</button>

        <div className="my-6 flex items-center gap-3 text-[#b4a79b]"><div className="h-px flex-1 bg-[#e4ddd2]" /><span>또는</span><div className="h-px flex-1 bg-[#e4ddd2]" /></div>

        <button type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full rounded-[18px] border border-[#e5e0d7] bg-white py-4 text-[20px] font-medium text-[#44392f] disabled:opacity-60">구글로 로그인</button>

        <div className="mt-8 text-center text-[16px] text-[#9f8f7f]">계정이 없으신가요? <Link href="/signup" className="font-semibold text-[#e18a63]">회원가입</Link></div>
      </div>
    </div>
  );
}

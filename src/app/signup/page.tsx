"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider";

export default function SignupPage() {
  const { user, isLoading, signupWithEmail, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) router.replace("/");
  }, [isLoading, user, router]);

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    const result = await signupWithEmail(email.trim(), password, name.trim());
    if (!result.ok) {
      setError(result.error ?? "회원가입 중 오류가 발생했어요.");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    const result = await loginWithGoogle();
    if (!result.ok) {
      setError(result.error ?? "구글 회원가입 중 오류가 발생했어요.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f1ec] p-4">
      <div className="w-full max-w-md rounded-[36px] border border-[#ece7df] bg-[#faf8f4] p-7 shadow-soft">
        <h1 className="mt-8 text-center font-serif text-[48px] font-semibold tracking-tight text-[#A6A686]">회원가입</h1>
        <p className="mb-8 mt-3 text-center text-[16px] text-[#9f8f7f]">이메일 또는 구글로 시작하세요</p>

        {error && <div className="mb-3 rounded-[10px] bg-red-50 px-4 py-2.5 text-[12px] text-red-500">{error}</div>}

        <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="이름(선택)" className="mb-3 w-full rounded-[18px] border border-[#e5e0d7] bg-white px-5 py-4 text-[20px] outline-none" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="이메일 주소" className="mb-3 w-full rounded-[18px] border border-[#e5e0d7] bg-white px-5 py-4 text-[20px] outline-none" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="비밀번호 (6자 이상)" className="mb-6 w-full rounded-[18px] border border-[#e5e0d7] bg-white px-5 py-4 text-[20px] outline-none" />

        <button type="button" onClick={handleSignup} disabled={loading} className="w-full rounded-[20px] bg-[#eba17f] py-4 text-[20px] font-semibold text-white disabled:opacity-60">{loading ? "가입 중..." : "회원가입"}</button>

        <div className="my-6 flex items-center gap-3 text-[#b4a79b]"><div className="h-px flex-1 bg-[#e4ddd2]" /><span>또는</span><div className="h-px flex-1 bg-[#e4ddd2]" /></div>

        <button type="button" onClick={handleGoogleSignup} disabled={loading} className="w-full rounded-[18px] border border-[#e5e0d7] bg-white py-4 text-[20px] font-medium text-[#44392f] disabled:opacity-60">구글로 회원가입</button>

        <div className="mt-8 text-center text-[16px] text-[#9f8f7f]">이미 계정이 있으신가요? <Link href="/login" className="font-semibold text-[#e18a63]">로그인</Link></div>
      </div>
    </div>
  );
}

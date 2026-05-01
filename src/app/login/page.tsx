"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider";
import { AikiLogo } from "@/components/AikiLogo";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M4.5 7.5h15v9h-15v-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m5 8 7 5 7-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M7 10h10v9H7v-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 10V7.8C9 5.7 10.3 4 12 4s3 1.7 3 3.8V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F4F0E9] px-5 py-8">
      <div className="pointer-events-none absolute -left-20 top-12 h-64 w-64 rounded-full bg-[#DDE5C8]/55 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[#EFC5A9]/45 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[38%] rounded-t-[48%] bg-[#ECE7DC]" />

      <div className="relative w-full max-w-[390px] rounded-[34px] border border-white/70 bg-[#FBF8F1]/90 px-7 pb-7 pt-8 shadow-[0_26px_70px_rgba(103,88,70,0.18)] backdrop-blur">
        <AikiLogo size="lg" />

        {error && <div className="mb-4 rounded-[14px] bg-red-50 px-4 py-3 text-[12px] leading-relaxed text-red-500">{error}</div>}

        <div className="space-y-3">
          <label className="flex items-center gap-3 rounded-[18px] border border-[#E7DED1] bg-white px-4 py-3.5 text-[#AAA093] shadow-[0_8px_20px_rgba(127,112,92,0.06)]">
            <MailIcon />
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="이메일 주소" className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#4E4438] outline-none placeholder:text-[#B4A99B]" />
          </label>

          <label className="flex items-center gap-3 rounded-[18px] border border-[#E7DED1] bg-white px-4 py-3.5 text-[#AAA093] shadow-[0_8px_20px_rgba(127,112,92,0.06)]">
            <LockIcon />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="비밀번호" className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#4E4438] outline-none placeholder:text-[#B4A99B]" />
          </label>
        </div>

        <button type="button" onClick={handleEmailLogin} disabled={loading} className="mt-5 w-full rounded-[20px] bg-gradient-to-r from-[#F0AF89] to-[#E58A61] py-4 text-[17px] font-bold text-white shadow-[0_14px_28px_rgba(219,132,91,0.28)] transition active:scale-[0.99] disabled:opacity-60">
          {loading ? "로그인 중..." : "로그인"}
        </button>

        <div className="my-6 flex items-center gap-3 text-[13px] font-medium text-[#B2A797]"><div className="h-px flex-1 bg-[#E4DCCE]" /><span>또는</span><div className="h-px flex-1 bg-[#E4DCCE]" /></div>

        <button type="button" onClick={handleGoogleLogin} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-[18px] border border-[#E7DED1] bg-white py-4 text-[15px] font-bold text-[#4B4136] shadow-[0_10px_24px_rgba(127,112,92,0.08)] transition active:scale-[0.99] disabled:opacity-60">
          <GoogleIcon />
          구글로 로그인
        </button>

        <p className="mt-7 text-center text-[14px] font-medium text-[#958A7D]">
          계정이 없으신가요? <Link href="/signup" className="font-bold text-[#E08961]">회원가입</Link>
        </p>
      </div>
    </div>
  );
}

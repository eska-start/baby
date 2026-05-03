"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/auth-provider";

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

function LoginForm() {
  const { user, isLoading, loginWithGoogle, loginWithEmail } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isLoading && user) router.replace(next);
  }, [isLoading, user, router, next]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F4F0E9] px-5 py-8">
      <div className="relative w-full max-w-[390px] rounded-[34px] border border-white/70 bg-[#FBF8F1]/90 px-7 pb-7 pt-8 shadow-[0_26px_70px_rgba(103,88,70,0.18)] backdrop-blur">
        <div className="flex justify-center mb-6">
          <img src="/aiki-logo.svg" style={{ width: 135 }} />
        </div>

        <input placeholder="이메일" className="mb-3 w-full p-3 rounded" />
        <input placeholder="비밀번호" className="mb-4 w-full p-3 rounded" />

        <button className="w-full bg-black text-white py-3 rounded">로그인</button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

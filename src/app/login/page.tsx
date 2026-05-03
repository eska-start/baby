"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/auth-provider";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F0E9] px-5 py-8">
      <img src="/aiki-splash-login.svg" className="mb-8 w-[200px]" />

      <div className="w-full max-w-[390px]">
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

"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(email, password);
    if (result.ok) router.replace("/");
    else {
      setError(result.error ?? "오류가 발생했어요.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError("NEXT_PUBLIC_GOOGLE_CLIENT_ID 환경변수가 없어 구글 로그인을 사용할 수 없어요.");
      return;
    }

    if (!googleScriptLoaded || !window.google) {
      setError("구글 로그인 스크립트 로딩이 아직 완료되지 않았어요. 잠시 후 다시 시도해주세요.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        const result = await loginWithGoogle(credential);
        if (result.ok) router.replace("/");
        else setError(result.error ?? "구글 로그인 중 오류가 발생했어요.");
      },
    });
    window.google.accounts.id.prompt();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => setGoogleScriptLoaded(true)} />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-serif text-[36px] font-semibold text-ink">아이키</div>
          <div className="mt-1 text-[13px] text-ink-mute">아이의 성장을 따뜻하게 기록해요</div>
        </div>
        <div className="rounded-[22px] border border-line bg-card p-6 shadow-soft">
          <div className="mb-5 font-serif text-[20px] font-medium text-ink">로그인</div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-[12px] border border-line bg-bg px-4 py-3" placeholder="example@email.com"/>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-[12px] border border-line bg-bg px-4 py-3" placeholder="비밀번호 입력"/>
            {error && <div className="rounded-[10px] bg-red-50 px-4 py-2.5 text-[12px] text-red-500">{error}</div>}
            <button type="submit" disabled={loading} className="w-full rounded-[12px] bg-ink py-3.5 text-[14px] font-semibold text-white">{loading ? "로그인 중..." : "로그인"}</button>
          </form>
          <button type="button" onClick={handleGoogleLogin} disabled={!googleScriptLoaded} className="mt-3 w-full rounded-[12px] border border-line bg-white py-3 text-[14px] font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-60">Google로 로그인</button>
        </div>
        <div className="mt-5 text-center text-[13px] text-ink-mute">계정이 없으신가요? <Link href="/signup" className="font-semibold text-accent">회원가입</Link></div>
      </div>
    </div>
  );
}

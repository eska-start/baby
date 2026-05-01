"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = login(email, password);
    if (result.ok) {
      router.replace("/");
    } else {
      setError(result.error ?? "오류가 발생했어요.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-serif text-[36px] font-semibold text-ink">아이키</div>
          <div className="mt-1 text-[13px] text-ink-mute">아이의 성장을 따뜻하게 기록해요</div>
        </div>

        <div className="rounded-[22px] border border-line bg-card p-6 shadow-soft">
          <div className="mb-5 font-serif text-[20px] font-medium text-ink">로그인</div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="rounded-[12px] border border-line bg-bg px-4 py-3">
              <div className="mb-1 text-[10px] tracking-[0.5px] text-ink-mute">이메일</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
                className="w-full border-none bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-mute/50"
              />
            </div>
            <div className="rounded-[12px] border border-line bg-bg px-4 py-3">
              <div className="mb-1 text-[10px] tracking-[0.5px] text-ink-mute">비밀번호</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="비밀번호 입력"
                className="w-full border-none bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-mute/50"
              />
            </div>
            {error && (
              <div className="rounded-[10px] bg-red-50 px-4 py-2.5 text-[12px] text-red-500">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[12px] bg-ink py-3.5 text-[14px] font-semibold text-white transition hover:bg-black disabled:opacity-50"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </div>

        <div className="mt-5 text-center text-[13px] text-ink-mute">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-semibold text-accent">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}

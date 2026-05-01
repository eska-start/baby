"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("비밀번호가 일치하지 않아요."); return; }
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 해요."); return; }
    setLoading(true);
    setError("");
    const result = await signup(name.trim(), email, password);
    if (result.ok) {
      router.replace("/settings");
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
          <div className="mb-5 font-serif text-[20px] font-medium text-ink">회원가입</div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="rounded-[12px] border border-line bg-bg px-4 py-3">
              <div className="mb-1 text-[10px] tracking-[0.5px] text-ink-mute">이름 (보호자)</div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="홍길동"
                className="w-full border-none bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-mute/50"
              />
            </div>
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
              <div className="mb-1 text-[10px] tracking-[0.5px] text-ink-mute">비밀번호 (6자 이상)</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="비밀번호 입력"
                className="w-full border-none bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-mute/50"
              />
            </div>
            <div className="rounded-[12px] border border-line bg-bg px-4 py-3">
              <div className="mb-1 text-[10px] tracking-[0.5px] text-ink-mute">비밀번호 확인</div>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="비밀번호 재입력"
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
              {loading ? "가입 중..." : "가입하기"}
            </button>
          </form>
          <div className="mt-3 rounded-[10px] bg-accent-soft px-4 py-2.5 text-[11px] text-ink-soft">
            가입 후 설정 페이지에서 아이 정보를 먼저 등록해주세요.
          </div>
        </div>

        <div className="mt-5 text-center text-[13px] text-ink-mute">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-semibold text-accent">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}

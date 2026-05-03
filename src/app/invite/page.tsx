"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/app/auth-provider";
import { Icon } from "@/components/Icon";

type InviteData = {
  childId: string;
  childName: string;
  createdBy: string;
  expiresAt: string;
};

type Status = "loading" | "valid" | "expired" | "invalid" | "joining" | "joined" | "already";

function InviteView() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const code = params.get("code") ?? "";

  const [status, setStatus] = useState<Status>("loading");
  const [invite, setInvite] = useState<InviteData | null>(null);

  useEffect(() => {
    if (!code) { setStatus("invalid"); return; }
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "invites", code));
        if (!snap.exists()) { setStatus("invalid"); return; }
        const data = snap.data() as InviteData;
        if (new Date(data.expiresAt) < new Date()) { setStatus("expired"); return; }
        setInvite(data);
        setStatus("valid");
      } catch {
        setStatus("invalid");
      }
    };
    void load();
  }, [code]);

  const join = async () => {
    if (!invite || !user) return;
    setStatus("joining");
    try {
      const childRef = doc(db, "children", invite.childId);
      const childSnap = await getDoc(childRef);
      if (!childSnap.exists()) { setStatus("invalid"); return; }
      const data = childSnap.data() as { memberIds?: string[] };
      const memberIds: string[] = Array.isArray(data.memberIds) ? data.memberIds : [];

      if (memberIds.includes(user.id)) {
        setStatus("already");
        return;
      }

      await setDoc(childRef, { memberIds: [...memberIds, user.id] }, { merge: true });
      await setDoc(doc(db, "children", invite.childId, "inviteLog", user.id), {
        joinedAt: serverTimestamp(),
        code,
      });
      setStatus("joined");
      setTimeout(() => router.replace("/"), 2000);
    } catch {
      setStatus("valid");
    }
  };

  // Not logged in → send to login with returnUrl
  if (status === "valid" && !user) {
    return (
      <Wrapper>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft mx-auto mb-4">
          <Icon name="flower" size={22} color="#D77B50" />
        </div>
        <div className="font-serif text-[22px] font-medium text-ink">
          {invite?.childName ?? "아이"}의 기록에 초대됐어요
        </div>
        <p className="mt-2 text-[13px] text-ink-mute leading-[1.6]">
          로그인하면 함께 성장을 기록할 수 있어요.
        </p>
        <Link
          href={`/login?next=${encodeURIComponent(`/invite?code=${code}`)}`}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-ink py-3.5 text-[14px] font-semibold text-white"
        >
          로그인하고 참여하기
        </Link>
        <Link href="/signup" className="mt-3 block text-center text-[12px] text-ink-mute underline">
          아직 계정이 없다면 무료 가입
        </Link>
      </Wrapper>
    );
  }

  if (status === "loading") {
    return (
      <Wrapper>
        <div className="flex justify-center py-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-accent" />
        </div>
        <p className="mt-3 text-center text-[13px] text-ink-mute">초대 정보를 확인하고 있어요...</p>
      </Wrapper>
    );
  }

  if (status === "invalid" || status === "expired") {
    return (
      <Wrapper>
        <div className="text-center text-3xl mb-3">{status === "expired" ? "⏰" : "🔗"}</div>
        <div className="font-serif text-[20px] font-medium text-ink text-center">
          {status === "expired" ? "만료된 초대 링크예요" : "올바르지 않은 초대 링크예요"}
        </div>
        <p className="mt-2 text-[13px] text-ink-mute text-center">
          {status === "expired" ? "초대한 분에게 새 링크를 요청해주세요." : "링크를 다시 확인해주세요."}
        </p>
        <Link href="/" className="mt-6 inline-flex w-full items-center justify-center rounded-[14px] border border-line bg-card py-3 text-[13px] font-medium text-ink">
          홈으로 돌아가기
        </Link>
      </Wrapper>
    );
  }

  if (status === "joined") {
    return (
      <Wrapper>
        <div className="text-center text-3xl mb-3">🎉</div>
        <div className="font-serif text-[22px] font-medium text-ink text-center">참여 완료!</div>
        <p className="mt-2 text-[13px] text-ink-mute text-center">
          이제 {invite?.childName}의 기록을 함께 관리할 수 있어요.
        </p>
        <p className="mt-3 text-[11px] text-ink-mute text-center">잠시 후 홈으로 이동합니다...</p>
      </Wrapper>
    );
  }

  if (status === "already") {
    return (
      <Wrapper>
        <div className="text-center text-3xl mb-3">✅</div>
        <div className="font-serif text-[20px] font-medium text-ink text-center">이미 참여 중이에요</div>
        <p className="mt-2 text-[13px] text-ink-mute text-center">
          {invite?.childName}의 기록에 이미 접근 권한이 있어요.
        </p>
        <Link href="/" className="mt-6 inline-flex w-full items-center justify-center rounded-[14px] bg-ink py-3.5 text-[14px] font-semibold text-white">
          홈으로 이동
        </Link>
      </Wrapper>
    );
  }

  // valid + logged in
  return (
    <Wrapper>
      <div className="flex h-14 w-14 items-center justify-center rounded-full mx-auto mb-4" style={{ background: "#F4B393" }}>
        <Icon name="flower" size={24} color="#1F1A14" />
      </div>
      <div className="font-serif text-[22px] font-medium text-ink text-center">
        {invite?.childName}의 기록에 초대됐어요
      </div>
      <p className="mt-2 text-[13px] text-ink-mute text-center leading-[1.6]">
        참여하면 성장 기록 · 예방접종 일정을 함께 관리할 수 있어요.
      </p>

      <div className="mt-5 rounded-[14px] bg-bg px-4 py-3.5 text-[12px] text-ink-soft">
        <div className="flex items-center gap-2 mb-1.5">
          <Icon name="check" size={12} color="#5C7A5C" strokeWidth={2.4} />
          <span>성장 기록 조회 및 입력</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <Icon name="check" size={12} color="#5C7A5C" strokeWidth={2.4} />
          <span>예방접종 일정 확인 및 완료 처리</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="check" size={12} color="#5C7A5C" strokeWidth={2.4} />
          <span>AI 기록 입력</span>
        </div>
      </div>

      <button
        onClick={join}
        disabled={status === "joining"}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-ink py-3.5 text-[14px] font-semibold text-white disabled:opacity-60"
      >
        {status === "joining" ? (
          <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> 참여 중...</>
        ) : (
          `${invite?.childName}의 기록 함께하기`
        )}
      </button>

      <p className="mt-3 text-center text-[11px] text-ink-mute">
        초대 만료: {invite ? new Date(invite.expiresAt).toLocaleDateString("ko-KR") : ""}
      </p>
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center font-serif text-[18px] font-semibold text-ink">아이키</div>
        <div className="rounded-[22px] border border-line bg-card p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-accent" />
      </div>
    }>
      <InviteView />
    </Suspense>
  );
}

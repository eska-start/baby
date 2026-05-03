"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar, MobileTopBar, PageWrap, BottomNav } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useRecords } from "@/app/providers";
import { useAuth } from "@/app/auth-provider";
import { calcAgeLabel } from "@/lib/data";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Mode = { type: "list" } | { type: "edit"; id: string } | { type: "add" };

function genCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function ChildForm({ initial, onSave, onCancel, isAdd }: {
  initial: { name: string; birth: string; gender: "여" | "남" };
  onSave: (v: { name: string; birth: string; gender: "여" | "남" }) => void;
  onCancel: () => void;
  isAdd: boolean;
}) {
  const [name, setName] = useState(initial.name);
  const [birth, setBirth] = useState(initial.birth);
  const [gender, setGender] = useState<"여" | "남">(initial.gender);
  const ageLabel = birth ? calcAgeLabel(birth) : "";

  return (
    <div className="max-w-lg space-y-3">
      <div className="rounded-[20px] bg-ink p-5 text-white flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "#F4B393" }}>
          <Icon name="flower" size={22} color="#1F1A14" />
        </div>
        <div>
          <div className="font-serif text-[22px] font-medium">{name || "이름 없음"}</div>
          <div className="text-[12px] text-white/60">{ageLabel ? `${ageLabel} · ${gender}아` : "생년월일을 입력하세요"}</div>
        </div>
      </div>
      <div className="rounded-[18px] border border-line bg-card px-5 py-5">
        <label className="block text-[11px] tracking-[0.5px] text-ink-mute mb-2">이름</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="아이 이름 입력" className="w-full border-none bg-transparent font-serif text-[24px] font-medium text-ink outline-none placeholder:text-ink-mute" />
      </div>
      <div className="rounded-[18px] border border-line bg-card px-5 py-5">
        <label className="block text-[11px] tracking-[0.5px] text-ink-mute mb-2">생년월일</label>
        <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} className="w-full border-none bg-transparent text-[18px] font-medium text-ink outline-none" />
      </div>
      <div className="rounded-[18px] border border-line bg-card px-5 py-5">
        <label className="block text-[11px] tracking-[0.5px] text-ink-mute mb-3">성별</label>
        <div className="flex gap-2">
          {(["여", "남"] as const).map((g) => (
            <button key={g} onClick={() => setGender(g)} className={`flex-1 rounded-[12px] py-3 text-[14px] font-semibold transition ${gender === g ? "bg-ink text-white" : "border border-line bg-bg text-ink-soft"}`}>
              {g === "여" ? "여아" : "남아"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 rounded-[14px] border border-line bg-bg py-3.5 text-[13px] font-medium text-ink">취소</button>
        <button onClick={() => { if (name.trim() && birth) onSave({ name: name.trim(), birth, gender }); }} className="flex-[2] rounded-[14px] bg-ink py-3.5 text-[14px] font-semibold text-white">
          {isAdd ? "추가하기" : "저장하기"}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { children, deletedChildren, activeChild, setActiveChild, addChild, updateChild, deleteChild, restoreChild, records } = useRecords();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>({ type: "list" });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const daysUntilPermanent = (deletedAt: string) => {
    const remaining = 30 - Math.floor((Date.now() - new Date(deletedAt).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, remaining);
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // 성장 기록 공유 (read-only, base64 URL)
  const shareGrowth = () => {
    if (!activeChild) return;
    const payload = {
      name: activeChild.name,
      birth: activeChild.birth,
      gender: activeChild.gender,
      records,
      sharedAt: new Date().toISOString(),
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
    const url = `${window.location.origin}/share?d=${encoded}`;
    navigator.clipboard.writeText(url).then(() => showToast("성장 기록 링크가 복사됐어요!"));
  };

  // 함께 기록하기 초대 링크 (Firestore invite)
  const createInviteLink = async () => {
    if (!activeChild || !user || inviteLoading) return;
    setInviteLoading(true);
    try {
      const code = genCode();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일
      await setDoc(doc(db, "invites", code), {
        childId: activeChild.id,
        childName: activeChild.name,
        createdBy: user.id,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt.toISOString(),
      });
      const url = `${window.location.origin}/invite?code=${code}`;
      try {
        await navigator.clipboard.writeText(url);
        showToast("초대 링크가 복사됐어요! (7일간 유효)");
      } catch {
        setInviteUrl(url);
      }
    } catch (err) {
      console.error("createInviteLink failed:", err);
      showToast("초대 링크 생성에 실패했어요. Firestore 규칙을 확인해주세요.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("ai-gyeol-active");
    router.replace("/login");
  };

  const titleMap = { list: "아이 관리", edit: "아이 정보 수정", add: "새 아이 추가" };

  return (
    <>
      <TopBar />
      <MobileTopBar back={mode.type !== "list"} title={titleMap[mode.type]} />
      {toast && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-[12px] bg-ink px-5 py-3 text-[13px] font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
      {inviteUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setInviteUrl(null)}>
          <div className="w-full max-w-sm rounded-[20px] bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-1 text-[13px] font-semibold text-ink">초대 링크 생성됨</div>
            <p className="mb-3 text-[12px] text-ink-mute">클립보드 접근이 거부됐어요. 아래 링크를 직접 복사해 공유해주세요.</p>
            <div className="break-all rounded-[12px] border border-line bg-bg px-3 py-3 font-mono text-[11px] text-ink select-all">{inviteUrl}</div>
            <button onClick={() => { navigator.clipboard.writeText(inviteUrl).then(() => { showToast("복사됐어요!"); setInviteUrl(null); }); }} className="mt-3 w-full rounded-[12px] bg-ink py-3 text-[13px] font-semibold text-white">복사하기</button>
            <button onClick={() => setInviteUrl(null)} className="mt-2 w-full py-2 text-[12px] text-ink-mute">닫기</button>
          </div>
        </div>
      )}
      <PageWrap>
        <div className="hidden md:flex items-end justify-between pt-8 pb-6">
          <div>
            <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">SETTINGS</div>
            <h1 className="font-serif text-[28px] font-medium text-ink">{titleMap[mode.type]}</h1>
          </div>
          {mode.type === "list" ? (
            <button onClick={() => setMode({ type: "add" })} className="inline-flex items-center gap-2 rounded-[12px] bg-ink px-5 py-3 text-[13px] font-semibold text-white">
              <Icon name="plus" size={14} color="#fff" /> 아이 추가
            </button>
          ) : (
            <button onClick={() => setMode({ type: "list" })} className="rounded-[12px] border border-line bg-card px-4 py-3 text-[13px] font-medium text-ink-soft">목록으로</button>
          )}
        </div>
        <div className="md:hidden px-2 pt-2 mb-5">
          <h1 className="font-serif text-[22px] font-medium text-ink">{titleMap[mode.type]}</h1>
        </div>

        {mode.type === "list" && (
          <div className="max-w-lg space-y-3">
            {/* Child list */}
            {children.map((child) => (
              <div key={child.id} className={`rounded-[18px] border bg-card px-5 py-4 transition ${child.id === activeChild?.id ? "border-ink" : "border-line"}`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveChild(child.id)} className="flex flex-1 items-center gap-3 text-left">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full shrink-0" style={{ background: "#F4B393" }}>
                      <Icon name="flower" size={16} color="#1F1A14" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold text-ink">{child.name}</span>
                        {child.id === activeChild?.id && <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold text-white">활성</span>}
                      </div>
                      <div className="text-[12px] text-ink-mute">{calcAgeLabel(child.birth)} · {child.gender}아</div>
                    </div>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setMode({ type: "edit", id: child.id })} className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-line bg-bg transition hover:bg-accent-soft">
                      <Icon name="edit" size={13} color="#8B8377" />
                    </button>
                    {children.length > 1 && (
                      confirmDeleteId === child.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => setConfirmDeleteId(null)} className="rounded-[6px] border border-line bg-bg px-2 py-1 text-[11px] text-ink-mute">취소</button>
                          <button onClick={() => { deleteChild(child.id); setConfirmDeleteId(null); showToast(`${child.name} 삭제됐어요`); }} className="rounded-[6px] bg-red-500 px-2 py-1 text-[11px] font-semibold text-white">삭제</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(child.id)} className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-line bg-bg transition hover:bg-red-50">
                          <Icon name="trash" size={13} color="#8B8377" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add child button (mobile) */}
            <button onClick={() => setMode({ type: "add" })} className="md:hidden flex w-full items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-line-strong bg-transparent py-4 text-[13px] font-semibold text-ink-mute transition hover:bg-bg">
              <Icon name="plus" size={16} color="#8B8377" /> 아이 추가
            </button>

            {/* Share section */}
            {activeChild && (
              <div className="rounded-[18px] border border-line bg-card px-5 py-4 space-y-3">
                <div className="text-[11px] tracking-[0.5px] text-ink-mute">공유 · {activeChild.name}</div>

                {/* Growth share (read-only) */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-ink">성장 기록 공유</div>
                    <div className="text-[11px] text-ink-mute">성장 차트를 링크로 보여줘요 (읽기 전용)</div>
                  </div>
                  <button onClick={shareGrowth} className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-bg px-3 py-2 text-[12px] font-semibold text-ink transition hover:bg-card">
                    <Icon name="arrow-right" size={12} color="#1F1A14" /> 복사
                  </button>
                </div>

                <div className="h-px bg-line" />

                {/* Invite (caregiver) */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-ink">함께 기록하기</div>
                    <div className="text-[11px] text-ink-mute">배우자·가족이 직접 기록할 수 있어요 (7일 유효)</div>
                  </div>
                  <button onClick={createInviteLink} disabled={inviteLoading} className="inline-flex items-center gap-1.5 rounded-[10px] border border-accent/30 bg-accent-soft px-3 py-2 text-[12px] font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-60">
                    {inviteLoading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent/30 border-t-accent" /> : <Icon name="plus" size={12} color="currentColor" />} {inviteLoading ? "생성 중..." : "초대"}
                  </button>
                </div>

                <div className="rounded-[10px] bg-bg px-3 py-2.5 text-[11px] leading-[1.55] text-ink-mute">
                  초대받은 사람이 링크를 열고 로그인하면 {activeChild.name}의 기록에 접근할 수 있어요.
                </div>
              </div>
            )}

            {/* Deleted children (trash) */}
            {deletedChildren.length > 0 && (
              <div className="rounded-[18px] border border-line bg-card px-5 py-4 space-y-3">
                <div className="text-[11px] tracking-[0.5px] text-ink-mute">최근 삭제됨</div>
                {deletedChildren.map((child) => (
                  <div key={child.id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 shrink-0">
                      <Icon name="trash" size={13} color="#C26B5A" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-ink">{child.name}</div>
                      <div className="text-[11px] text-ink-mute">{daysUntilPermanent(child.deletedAt!)}일 후 영구 삭제</div>
                    </div>
                    <button onClick={() => { restoreChild(child.id); showToast(`${child.name} 복구됐어요`); }} className="rounded-[10px] border border-line bg-bg px-3 py-1.5 text-[12px] font-semibold text-ink transition hover:bg-card">
                      복구
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="rounded-[18px] border border-line bg-card px-5 py-4">
              <div className="text-[11px] tracking-[0.5px] text-ink-mute mb-2">현재 활성 아이 기록</div>
              <div className="ko-num font-serif text-[24px] font-medium text-ink">{records.length}</div>
              <div className="text-[11px] text-ink-mute">성장 기록</div>
            </div>

            {/* Logout */}
            <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-red-100 bg-red-50 py-4 text-[13px] font-semibold text-red-500 transition hover:bg-red-100">
              로그아웃
            </button>
          </div>
        )}

        {mode.type === "edit" && (() => {
          const child = children.find((c) => c.id === mode.id);
          if (!child) return null;
          return (
            <ChildForm
              initial={{ name: child.name, birth: child.birth, gender: child.gender }}
              onSave={(v) => { updateChild(mode.id, v); setMode({ type: "list" }); showToast("저장됐어요"); }}
              onCancel={() => setMode({ type: "list" })}
              isAdd={false}
            />
          );
        })()}

        {mode.type === "add" && (
          <ChildForm
            initial={{ name: "", birth: "", gender: "여" }}
            onSave={(v) => { addChild(v); setMode({ type: "list" }); showToast(`${v.name} 추가됐어요`); }}
            onCancel={() => setMode({ type: "list" })}
            isAdd
          />
        )}
      </PageWrap>
      <BottomNav />
    </>
  );
}

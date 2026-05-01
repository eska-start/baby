"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TopBar, MobileTopBar, PageWrap, BottomNav } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useRecords } from "@/app/providers";
import { calcAgeLabel } from "@/lib/data";

export default function SettingsPage() {
  const { profile, setProfile, records } = useRecords();
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [birth, setBirth] = useState(profile.birth);
  const [gender, setGender] = useState<"여" | "남">(profile.gender);

  const save = () => {
    if (!name.trim() || !birth) return;
    setProfile({ name: name.trim(), birth, gender });
    router.push("/");
  };

  const ageLabel = birth ? calcAgeLabel(birth) : "";

  return (
    <>
      <TopBar />
      <MobileTopBar back title="아이 정보" rightLabel="저장" onRight={save} />
      <PageWrap>
        <div className="hidden md:flex items-end justify-between pt-8 pb-6">
          <div>
            <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">SETTINGS</div>
            <h1 className="font-serif text-[28px] font-medium text-ink">아이 정보 설정</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="rounded-[12px] border border-line bg-card px-4 py-3 text-[13px] font-medium text-ink-soft">
              취소
            </Link>
            <button onClick={save} className="rounded-[12px] bg-ink px-5 py-3 text-[13px] font-semibold text-white">
              저장하기
            </button>
          </div>
        </div>

        <div className="md:hidden px-2 pt-2 mb-5">
          <h1 className="font-serif text-[22px] font-medium text-ink">아이 정보</h1>
          <p className="mt-1 text-[12px] text-ink-mute">이름과 생년월일을 입력해주세요.</p>
        </div>

        <div className="max-w-lg space-y-3">
          {/* Preview card */}
          <div className="rounded-[20px] bg-ink p-5 text-white flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "#F4B393" }}>
              <Icon name="flower" size={22} color="#1F1A14" />
            </div>
            <div>
              <div className="font-serif text-[22px] font-medium">{name || "이름 없음"}</div>
              <div className="text-[12px] text-white/60">
                {ageLabel ? `${ageLabel} · ${gender}아` : "생년월일을 입력하세요"}
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="rounded-[18px] border border-line bg-card px-5 py-5">
            <label className="block text-[11px] tracking-[0.5px] text-ink-mute mb-2">이름</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="아이 이름 입력"
              className="w-full border-none bg-transparent font-serif text-[24px] font-medium text-ink outline-none placeholder:text-ink-mute"
            />
          </div>

          {/* Birth */}
          <div className="rounded-[18px] border border-line bg-card px-5 py-5">
            <label className="block text-[11px] tracking-[0.5px] text-ink-mute mb-2">생년월일</label>
            <input
              type="date"
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
              className="w-full border-none bg-transparent text-[18px] font-medium text-ink outline-none"
            />
          </div>

          {/* Gender */}
          <div className="rounded-[18px] border border-line bg-card px-5 py-5">
            <label className="block text-[11px] tracking-[0.5px] text-ink-mute mb-3">성별</label>
            <div className="flex gap-2">
              {(["여", "남"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 rounded-[12px] py-3 text-[14px] font-semibold transition ${
                    gender === g ? "bg-ink text-white" : "border border-line bg-bg text-ink-soft"
                  }`}
                >
                  {g === "여" ? "여아" : "남아"}
                </button>
              ))}
            </div>
          </div>

          {/* Stats summary */}
          <div className="rounded-[18px] border border-line bg-card px-5 py-4">
            <div className="text-[11px] tracking-[0.5px] text-ink-mute mb-2">기록 현황</div>
            <div className="flex gap-6">
              <div>
                <div className="ko-num font-serif text-[24px] font-medium text-ink">{records.length}</div>
                <div className="text-[11px] text-ink-mute">성장 기록</div>
              </div>
            </div>
          </div>

          {/* Save button (mobile) */}
          <button
            onClick={save}
            className="md:hidden w-full rounded-[14px] bg-ink py-4 text-[14px] font-semibold text-white"
          >
            저장하기
          </button>
        </div>
      </PageWrap>
      <BottomNav />
    </>
  );
}

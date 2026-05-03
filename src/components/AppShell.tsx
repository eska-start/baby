"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { useRecords } from "@/app/providers";
import { calcAgeLabel } from "@/lib/data";
import { useState } from "react";

const NAV = [
  { href: "/", label: "홈", icon: "home" },
  { href: "/record", label: "기록", icon: "edit" },
  { href: "/growth", label: "성장 추이", icon: "chart" },
  { href: "/ai", label: "AI 분석", icon: "sparkle" },
  { href: "/vaccination", label: "예방접종", icon: "syringe" },
];

export function TopBar() {
  const pathname = usePathname();
  const { activeChild: profile } = useRecords();
  return (
    <header className="hidden md:flex sticky top-0 z-30 h-16 items-center gap-6 border-b border-line bg-card/90 px-8 backdrop-blur">
      <Link href="/" className="font-serif text-[19px] font-semibold tracking-tight text-ink">
        아이결
      </Link>
      <nav className="flex items-center gap-1">
        {NAV.map((it) => {
          const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`rounded-[10px] px-3.5 py-2 text-[13px] transition ${
                active ? "bg-bg font-semibold text-ink" : "text-ink-soft hover:text-ink"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex-1" />
      <Link
        href="/settings"
        className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-card text-ink transition hover:bg-bg"
        aria-label="설정"
      >
        <Icon name="settings" size={16} />
      </Link>
      <Link
        href="/settings"
        className="flex items-center gap-2 rounded-full border border-line bg-bg py-1.5 pl-1.5 pr-3.5"
      >
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ background: "#F4B393" }}
        >
          <Icon name="flower" size={13} color="#1F1A14" />
        </div>
        <span className="text-[13px] font-medium text-ink">{profile?.name}</span>
        <Icon name="chevron-down" size={13} color="#8B8377" />
      </Link>
    </header>
  );
}

export function MobileTopBar({
  title,
  back,
  rightLabel,
  onRight,
}: {
  title?: string;
  back?: boolean;
  rightLabel?: string;
  onRight?: () => void;
}) {
  return (
    <div className="flex md:hidden items-center justify-between px-6 pt-4 pb-2">
      {back ? (
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-card"
          aria-label="뒤로"
        >
          <Icon name="back" size={16} />
        </Link>
      ) : (
        <Link href="/" className="font-serif text-[18px] font-semibold text-ink">
          아이결
        </Link>
      )}
      {title && <span className="text-[14px] font-semibold text-ink">{title}</span>}
      {rightLabel ? (
        <button
          onClick={onRight}
          className="border-none bg-transparent text-[13px] font-semibold text-accent"
        >
          {rightLabel}
        </button>
      ) : (
        <Link
          href="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-card"
          aria-label="설정"
        >
          <Icon name="settings" size={16} />
        </Link>
      )}
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-30 px-5 pb-6 pt-3 bg-bg">
      <div className="flex justify-around rounded-[22px] border border-line bg-card px-2 py-2.5 shadow-soft">
        {NAV.map((it) => {
          const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 ${
                active ? "text-ink" : "text-ink-mute"
              }`}
            >
              <Icon name={it.icon} size={18} color={active ? "#1F1A14" : "#8B8377"} />
              <span className={`text-[10px] ${active ? "font-semibold" : "font-normal"}`}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function PageWrap({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-[1280px] px-4 pb-32 md:px-10 md:pb-16">{children}</main>;
}

export function ChildSwitcher() {
  const { children, activeChild, setActiveChild } = useRecords();
  const [open, setOpen] = useState(false);
  const ageLabel = activeChild ? calcAgeLabel(activeChild.birth) : "";

  if (!activeChild) return null;

  return (
    <div className="md:hidden mb-4 mt-1 relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-full border border-line bg-card py-1.5 pl-1.5 pr-3.5"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "#F4B393" }}>
          <Icon name="flower" size={15} color="#1F1A14" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-[13px] font-semibold text-ink">{activeChild.name}</div>
          <div className="text-[10px] text-ink-mute">{ageLabel} · {activeChild.gender}아</div>
        </div>
        <Icon name="chevron-down" size={14} color="#8B8377" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-40 overflow-hidden rounded-[14px] border border-line bg-card shadow-soft">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => { setActiveChild(c.id); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 px-4 py-3 text-left transition hover:bg-bg ${c.id === activeChild.id ? "bg-bg" : ""}`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "#F4B393" }}>
                <Icon name="flower" size={12} color="#1F1A14" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-medium text-ink">{c.name}</div>
                <div className="text-[10px] text-ink-mute">{calcAgeLabel(c.birth)} · {c.gender}아</div>
              </div>
              {c.id === activeChild.id && <Icon name="check" size={13} color="#5C7A5C" strokeWidth={2.4} />}
            </button>
          ))}
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 border-t border-line px-4 py-3 text-[12px] font-medium text-accent"
          >
            <Icon name="settings" size={13} color="#D77B50" /> 아이 관리
          </Link>
        </div>
      )}
    </div>
  );
}

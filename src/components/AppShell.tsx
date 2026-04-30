"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { CHILD } from "@/lib/data";

const NAV = [
  { href: "/", label: "홈", icon: "home" },
  { href: "/record", label: "기록", icon: "edit" },
  { href: "/growth", label: "성장 추이", icon: "chart" },
  { href: "/ai", label: "AI 분석", icon: "sparkle" },
  { href: "/schedule", label: "일정", icon: "calendar" },
];

export function TopBar() {
  const pathname = usePathname();
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
      <button className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-card text-ink transition hover:bg-bg" aria-label="알림">
        <Icon name="bell" size={16} />
      </button>
      <div className="flex items-center gap-2 rounded-full border border-line bg-bg py-1.5 pl-1.5 pr-3.5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ background: CHILD.emojiBg }}
        >
          <Icon name="flower" size={13} color="#1F1A14" />
        </div>
        <span className="text-[13px] font-medium text-ink">{CHILD.name}</span>
        <Icon name="chevron-down" size={13} color="#8B8377" />
      </div>
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
        <button className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-card" aria-label="알림">
          <Icon name="bell" size={16} />
        </button>
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

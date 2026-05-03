import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RecordsProvider } from "./providers";
import SplashScreen from "@/components/SplashScreen";

export const metadata: Metadata = {
  title: "아이결 · 아이의 성장을 따뜻하게",
  description:
    "아이의 키, 몸무게, BMI를 기록하고 주·월 단위 성장 추이를 확인하세요. AI가 검진지와 예방접종 일정도 한 번에 정리해드려요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7F4EE",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-bg text-ink min-h-screen">
        <RecordsProvider>
          <SplashScreen>{children}</SplashScreen>
        </RecordsProvider>
      </body>
    </html>
  );
}

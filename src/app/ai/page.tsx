"use client";

import { useRef, useState } from "react";
import { BottomNav, MobileTopBar, PageWrap, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

type DocType = "checkup" | "vaccine";
type Row = { l: string; v: string; t?: string; hi?: boolean };

const ROWS_CHECKUP: Row[] = [
  { l: "검진 종류", v: "영유아건강검진 5차" },
  { l: "검진 일자", v: "2024.08.12" },
  { l: "신장", v: "105.2 cm", t: "P35", hi: true },
  { l: "체중", v: "17.1 kg", t: "P42", hi: true },
  { l: "두위", v: "50.4 cm" },
  { l: "종합 판정", v: "양호", t: "good" },
];

const ROWS_VACCINE: Row[] = [
  { l: "백신명", v: "MMR (홍역·볼거리·풍진)" },
  { l: "차수", v: "2차" },
  { l: "접종일", v: "2026.05.12" },
  { l: "접종 기관", v: "행복소아청소년과" },
  { l: "다음 차수", v: "필요 없음", t: "good" },
];

type Step = "upload" | "analyzing" | "done";

export default function AIPage() {
  const [tab, setTab] = useState<DocType>("checkup");
  const [step, setStep] = useState<Step>("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const rows = tab === "checkup" ? ROWS_CHECKUP : ROWS_VACCINE;

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStep("analyzing");
    setTimeout(() => setStep("done"), 2200);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setStep("upload");
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <TopBar />
      <MobileTopBar back title="AI 분석" />
      <PageWrap>
        <div className="hidden md:flex items-end justify-between pt-8 pb-6">
          <div>
            <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">
              AI VISION · {step === "upload" ? "STEP 1" : step === "analyzing" ? "분석 중" : "STEP 2"}
            </div>
            <h1 className="font-serif text-[30px] font-medium text-ink">
              {step === "upload"
                ? "검진지 또는 접종표를 업로드하세요"
                : step === "analyzing"
                ? "AI가 문서를 분석하고 있어요..."
                : tab === "checkup"
                ? "영유아 검진 결과지를 확인했어요"
                : "예방접종 기록표를 확인했어요"}
            </h1>
            {step === "done" && (
              <p className="mt-1 text-[13px] text-ink-mute">
                인식된 정보를 확인하시고, 저장할 항목을 선택해주세요.
              </p>
            )}
          </div>
        </div>

        <div className="md:hidden px-2 pt-2">
          <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">
            {step === "upload" ? "STEP 1" : step === "analyzing" ? "분석 중" : "STEP 2 · 분석 완료"}
          </div>
          <h1 className="font-serif text-[22px] font-medium text-ink">
            {step === "upload"
              ? "문서를 업로드하세요"
              : step === "analyzing"
              ? "AI 분석 중..."
              : tab === "checkup"
              ? "검진 결과지를 확인했어요"
              : "접종 기록을 확인했어요"}
          </h1>
        </div>

        {/* Upload step */}
        {step === "upload" && (
          <section className="mt-4 md:mt-6">
            <div className="mb-3 flex gap-1 self-start rounded-[10px] border border-line bg-card p-1 md:w-fit">
              <TabButton active={tab === "checkup"} onClick={() => setTab("checkup")} icon="heart">
                건강검진 결과지
              </TabButton>
              <TabButton active={tab === "vaccine"} onClick={() => setTab("vaccine")} icon="syringe">
                예방접종 기록
              </TabButton>
            </div>
            <label
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[22px] border-2 border-dashed border-line-strong bg-bg/60 px-6 py-16 text-center transition hover:bg-bg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
                <Icon name="upload" size={22} color="#D77B50" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-ink">사진 드래그 또는 선택</div>
                <div className="mt-1 text-[12px] text-ink-mute">JPG · PNG · HEIC · 최대 10MB</div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </label>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Step n="1" title="사진 업로드" desc="검진지나 접종표를 카메라로 찍거나 갤러리에서 선택하세요." />
              <Step n="2" title="AI 자동 추출" desc="키, 몸무게, 백신, 일자 등 항목을 자동으로 인식해요." />
              <Step n="3" title="기록 저장" desc="추출된 항목을 확인하고 한 번에 저장하세요." />
            </div>
          </section>
        )}

        {/* Analyzing step */}
        {step === "analyzing" && (
          <section className="mt-4 md:mt-6">
            <div className="flex flex-col items-center gap-6 rounded-[22px] border border-line bg-card p-10">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="업로드된 문서"
                  className="max-h-64 rounded-[14px] object-contain shadow-soft"
                />
              )}
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-accent" />
                <div className="text-[13px] font-medium text-ink">문서를 분석하고 있어요...</div>
                <div className="text-[11px] text-ink-mute">잠시만 기다려주세요</div>
              </div>
            </div>
          </section>
        )}

        {/* Done step */}
        {step === "done" && (
          <section className="mt-4 md:mt-6">
            <div className="mb-3 flex gap-1 self-start rounded-[10px] border border-line bg-card p-1 md:w-fit">
              <TabButton active={tab === "checkup"} onClick={() => setTab("checkup")} icon="heart">
                건강검진 결과지
              </TabButton>
              <TabButton active={tab === "vaccine"} onClick={() => setTab("vaccine")} icon="syringe">
                예방접종 기록
              </TabButton>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.05fr_1fr]">
              {/* Preview */}
              <div className="overflow-hidden rounded-[16px] border border-line bg-card">
                <div
                  className="relative flex items-center justify-center overflow-hidden md:h-[480px]"
                  style={{ background: "linear-gradient(135deg, #F5EBDD 0%, #E8C9A6 100%)", minHeight: 300 }}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="업로드된 문서"
                      className="max-h-full max-w-full object-contain p-4"
                    />
                  ) : (
                    <div className="absolute inset-x-10 inset-y-10 rounded bg-card px-6 py-5 md:inset-x-14 md:inset-y-10 md:px-7 md:py-6">
                      {tab === "checkup" ? <CheckupMock /> : <VaccineMock />}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-line px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-good" />
                    <span className="text-[12px] font-medium text-ink">분석 완료 · 신뢰도 96%</span>
                  </div>
                </div>
              </div>

              {/* Extracted data */}
              <div>
                <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">
                  EXTRACTED DATA · {rows.length}개 항목
                </div>
                <div className="mb-4 font-serif text-[20px] font-medium text-ink md:text-[22px]">
                  저장하실 항목을 확인해주세요
                </div>

                <div className="overflow-hidden rounded-[14px] border border-line bg-card">
                  {rows.map((row, i) => (
                    <div
                      key={row.l}
                      className={`flex items-center justify-between px-5 py-3.5 md:px-6 ${
                        i < rows.length - 1 ? "border-b border-line" : ""
                      } ${row.hi ? "bg-[rgba(215,123,80,0.04)]" : ""}`}
                    >
                      <div>
                        <div className="mb-0.5 text-[11px] text-ink-mute">{row.l}</div>
                        <div className="ko-num text-[14px] font-medium text-ink">{row.v}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {row.t === "good" && (
                          <span className="rounded-full bg-good-soft px-2 py-0.5 text-[10px] font-semibold text-good">
                            정상
                          </span>
                        )}
                        {row.t && row.t !== "good" && (
                          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
                            {row.t}
                          </span>
                        )}
                        <div className="flex h-[18px] w-[18px] items-center justify-center rounded bg-ink">
                          <Icon name="check" size={11} color="#fff" strokeWidth={2.4} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-3 rounded-[12px] bg-warn-soft px-4 py-3.5">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-warn">
                    <Icon name="sparkle" size={13} color="#fff" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="mb-1 text-[12px] font-semibold text-ink">다음 차수 안내</div>
                    <div className="text-[11px] leading-[1.55] text-ink-soft">
                      {tab === "checkup"
                        ? "6차 검진 일정을 스케줄에 자동으로 추가할 수 있어요."
                        : "다음 일정으로 일본뇌염 4차를 추가할 수 있어요."}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2.5">
                  <button
                    onClick={reset}
                    className="flex-1 rounded-[12px] border border-line bg-card py-3 text-[13px] font-medium text-ink"
                  >
                    다시 분석
                  </button>
                  <button className="flex-[2] inline-flex items-center justify-center gap-2 rounded-[12px] bg-ink py-3 text-[13px] font-semibold text-white">
                    {rows.length}개 모두 저장 <Icon name="arrow-right" size={14} color="#fff" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </PageWrap>
      <BottomNav />
    </>
  );
}

function TabButton({ active, onClick, icon, children }: {
  active: boolean; onClick: () => void; icon: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-[7px] px-3.5 py-2 text-[12px] transition ${
        active ? "bg-ink text-white" : "text-ink-soft"
      }`}
    >
      <Icon name={icon} size={13} color={active ? "#fff" : "#8B8377"} />
      {children}
    </button>
  );
}

function CheckupMock() {
  return (
    <>
      <div className="mb-1 font-serif text-[15px] font-semibold text-ink">영유아 건강검진 결과 통보서</div>
      <div className="mb-3 text-[10px] text-ink-mute">5차 · 만 4-5세</div>
      <div className="mb-2 h-px bg-line" />
      {[["신장", "105.2 cm"], ["체중", "17.1 kg"], ["두위", "50.4 cm"], ["종합판정", "양호"]].map((row, i, arr) => (
        <div key={i} className={`flex py-[5px] text-[10px] ${i < arr.length - 1 ? "border-b border-dotted border-line" : ""}`}>
          <span className="w-20 text-ink-mute">{row[0]}</span>
          <span className="font-medium text-ink">{row[1]}</span>
        </div>
      ))}
    </>
  );
}

function VaccineMock() {
  return (
    <>
      <div className="mb-1 font-serif text-[15px] font-semibold text-ink">예방접종 증명서</div>
      <div className="mb-3 text-[10px] text-ink-mute">질병관리청 표준 양식</div>
      <div className="mb-2 h-px bg-line" />
      {[["백신명", "MMR (홍역·볼거리·풍진)"], ["차수", "2차"], ["접종기관", "행복소아청소년과"]].map((row, i, arr) => (
        <div key={i} className={`flex py-[5px] text-[10px] ${i < arr.length - 1 ? "border-b border-dotted border-line" : ""}`}>
          <span className="w-20 text-ink-mute">{row[0]}</span>
          <span className="font-medium text-ink">{row[1]}</span>
        </div>
      ))}
    </>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-bg/60 px-4 py-5">
      <div className="ko-num font-mono text-[11px] tracking-wide text-accent">STEP {n}</div>
      <div className="mt-1.5 text-[13px] font-semibold text-ink">{title}</div>
      <div className="mt-1 text-[11px] leading-[1.55] text-ink-mute">{desc}</div>
    </div>
  );
}

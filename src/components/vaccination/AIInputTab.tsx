"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { useVaxRecords } from "@/hooks/useVaxRecords";
import { genId } from "@/lib/vaccineParser";
import type { AnalysisResult, ParsedRecord, VaccinationRecord } from "@/types/vaccination";

type InputMode = "text" | "image";

const CONFIDENCE_LABEL: Record<string, string> = { high: "높음", medium: "보통", low: "낮음" };
const CONFIDENCE_COLOR: Record<string, string> = {
  high: "bg-good-soft text-good",
  medium: "bg-accent-soft text-accent",
  low: "bg-warn-soft text-warn",
};

type Props = {
  childId: string;
  childBirth: string;
  onSaved: () => void;
};

export function AIInputTab({ childId, childBirth, onSaved }: Props) {
  const { records, mergeRecords } = useVaxRecords(childId);

  const [mode, setMode] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [birthDate, setBirthDate] = useState(childBirth);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResult(null);
    setSaved(false);
    setError(null);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const analyze = async () => {
    const hasInput = mode === "text" ? text.trim() : !!file;
    if (!hasInput) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);

    try {
      let res: Response;
      if (mode === "image" && file) {
        const form = new FormData();
        form.append("file", file);
        if (birthDate) form.append("birthDate", birthDate);
        res = await fetch("/api/vaccination/analyze", { method: "POST", body: form });
      } else {
        res = await fetch("/api/vaccination/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, birthDate: birthDate || undefined }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "분석 실패");
      setResult(data as AnalysisResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const save = () => {
    if (!result) return;
    const newRecords: VaccinationRecord[] = result.records.map((r) => ({
      id: genId(),
      childId,
      type: (r.vaccineGroup === "영유아검진" ? "checkup" : "vaccination") as VaccinationRecord["type"],
      name: r.name,
      vaccineGroup: r.vaccineGroup,
      doseNumber: r.doseNumber,
      status: r.status,
      completedDate: r.completedDate ?? undefined,
      hospital: r.hospital ?? undefined,
      note: r.note ?? undefined,
      aiConfidence: r.confidence,
    }));
    mergeRecords(newRecords);
    setSaved(true);
    setTimeout(onSaved, 800);
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setSaved(false);
    setText("");
    setFile(null);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  const canAnalyze = mode === "text" ? text.trim().length > 0 : !!file;

  return (
    <div className="space-y-4">
      {/* Input mode tabs */}
      <div className="flex gap-1 rounded-[12px] border border-line bg-card p-1">
        <ModeButton active={mode === "text"} onClick={() => { setMode("text"); setResult(null); setError(null); }} icon="note" label="텍스트 입력" />
        <ModeButton active={mode === "image"} onClick={() => { setMode("image"); setResult(null); setError(null); }} icon="camera" label="사진 / 카메라" />
      </div>

      <div className="rounded-[18px] border border-line bg-card p-5 md:p-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-accent-soft">
            <Icon name={mode === "text" ? "note" : "camera"} size={14} color="#D77B50" />
          </div>
          <span className="text-[13px] font-semibold text-ink">
            {mode === "text" ? "기록 텍스트 입력" : "사진으로 기록 인식"}
          </span>
        </div>

        {/* Birth date */}
        <div className="mb-3">
          <label className="mb-1 block text-[11px] font-medium text-ink-mute">아이 생년월일</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="ko-num w-full rounded-[10px] border border-line bg-bg px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
          />
        </div>

        {/* Text mode */}
        {mode === "text" && (
          <div className="mb-4">
            <label className="mb-1 block text-[11px] font-medium text-ink-mute">예방접종 기록</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={"병원 기록, 수첩 내용, 예진표 내용을 그대로 붙여넣으세요\n\n예시)\nBCG 2024.03.15 서울아동병원\nB형간염 1차 생후 즉시\nDTaP 2차 2024.05.20"}
              className="w-full resize-none rounded-[12px] border border-line bg-bg px-4 py-3 text-[13px] text-ink placeholder-ink-mute/60 outline-none focus:border-accent"
            />
          </div>
        )}

        {/* Image mode */}
        {mode === "image" && (
          <div className="mb-4 space-y-3">
            {/* Camera + Gallery buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex flex-col items-center gap-2 rounded-[14px] border-2 border-dashed border-line-strong bg-bg py-5 transition hover:bg-bg/80"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
                  <Icon name="camera" size={18} color="#D77B50" />
                </div>
                <span className="text-[12px] font-semibold text-ink">카메라 촬영</span>
                <span className="text-[10px] text-ink-mute">지금 바로 찍기</span>
              </button>

              <button
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center gap-2 rounded-[14px] border-2 border-dashed border-line-strong bg-bg py-5 transition hover:bg-bg/80"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg border border-line">
                  <Icon name="upload" size={18} color="#8B8377" />
                </div>
                <span className="text-[12px] font-semibold text-ink">갤러리 선택</span>
                <span className="text-[10px] text-ink-mute">사진 보관함</span>
              </button>
            </div>

            {/* Hidden inputs */}
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />
            <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={onFileChange} />

            {/* Drag drop area */}
            <label
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-line py-5 text-center transition hover:bg-bg"
            >
              <span className="text-[12px] text-ink-mute">또는 파일을 여기에 드래그</span>
              <span className="text-[10px] text-ink-mute/60">JPG · PNG · HEIC · PDF · 최대 10MB</span>
            </label>

            {/* Preview */}
            {previewUrl && (
              <div className="relative overflow-hidden rounded-[12px] border border-line bg-bg">
                <img src={previewUrl} alt="선택된 이미지" className="max-h-52 w-full object-contain p-2" />
                <button
                  onClick={() => { setFile(null); setPreviewUrl(null); setResult(null); }}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink/60 text-white"
                >
                  <Icon name="plus" size={12} color="#fff" className="rotate-45" />
                </button>
                <div className="px-3 py-2 text-[11px] text-ink-mute border-t border-line">
                  {file?.name}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={analyze}
          disabled={loading || !canAnalyze}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-ink py-3 text-[13px] font-semibold text-white transition disabled:opacity-40"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              AI 분석 중...
            </>
          ) : (
            <>
              <Icon name="sparkle" size={14} color="#fff" />
              AI로 분석하기
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-[12px] border border-[#EF4444]/20 bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#EF4444]">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-[18px] border border-line bg-card p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-good-soft">
                <Icon name="check" size={14} color="#5C7A5C" strokeWidth={2.4} />
              </div>
              <span className="text-[13px] font-semibold text-ink">분석 결과 · {result.records.length}건</span>
            </div>
            {result.birthDate && (
              <span className="ko-num text-[11px] text-ink-mute">생년월일 인식: {result.birthDate}</span>
            )}
          </div>

          <div className="overflow-hidden rounded-[12px] border border-line">
            {result.records.map((r, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-3 ${r.confidence === "low" ? "bg-warn-soft/30" : ""} ${i < result.records.length - 1 ? "border-b border-line" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[13px]">{r.status === "completed" ? "✅" : "⏳"}</span>
                  <div>
                    <div className="text-[13px] font-medium text-ink">{r.name}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-mute">
                      {r.completedDate && <span className="ko-num">{r.completedDate}</span>}
                      {r.hospital && <span>· {r.hospital}</span>}
                      {r.note && <span className="text-warn">· {r.note}</span>}
                    </div>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CONFIDENCE_COLOR[r.confidence]}`}>
                  {CONFIDENCE_LABEL[r.confidence]}
                </span>
              </div>
            ))}
          </div>

          {result.records.some((r) => r.confidence === "low") && (
            <div className="mt-3 rounded-[10px] bg-warn-soft px-3.5 py-2.5 text-[11px] leading-[1.55] text-ink-soft">
              노란색 항목은 AI 신뢰도가 낮습니다. 저장 전 직접 확인해주세요.
            </div>
          )}

          <div className="mt-4 flex gap-2.5">
            <button onClick={reset} className="flex-1 rounded-[12px] border border-line bg-card py-3 text-[13px] font-medium text-ink transition hover:bg-bg">
              다시 입력
            </button>
            <button
              onClick={save}
              disabled={saved}
              className="flex-[2] inline-flex items-center justify-center gap-2 rounded-[12px] bg-ink py-3 text-[13px] font-semibold text-white transition disabled:bg-good"
            >
              {saved ? (
                <><Icon name="check" size={14} color="#fff" strokeWidth={2.4} /> 저장 완료</>
              ) : (
                <>{result.records.length}건 저장하기 <Icon name="arrow-right" size={14} color="#fff" /></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Guide (only when no result and not loading) */}
      {!result && !loading && (
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { n: "1", title: mode === "text" ? "기록 붙여넣기" : "사진 선택", desc: mode === "text" ? "수첩, 병원 문서, 메모 등 어떤 형태든 그대로 붙여넣으세요." : "예방접종 수첩이나 증명서를 카메라로 찍거나 갤러리에서 선택하세요." },
            { n: "2", title: "AI 자동 분석", desc: "접종명, 날짜, 병원 정보를 자동으로 추출하고 신뢰도를 표시해요." },
            { n: "3", title: "일정에 반영", desc: "저장하면 일정 탭에서 남은 접종과 함께 확인할 수 있어요." },
          ].map((s) => (
            <div key={s.n} className="rounded-[14px] border border-line bg-bg/60 px-4 py-5">
              <div className="ko-num font-mono text-[11px] tracking-wide text-accent">STEP {s.n}</div>
              <div className="mt-1.5 text-[13px] font-semibold text-ink">{s.title}</div>
              <div className="mt-1 text-[11px] leading-[1.55] text-ink-mute">{s.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ModeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-[9px] py-2 text-[12px] transition ${active ? "bg-ink font-semibold text-white" : "text-ink-soft"}`}
    >
      <Icon name={icon} size={13} color={active ? "#fff" : "#8B8377"} />
      {label}
    </button>
  );
}

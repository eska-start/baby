"use client";

import { useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BottomNav, MobileTopBar, PageWrap, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useRecords } from "@/app/providers";

type DocType = "checkup" | "vaccine";

type AnalysisResult = {
  type: DocType;
  extracted: Record<string, unknown>;
  raw?: string;
};

type AnalysisRecord = {
  id: string;
  type: DocType;
  fileName: string;
  extracted: Record<string, unknown>;
  createdAt: { toDate: () => Date } | null;
  appliedToRecord: boolean;
};

function hasValue(value: unknown) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function toNumber(value: unknown) {
  if (!hasValue(value)) return null;
  const n = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function toDateString(value: unknown) {
  if (!hasValue(value)) return null;
  const raw = String(value).trim().replace(/[.\/]/g, "-");
  const match = raw.match(/(20\d{2}|19\d{2})-?(\d{1,2})-?(\d{1,2})/);
  if (!match) return raw;
  const [, y, m, d] = match;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export default function AIPage() {
  const { activeChild, addRecord } = useRecords();

  const [tab, setTab] = useState<DocType>("checkup");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!activeChild) return;
    const q = query(collection(db, "children", activeChild.id, "analyses"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setHistory(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AnalysisRecord, "id">) })));
      },
      (err) => {
        console.error("Failed to load analysis history", err);
        setError("분석 기록을 불러오지 못했어요. Firestore 권한을 확인해주세요.");
      },
    );
    return () => unsub();
  }, [activeChild]);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    setSaved(false);
    setError(null);
    if (f.type.startsWith("image/")) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const analyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", tab);
      const res = await fetch("/api/analyze", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "오류");
      setResult({ type: tab, extracted: data.extracted, raw: data.raw });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  const saveResult = async () => {
    if (!result || !activeChild) return;
    setError(null);

    const ext = result.extracted;
    const date = toDateString(ext["검진일자"]);
    const height = toNumber(ext["신장"]);
    const weight = toNumber(ext["체중"]);
    const canApplyToRecord = result.type === "checkup" && Boolean(date) && height !== null && weight !== null;

    try {
      await addDoc(collection(db, "children", activeChild.id, "analyses"), {
        type: result.type,
        fileName: file?.name ?? "unknown",
        extracted: ext,
        raw: result.raw ?? null,
        createdAt: serverTimestamp(),
        appliedToRecord: canApplyToRecord,
      });

      if (canApplyToRecord) {
        addRecord({ date: date!, height, weight, note: String(ext["검진종류"] ?? "AI 건강검진 분석") });
      }

      setSaved(true);
    } catch (e) {
      console.error("Failed to save analysis result", e);
      setError("분석 결과 저장에 실패했어요. Firestore 권한이나 데이터 값을 확인해주세요.");
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setSaved(false);
    setError(null);
  };

  const checkupFields: Array<[string, string]> = [["검진종류", "검진종류"], ["검진일자", "검진일자"], ["신장", "신장"], ["체중", "체중"], ["두위", "두위"], ["판정", "판정"]];
  const vaccineFields: Array<[string, string]> = [["백신명", "백신명"], ["차수", "차수"], ["접종일", "접종일"], ["접종기관", "접종기관"], ["다음접종", "다음접종"]];
  const fields = result?.type === "checkup" ? checkupFields : vaccineFields;

  const formatHistoryDate = (r: AnalysisRecord) => {
    if (!r.createdAt) return "";
    try {
      const d = r.createdAt.toDate?.() ?? new Date(r.createdAt as unknown as string);
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
    } catch {
      return "";
    }
  };

  const canSave = result && Object.values(result.extracted).some(hasValue);
  const date = toDateString(result?.extracted["검진일자"]);
  const height = toNumber(result?.extracted["신장"]);
  const weight = toNumber(result?.extracted["체중"]);
  const canAutoRecord = result?.type === "checkup" && Boolean(date) && height !== null && weight !== null;

  return (
    <>
      <TopBar />
      <MobileTopBar back title="AI 분석" />
      <PageWrap>
        <div className="hidden md:flex items-end justify-between pt-8 pb-6">
          <div>
            <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">AI VISION</div>
            <h1 className="font-serif text-[30px] font-medium text-ink">건강 문서 자동 인식</h1>
            <p className="mt-1 text-[13px] text-ink-mute">검진 결과지나 예방접종 기록을 사진으로 찍거나 파일로 올리면 AI가 자동으로 읽어요.</p>
          </div>
        </div>
        <div className="md:hidden px-2 pt-2 mb-4">
          <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">AI VISION</div>
          <h1 className="font-serif text-[22px] font-medium text-ink">건강 문서 자동 인식</h1>
        </div>

        <div className="mb-4 flex gap-1 rounded-[10px] border border-line bg-card p-1 w-fit">
          {(["checkup", "vaccine"] as DocType[]).map((t) => (
            <button key={t} onClick={() => { setTab(t); resetUpload(); }} className={`inline-flex items-center gap-1.5 rounded-[7px] px-3.5 py-2 text-[12px] transition ${tab === t ? "bg-ink text-white" : "text-ink-soft"}`}>
              <Icon name={t === "checkup" ? "heart" : "syringe"} size={13} color={tab === t ? "#fff" : "#8B8377"} />
              {t === "checkup" ? "건강검진 결과지" : "예방접종 기록"}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            {!file ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => cameraRef.current?.click()}
                    className="flex flex-col items-center gap-2 rounded-[18px] border-2 border-dashed border-line-strong bg-bg py-6 transition active:scale-[0.98]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
                      <Icon name="camera" size={20} color="#D77B50" />
                    </div>
                    <span className="text-[13px] font-semibold text-ink">카메라 촬영</span>
                    <span className="text-[11px] text-ink-mute">지금 바로 찍기</span>
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex flex-col items-center gap-2 rounded-[18px] border-2 border-dashed border-line-strong bg-bg py-6 transition active:scale-[0.98]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-bg">
                      <Icon name="upload" size={20} color="#8B8377" />
                    </div>
                    <span className="text-[13px] font-semibold text-ink">파일 선택</span>
                    <span className="text-[11px] text-ink-mute">갤러리 · PDF</span>
                  </button>
                </div>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                <label
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-[14px] border-2 border-dashed border-line bg-transparent py-4 text-center transition hover:bg-bg"
                >
                  <span className="text-[12px] text-ink-mute">또는 파일을 여기에 드래그</span>
                  <span className="text-[10px] text-ink-mute/60">JPG · PNG · HEIC · PDF · 최대 20MB</span>
                </label>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[18px] border border-line bg-card">
                {preview ? <img src={preview} alt="업로드된 문서" className="w-full object-contain max-h-[360px]" /> : (
                  <div className="flex h-40 items-center justify-center gap-3 bg-bg"><Icon name="note" size={28} color="#8B8377" /><div><div className="text-[13px] font-semibold text-ink">{file.name}</div><div className="text-[11px] text-ink-mute">PDF 문서</div></div></div>
                )}
                <div className="flex items-center justify-between border-t border-line px-4 py-3"><span className="text-[12px] text-ink-mute truncate max-w-[60%]">{file.name}</span><button onClick={resetUpload} className="text-[12px] font-medium text-red-400">제거</button></div>
              </div>
            )}

            {file && !result && <button onClick={analyze} disabled={analyzing} className="w-full rounded-[14px] bg-ink py-3.5 text-[14px] font-semibold text-white disabled:opacity-60">{analyzing ? "AI OCR + LLM 분석 중..." : "AI로 분석하기"}</button>}
            {error && <div className="rounded-[12px] bg-red-50 px-4 py-3 text-[13px] text-red-500">{error}</div>}
          </div>

          <div>
            {result ? (
              <div>
                <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">분석 결과</div>
                <div className="mb-3 font-serif text-[20px] font-medium text-ink">{result.type === "checkup" ? "검진 정보를 인식했어요" : "접종 기록을 인식했어요"}</div>
                <div className="overflow-hidden rounded-[14px] border border-line bg-card">
                  {fields.map(([label, key], i) => {
                    const val = result.extracted[key];
                    if (!hasValue(val)) return null;
                    return <div key={key} className={`flex items-center justify-between px-5 py-3.5 ${i > 0 ? "border-t border-line" : ""}`}><div className="text-[12px] text-ink-mute">{label}</div><div className="ko-num text-[14px] font-semibold text-ink">{String(val)}{key === "신장" ? " cm" : key === "체중" ? " kg" : key === "두위" ? " cm" : ""}</div></div>;
                  })}
                </div>

                {canAutoRecord ? <div className="mt-3 flex gap-2 rounded-[12px] bg-accent-soft px-4 py-3"><Icon name="check" size={14} color="#D77B50" strokeWidth={2.4} /><div className="text-[12px] text-ink">저장하면 {date} 기록으로 키 {height}cm · 몸무게 {weight}kg가 자동 반영돼요</div></div> : <div className="mt-3 rounded-[12px] bg-red-50 px-4 py-3 text-[12px] text-red-500">자동 기록에는 검진일자, 신장, 체중이 모두 필요해요.</div>}

                <div className="mt-4 flex gap-2.5">
                  <button onClick={resetUpload} className="flex-1 rounded-[12px] border border-line bg-card py-3 text-[13px] font-medium text-ink">다시 분석</button>
                  {saved ? <div className="flex-[2] inline-flex items-center justify-center gap-2 rounded-[12px] bg-good py-3 text-[13px] font-semibold text-white"><Icon name="check" size={14} color="#fff" strokeWidth={2.4} /> 저장됐어요</div> : <button onClick={saveResult} disabled={!canSave} className="flex-[2] inline-flex items-center justify-center gap-2 rounded-[12px] bg-ink py-3 text-[13px] font-semibold text-white disabled:opacity-40">저장하고 자동 반영 <Icon name="arrow-right" size={14} color="#fff" /></button>}
                </div>
              </div>
            ) : (
              <div className="rounded-[18px] border border-line bg-card p-6 text-center text-[13px] text-ink-mute"><Icon name="sparkle" size={28} color="#D77B50" /><div className="mt-3 font-semibold text-ink">왼쪽에서 파일을 선택하면</div><div className="mt-1 text-ink-mute">AI가 OCR로 내용을 읽고 기록까지 연결해요</div></div>
            )}
          </div>
        </div>

        {history.length > 0 && <section className="mt-8"><div className="mb-3 flex items-center justify-between"><div className="text-[13px] font-semibold text-ink">분석 기록 · {history.length}회</div></div><div className="overflow-hidden rounded-[14px] border border-line bg-card">{history.map((h, i) => { const mainInfo = h.type === "checkup" ? [h.extracted["검진종류"], h.extracted["신장"] ? `${h.extracted["신장"]}cm` : null, h.extracted["체중"] ? `${h.extracted["체중"]}kg` : null].filter(Boolean).join(" · ") : [h.extracted["백신명"], h.extracted["차수"]].filter(Boolean).join(" "); return <div key={h.id} className={`grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_1fr_auto] gap-2 px-5 py-3.5 md:items-center ${i > 0 ? "border-t border-line" : ""}`}><div className="flex h-7 w-7 items-center justify-center rounded-full bg-bg text-[11px] font-semibold text-ink-mute">{history.length - i}</div><div className="md:contents"><div><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${h.type === "checkup" ? "bg-good-soft text-good" : "bg-accent-soft text-accent"}`}>{h.type === "checkup" ? "건강검진" : "예방접종"}</span></div><div className="text-[13px] text-ink truncate">{mainInfo || "—"}</div><div className="text-[11px] text-ink-mute">{formatHistoryDate(h)}</div></div></div>; })}</div></section>}
      </PageWrap>
      <BottomNav />
    </>
  );
}

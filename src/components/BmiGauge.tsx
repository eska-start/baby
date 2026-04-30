type Props = {
  value: number; // BMI value
  min?: number;
  max?: number;
};

// Maps BMI roughly to gauge position. Children use percentile but we keep the
// design intent: 13~21 spans the bar.
export function BmiGauge({ value, min = 13, max = 21 }: Props) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return (
    <div className="mt-5">
      <div
        className="relative h-2 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, #BFD7E0 0%, #C8D4B8 30%, #C8D4B8 60%, #F8CFA9 80%, #E8A099 100%)",
        }}
      >
        <div
          className="absolute -top-[3px] h-3.5 w-3.5 rounded-full border-2 border-card bg-ink shadow-[0_1px_4px_rgba(0,0,0,0.2)]"
          style={{ left: `calc(${pct * 100}% - 7px)` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[9px] text-ink-mute">
        <span>저체중</span>
        <span>정상</span>
        <span>과체중</span>
        <span>비만</span>
      </div>
    </div>
  );
}

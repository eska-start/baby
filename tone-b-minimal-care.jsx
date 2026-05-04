// Tone B — Minimal Care
// 깔끔한 카드 기반 · 큰 숫자 · 차분한 신뢰감 · 의료/병원 인접 톤

const B = {
  bg: '#F7F4EE',
  card: '#FFFFFF',
  ink: '#1F1A14',
  inkSoft: '#4A4239',
  inkMute: '#8B8377',
  line: 'rgba(31, 26, 20, 0.08)',
  lineStrong: 'rgba(31, 26, 20, 0.18)',
  accent: '#D77B50',
  accentSoft: '#FCE5D2',
  good: '#5C7A5C',
  goodSoft: '#E5EFE3',
  warn: '#C49B3A',
  warnSoft: '#F5EAC4',
};

// ──────────────────────────────────────────────────────────
// 1. HOME — mobile (minimal cards)
// ──────────────────────────────────────────────────────────
function ToneBHomeMobile() {
  return (
    <div style={{ width: 390, height: 844, background: B.bg, fontFamily: 'Pretendard, sans-serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 24px 0', fontSize: 13, fontWeight: 600, color: B.ink }}>
        <span>9:41</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <svg width="16" height="10" viewBox="0 0 16 10"><rect x="0" y="6" width="3" height="4" rx="0.5" fill={B.ink}/><rect x="4" y="4" width="3" height="6" rx="0.5" fill={B.ink}/><rect x="8" y="2" width="3" height="8" rx="0.5" fill={B.ink}/><rect x="12" y="0" width="3" height="10" rx="0.5" fill={B.ink}/></svg>
          <svg width="22" height="10" viewBox="0 0 22 10"><rect x="0.5" y="0.5" width="18" height="9" rx="2" fill="none" stroke={B.ink} strokeOpacity="0.5"/><rect x="2" y="2" width="15" height="6" rx="1" fill={B.ink}/></svg>
        </div>
      </div>

      <div style={{ padding: '20px 24px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px 6px 6px', background: B.card, borderRadius: 999, border: `1px solid ${B.line}`, flex: 1 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F4B393', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="flower" size={15} color={B.ink} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: B.ink }}>이서율</div>
            <div style={{ fontSize: 10, color: B.inkMute }}>5세 3개월 · 여</div>
          </div>
          <Icon name="chevron-down" size={14} color={B.inkMute} />
        </div>
        <button style={{ width: 40, height: 40, borderRadius: 12, background: B.card, border: `1px solid ${B.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="bell" size={16} color={B.ink} /></button>
      </div>

      <div style={{ margin: '0 20px 12px', padding: '24px 24px 22px', background: B.card, borderRadius: 22, border: `1px solid ${B.line}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: B.inkMute, letterSpacing: 0.5, marginBottom: 2 }}>오늘의 상태</div>
            <div style={{ fontSize: 14, color: B.ink, fontWeight: 500 }}>2026년 4월 30일</div>
          </div>
          <span style={{ fontSize: 11, color: B.good, fontWeight: 600, padding: '4px 10px', background: B.goodSoft, borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: B.good }} /> 정상 범위</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 64, fontWeight: 500, color: B.ink, lineHeight: 1, letterSpacing: -1 }} className="ko-num">15.2</span>
          <span style={{ fontSize: 16, color: B.inkMute }}>BMI</span>
        </div>
        <div style={{ fontSize: 12, color: B.inkMute }}>또래 5세 여아 100명 중 상위 32등 수준</div>

        <div style={{ marginTop: 18, height: 8, borderRadius: 4, background: 'linear-gradient(90deg, #BFD7E0 0%, #C8D4B8 30%, #C8D4B8 60%, #F8CFA9 80%, #E8A099 100%)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '38%', top: -3, width: 14, height: 14, borderRadius: '50%', background: B.ink, border: `2px solid ${B.card}`, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
        </div>
      </div>
    </div>
  );
}

function ToneBRecordMobile() {
  return (
    <div style={{ width: 390, height: 844, background: B.bg, fontFamily: 'Pretendard, sans-serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, color: B.ink }}>오늘 측정값을 입력해주세요</div>
      </div>
    </div>
  );
}

function BigChartB({ w = 920, h = 280 }) {
  const data = GROWTH_RECORDS;
  const maxH = 113.5, minH = 107.5;
  const xStep = (w - 60) / (data.length - 1);
  const yFor = v => 16 + (h - 32) * (1 - (v - minH) / (maxH - minH));
  const xFor = i => 30 + i * xStep;
  const path = data.map((r, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(r.height)}`).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', width: '100%', height: 'auto' }}>
      <path d={path} stroke={B.accent} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ToneBGrowthDesktop() {
  return (
    <div style={{ width: 1280, height: 820, background: B.bg, fontFamily: 'Pretendard, sans-serif', position: 'relative' }}>
      <div style={{ padding: '32px 40px' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 32, color: B.ink }}>이서율 성장 추이</div>
        <BigChartB />
      </div>
    </div>
  );
}

function ToneBAIDesktop() {
  return (
    <div style={{ width: 1280, height: 820, background: B.bg, fontFamily: 'Pretendard, sans-serif', position: 'relative' }}>
      <div style={{ padding: '32px 40px' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: B.ink }}>영유아 검진 결과지를 확인했어요</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ToneBHomeMobile, ToneBRecordMobile, ToneBGrowthDesktop, ToneBAIDesktop,
});

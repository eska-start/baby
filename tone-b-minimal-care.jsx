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

      {/* Top — kid switcher inline */}
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

      {/* Big BMI card */}
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

        {/* BMI gauge */}
        <div style={{ marginTop: 18, height: 8, borderRadius: 4, background: 'linear-gradient(90deg, #BFD7E0 0%, #C8D4B8 30%, #C8D4B8 60%, #F8CFA9 80%, #E8A099 100%)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '38%', top: -3, width: 14, height: 14, borderRadius: '50%', background: B.ink, border: `2px solid ${B.card}`, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: B.inkMute }}>
          <span>저체중</span><span>정상</span><span>과체중</span><span>비만</span>
        </div>
      </div>

      {/* Two stats */}
      <div style={{ margin: '0 20px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { l: '키', v: '112.4', u: 'cm', d: '+0.6', sub: '이번 주', dColor: B.good },
          { l: '몸무게', v: '19.2', u: 'kg', d: '+0.3', sub: '이번 주', dColor: B.good },
        ].map((s, i) => (
          <div key={i} style={{ padding: '18px 18px', background: B.card, borderRadius: 18, border: `1px solid ${B.line}` }}>
            <div style={{ fontSize: 11, color: B.inkMute, marginBottom: 6 }}>{s.l}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 500, color: B.ink }} className="ko-num">{s.v}</span>
              <span style={{ fontSize: 12, color: B.inkMute }}>{s.u}</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: s.dColor, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="arrow-up" size={11} color={s.dColor} /> {s.d}{s.u} <span style={{ color: B.inkMute, fontWeight: 400, marginLeft: 2 }}>{s.sub}</span></div>
          </div>
        ))}
      </div>

      {/* Recent records list */}
      <div style={{ margin: '0 20px 12px', padding: '18px 22px', background: B.card, borderRadius: 18, border: `1px solid ${B.line}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: B.ink }}>최근 기록</span>
          <span style={{ fontSize: 11, color: B.accent, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>모두 보기 <Icon name="arrow-right" size={11} color={B.accent} /></span>
        </div>
        {GROWTH_RECORDS.slice(-3).reverse().map((r, i) => {
          const prev = GROWTH_RECORDS[GROWTH_RECORDS.length - 2 - i];
          const dh = prev ? (r.height - prev.height).toFixed(1) : '+0.0';
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i > 0 ? `1px solid ${B.line}` : 'none' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: B.inkMute, width: 56 }}>{r.date.slice(5)}</div>
              <div style={{ flex: 1, display: 'flex', gap: 14 }}>
                <span style={{ fontSize: 13, color: B.ink, fontWeight: 500 }} className="ko-num">{r.height} cm</span>
                <span style={{ fontSize: 13, color: B.inkSoft }} className="ko-num">{r.weight} kg</span>
              </div>
              <span style={{ fontSize: 11, color: B.good, fontWeight: 600 }}>+{dh}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { ToneBHomeMobile });

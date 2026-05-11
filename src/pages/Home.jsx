import { useRef, useState, useEffect } from 'react';
import KoreaMap from '../components/KoreaMap';
import PurchaseModal from '../components/PurchaseModal';
import { useSquares } from '../context/SquaresContext';
import { PREMIUM_DONG_LABELS } from '../data/mockData';

const TOTAL_SLOTS = 423;

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function LiveFeed({ dongSquares }) {
  const confirmed = Object.values(dongSquares).filter(s => s.status === 'confirmed');
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (confirmed.length === 0) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % confirmed.length); setVisible(true); }, 350);
    }, 4000);
    return () => clearInterval(id);
  }, [confirmed.length]);

  if (confirmed.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>첫 번째 점령자가 되어보세요 🙌</span>
    </div>
  );

  const item = confirmed[idx % confirmed.length];
  const label = PREMIUM_DONG_LABELS[item?.dongCode] || item?.name || '';
  const msg = item?.message?.split('\n')[0] || item?.description || '';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      opacity: visible ? 1 : 0, transition: 'opacity 0.3s',
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: '#e63946', flexShrink: 0,
        boxShadow: '0 0 5px #e63946',
        animation: 'blink 1s ease-in-out infinite',
      }} />
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
        <b style={{ color: '#fff' }}>{label}</b>
        {msg ? ` · ${msg}` : ''}
      </span>
    </div>
  );
}

export default function Home() {
  const mapRef = useRef();
  const [modalTarget, setModalTarget] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [showGuNames, setShowGuNames] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mapApi, setMapApi] = useState(null);
  const { dongSquares } = useSquares();
  const now = useClock();

  const totalSold = Object.keys(dongSquares).length;
  const pct = Math.round((totalSold / TOTAL_SLOTS) * 100);

  const days = ['일','월','화','수','목','금','토'];
  const mo = now.getMonth() + 1;
  const d = now.getDate();
  const day = days[now.getDay()];
  const h = now.getHours();
  const mi = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      position: 'relative', background: '#d6cfc6',
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <KoreaMap mapRef={mapRef} onSelectDong={t => setModalTarget(t)} showGuNames={showGuNames} onReady={setMapApi} />
      </div>

      {/* 상단 오버레이 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        paddingBottom: '50px',
        background: 'linear-gradient(to bottom, rgba(10,7,5,0.75) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 16px 0',
        }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '18px', letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.85)',
            textShadow: '0 1px 6px rgba(0,0,0,0.5)',
          }}>한칸서울</span>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.03em' }}>{mo}.{d} {day}</span>
            <span style={{ fontSize: 'clamp(22px, 6vw, 34px)', color: '#fff', letterSpacing: '0.02em' }}>{h}:{mi}</span>
            <span style={{ fontSize: 'clamp(14px, 3.5vw, 20px)', color: '#e63946', minWidth: '1.4em' }}>{s}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '6px 16px 0' }}>
          <p style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(20px, 5.5vw, 34px)',
            color: '#fff', lineHeight: 1.15,
            textShadow: '0 2px 12px rgba(0,0,0,0.4)',
            letterSpacing: '0.01em',
          }}>
            서울 {TOTAL_SLOTS}개 동 중&nbsp;
            <span style={{ color: '#e63946', textShadow: '0 0 20px rgba(230,57,70,0.6)' }}>{totalSold}개</span>가 벌써 점령됐어요!
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
            <div style={{ width: '100px', height: '3px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #e63946, #ff6b6b)', borderRadius: '2px' }} />
            </div>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{pct}%</span>
          </div>
          <div style={{ marginTop: '6px' }}>
            <LiveFeed dongSquares={dongSquares} />
          </div>
        </div>
      </div>

      {/* 좌측 하단 버튼 */}
      <div style={{ position: 'absolute', bottom: '28px', left: '16px', zIndex: 10, display: 'flex', gap: '8px' }}>
        <button onClick={() => setPanelOpen(true)} style={{
          background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '50px',
          padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '13px', fontWeight: 700, color: '#111',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)', cursor: 'pointer', backdropFilter: 'blur(8px)',
        }}>
          <span>☰</span> 선점하기 · 정보
        </button>
        <button onClick={() => setSearchOpen(true)} style={{
          background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '50%',
          width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', cursor: 'pointer', backdropFilter: 'blur(8px)',
        }}>🔍</button>
      </div>

      {/* 우측 하단: 구 이름 토글 */}
      <button onClick={() => setShowGuNames(v => !v)} style={{
        position: 'absolute', bottom: '28px', right: '16px', zIndex: 10,
        width: '44px', height: '44px', borderRadius: '50%',
        background: showGuNames ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.45)',
        border: 'none', fontSize: '20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)', cursor: 'pointer', backdropFilter: 'blur(8px)',
        transition: 'background 0.2s',
        filter: showGuNames ? 'none' : 'grayscale(1) opacity(0.7)',
      }}>👁</button>

      {/* 딤 */}
      <div onClick={() => setPanelOpen(false)} style={{
        position: 'absolute', inset: 0, zIndex: 19,
        background: 'rgba(0,0,0,0.4)',
        opacity: panelOpen ? 1 : 0,
        pointerEvents: panelOpen ? 'auto' : 'none',
        transition: 'opacity 0.3s',
      }} />

      {/* 좌측 슬라이드 패널 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: 'min(320px, 82vw)', zIndex: 20,
        background: '#fff', boxShadow: '4px 0 30px rgba(0,0,0,0.18)',
        transform: panelOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
        overflowY: 'auto',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 18px 16px', borderBottom: '1px solid #f0f0f0',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '0.08em', color: '#111' }}>한칸서울</span>
          <button onClick={() => setPanelOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#bbb', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: '20px 18px 48px' }}>
          <div style={{ background: '#fff5f5', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #fdd' }}>
            <p style={{ fontSize: '13px', fontWeight: 900, color: '#e63946', marginBottom: '6px' }}>🗺️ 한칸서울이 뭔가요?</p>
            <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.75, wordBreak: 'keep-all' }}>
              서울 지도 위 <b style={{ color: '#111' }}>423개 동</b>을 광고판으로 만든 프로젝트예요.
              원하는 동을 선점하면 <b style={{ color: '#111' }}>내 브랜드·가게 이미지</b>가 그 동 모양 그대로 지도에 박혀요.
              지도가 채워질수록 SNS에서 화제가 됩니다.
            </p>
          </div>

          <p style={{ fontSize: '11px', fontWeight: 700, color: '#999', letterSpacing: '0.08em', marginBottom: '10px' }}>💰 가격</p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <PriceBadge label="일반 칸" price="10,000원" sub="서울 423개 동 · 1달" />
            <PriceBadge label="⭐ 프리미엄" price="30,000원" sub="홍대·강남 등 · 1달" accent />
          </div>

          <p style={{ fontSize: '11px', fontWeight: 700, color: '#999', letterSpacing: '0.08em', marginBottom: '12px' }}>📌 어떻게 선점하나요?</p>
          <div style={{ marginBottom: '24px' }}>
            <Step n="1" text="지도에서 원하는 동 클릭" />
            <Step n="2" text="브랜드명 · 소개 · 이미지 등록" />
            <Step n="3" text="계좌이체로 결제" />
            <Step n="4" text="확인 후 지도에 내 이미지 등록!" />
          </div>

          <div style={{ background: '#f8f8f8', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px', border: '1px solid #eee' }}>
            <p style={{ fontSize: '13px', fontWeight: 900, color: '#111', marginBottom: '6px' }}>📸 이미지는 어떻게 나오나요?</p>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.75, wordBreak: 'keep-all' }}>
              등록한 이미지가 해당 동의 <b style={{ color: '#111' }}>행정구역 모양 그대로</b> 지도 위에 표시돼요.
              서울 지도 전체가 브랜드 이미지 콜라주로 채워지는 효과입니다.
            </p>
          </div>

          <p style={{ fontSize: '11px', fontWeight: 700, color: '#e63946', letterSpacing: '0.1em', marginBottom: '10px' }}>⭐ 프리미엄 스팟 (14곳)</p>
          <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px', lineHeight: 1.6, wordBreak: 'keep-all' }}>
            홍대·강남 등 핫한 동네는 빨간 테두리로 지도에서 가장 눈에 띄어요.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
            {Object.entries(PREMIUM_DONG_LABELS).map(([code, label]) => (
              <span key={code} style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, border: '1.5px solid #e63946', color: '#e63946' }}>{label}</span>
            ))}
          </div>

          <p style={{ fontSize: '11px', fontWeight: 700, color: '#999', letterSpacing: '0.08em', marginBottom: '10px' }}>🗺️ 지도 범례</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
            {[
              { color: '#e2e4e8', border: '1px solid #c8cace', label: '빈 칸 — 아직 아무도 선점 안 한 동' },
              { color: '#4a6fa5', label: '점령 완료 — 누군가의 브랜드가 박혀 있어요' },
              { color: '#e2e4e8', border: '1.5px dashed #e63946', label: '⭐ 프리미엄 — 서울의 핫플레이스 동네' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: l.color, border: l.border || 'none', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: '#666' }}>{l.label}</span>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: '11px', color: '#ddd' }}>
            © 2026 한칸서울 &nbsp;·&nbsp;
            <a href="/admin" style={{ color: '#ddd', textDecoration: 'none' }}>관리자</a>
          </p>
        </div>
      </div>

      {modalTarget && <PurchaseModal target={modalTarget} onClose={() => setModalTarget(null)} />}
      {searchOpen && (
        <DongSearch
          dongList={mapApi?.dongList || []}
          dongSquares={dongSquares}
          onSelect={(item) => {
            setSearchOpen(false);
            mapApi?.focusDong(item.code);
            setTimeout(() => {
              setModalTarget({ code: item.code, name: item.name, existing: dongSquares[item.code] || null, isPremium: false });
            }, 700);
          }}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}

function DongSearch({ dongList, dongSquares, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef();
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);
  const filtered = query.trim() ? dongList.filter(d => d.name.includes(query.trim())).slice(0, 30) : [];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', maxHeight: '75vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -4px 30px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f5f5', borderRadius: '12px', padding: '10px 14px' }}>
            <span style={{ fontSize: '16px' }}>🔍</span>
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
              placeholder="동 이름으로 검색 (예: 홍대, 강남, 잠실)"
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '14px', outline: 'none', color: '#111' }} />
            {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#aaa' }}>✕</button>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '13px', color: '#aaa', cursor: 'pointer', fontWeight: 600 }}>취소</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '10px 8px 32px' }}>
          {!query.trim() && <p style={{ textAlign: 'center', color: '#bbb', fontSize: '13px', padding: '32px 0' }}>동 이름을 입력하세요</p>}
          {query.trim() && filtered.length === 0 && <p style={{ textAlign: 'center', color: '#bbb', fontSize: '13px', padding: '32px 0' }}>검색 결과가 없어요</p>}
          {filtered.map(item => {
            const sq = dongSquares[item.code];
            const isConfirmed = sq?.status === 'confirmed';
            return (
              <button key={item.code} onClick={() => onSelect(item)} style={{
                width: '100%', padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'none', border: 'none', cursor: 'pointer', borderRadius: '10px', textAlign: 'left',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', flexShrink: 0, background: isConfirmed ? '#4a6fa5' : '#e2e4e8', border: isConfirmed ? 'none' : '1px solid #c8cace' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>{item.name}</span>
                </div>
                <span style={{ fontSize: '11px', color: isConfirmed ? '#4a6fa5' : '#bbb', fontWeight: 700 }}>
                  {isConfirmed ? '점령 중' : '선점 가능'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PriceBadge({ label, price, sub, accent }) {
  return (
    <div style={{
      flex: 1, padding: '11px 12px',
      border: accent ? '1.5px solid #e63946' : '1px solid #eee',
      borderRadius: '10px', background: accent ? '#fff5f5' : '#fafafa',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, color: accent ? '#e63946' : '#111' }}>{label}</p>
        <p style={{ fontSize: '10px', color: '#bbb', marginTop: '1px' }}>{sub}</p>
      </div>
      <p style={{ fontSize: '15px', fontWeight: 900, color: accent ? '#e63946' : '#111', letterSpacing: '-0.02em' }}>{price}</p>
    </div>
  );
}

function Step({ n, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
      <span style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, background: '#e63946', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900 }}>{n}</span>
      <span style={{ fontSize: '13px', color: '#555' }}>{text}</span>
    </div>
  );
}

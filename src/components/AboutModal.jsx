import { PREMIUM_DONG_LABELS } from '../data/mockData';

export default function AboutModal({ onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'flex-end',
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: '100%',
        maxHeight: '88vh',
        background: '#111',
        borderRadius: '20px 20px 0 0',
        overflowY: 'auto',
        padding: '0 0 40px',
      }}>
        {/* 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: '36px', height: '4px', background: '#2a2a2a', borderRadius: '2px' }} />
        </div>

        {/* 헤더 */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px 20px',
          borderBottom: '1px solid #1a1a1a',
        }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '22px', color: '#fff', letterSpacing: '0.06em',
          }}>ABOUT</span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#555',
            fontSize: '20px', cursor: 'pointer', lineHeight: 1,
          }}>✕</button>
        </div>

        <div style={{ padding: '0 20px' }}>

          <Section num="01" title="뭔 프로젝트야?">
            2005년 밀리언달러홈페이지에서 영감받음.<br />
            서울 <b style={{ color: '#fff' }}>423개 동</b> 전체가 각각 하나의 광고 칸.<br />
            지도가 채워지면 SNS에서 바이럴.
          </Section>

          <Section num="02" title="어떻게 사?">
            <Step n="1" text="지도에서 원하는 동 클릭" />
            <Step n="2" text="브랜드명 · 소개 · 이미지 입력" />
            <Step n="3" text="계좌이체" />
            <Step n="4" text="확인 후 24시간 내 지도 등록" />
          </Section>

          <Section num="03" title="이미지 어떻게 나와?">
            이미지 등록하면 동 모양 그대로 지도에 박힘.<br />
            서울 지도가 브랜드 콜라주로 채워지는 효과.<br />
            프리미엄은 빨간 빤짝이 테두리로 더 눈에 띔.
          </Section>

          <Section num="04" title="무슨 효과야?">
            지도 채워질수록 화제됨.<br />
            캡처해서 릴스 올리면 바이럴 시작.<br />
            <b style={{ color: '#e63946' }}>홍대 · 강남 · 이태원</b> 등 프리미엄 스팟은<br />
            서울에서 가장 핫한 위치에 2주간 박힘.
          </Section>

          {/* 프리미엄 스팟 */}
          <div style={{ marginTop: '8px', paddingBottom: '8px' }}>
            <p style={{
              fontSize: '10px', color: '#e63946', fontWeight: 700,
              letterSpacing: '0.12em', marginBottom: '12px',
            }}>⭐ PREMIUM SPOTS</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(PREMIUM_DONG_LABELS).map(([code, label]) => (
                <span key={code} style={{
                  padding: '6px 14px', borderRadius: '20px',
                  fontSize: '13px', fontWeight: 700,
                  border: '1.5px solid #e63946', color: '#e63946',
                  background: 'transparent',
                }}>{label}</span>
              ))}
            </div>
          </div>

          {/* 가격 */}
          <div style={{ marginTop: '28px', display: 'flex', gap: '8px' }}>
            <PriceBadge label="일반 칸" price="10,000원" sub="2주 게시" />
            <PriceBadge label="⭐ 프리미엄" price="30,000원" sub="2주 · 강조효과" accent />
          </div>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#333' }}>
            <a href="/admin" style={{ color: '#333', textDecoration: 'none' }}>관리자</a>
          </p>

        </div>
      </div>
    </div>
  );
}

function Section({ num, title, children }) {
  return (
    <div style={{ paddingTop: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '12px', color: '#e63946', letterSpacing: '0.1em',
        }}>{num}</span>
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{title}</h3>
      </div>
      <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.85 }}>{children}</p>
      <div style={{ height: '1px', background: '#1a1a1a', marginTop: '28px' }} />
    </div>
  );
}

function Step({ n, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
      <span style={{
        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
        background: '#e63946', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 900,
      }}>{n}</span>
      <span style={{ fontSize: '14px', color: '#888' }}>{text}</span>
    </div>
  );
}

function PriceBadge({ label, price, sub, accent }) {
  return (
    <div style={{
      flex: 1, padding: '12px 14px',
      border: accent ? '1.5px solid #e63946' : '1px solid #1e1e1e',
      borderRadius: '10px',
      background: accent ? 'rgba(230,57,70,0.07)' : '#1a1a1a',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <p style={{ fontSize: '12px', fontWeight: 700, color: accent ? '#e63946' : '#fff' }}>{label}</p>
        <p style={{ fontSize: '10px', color: '#444', marginTop: '2px' }}>{sub}</p>
      </div>
      <p style={{ fontSize: '17px', fontWeight: 900, color: accent ? '#e63946' : '#fff', letterSpacing: '-0.02em' }}>
        {price}
      </p>
    </div>
  );
}

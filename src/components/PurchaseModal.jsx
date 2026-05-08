import { useState, useRef, useEffect } from 'react';
import { useSquares } from '../context/SquaresContext';
import { PREMIUM_DONG_LABELS } from '../data/mockData';
import Compressor from 'compressorjs';

const ACCOUNT = '카카오뱅크 3333-12-3456789 (예금주: 한칸서울)';
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px', background: 'rgba(0,0,0,0.45)',
  },
  modal: {
    position: 'relative', width: '100%', maxWidth: '460px',
    background: '#fff', borderRadius: '16px',
    border: '1px solid #e8e2d9', padding: '28px',
    boxShadow: '0 8px 60px rgba(0,0,0,0.18)',
    maxHeight: '90vh', overflowY: 'auto',
  },
  close: {
    position: 'absolute', top: '16px', right: '18px',
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '18px', color: '#bbb', lineHeight: 1,
  },
  label: { fontSize: '11px', color: '#999', marginBottom: '4px', fontWeight: 600 },
  input: {
    width: '100%', padding: '9px 12px', fontSize: '13px',
    border: '1px solid #e0dbd4', borderRadius: '8px',
    outline: 'none', color: '#111', background: '#faf9f7',
    marginBottom: '10px',
  },
  btn: (accent) => ({
    width: '100%', padding: '12px', fontSize: '14px', fontWeight: 700,
    border: 'none', borderRadius: '10px', cursor: 'pointer',
    background: accent ? '#e63946' : '#f5f2ee',
    color: accent ? '#fff' : '#666',
  }),
};

function compressImage(file) {
  return new Promise((resolve, reject) => {
    new Compressor(file, { quality: 0.7, maxWidth: 400, maxHeight: 400, success: resolve, error: reject });
  });
}

function useCountdown(createdAt) {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    if (!createdAt) return;
    const end = new Date(createdAt).getTime() + TWO_WEEKS_MS;
    function tick() {
      const diff = end - Date.now();
      if (diff <= 0) { setRemaining('만료됨'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(`${d}일 ${h}시간 ${m}분 후 해제`);
    }
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [createdAt]);
  return remaining;
}

function SquareViewer({ target, onClose }) {
  const sq = target.existing;
  const createdAt = sq.createdAt || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const remaining = useCountdown(createdAt);
  const displayName = PREMIUM_DONG_LABELS[target.code] || target.name;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        {target.isPremium && (
          <span style={{
            display: 'inline-block', background: '#fffbea', color: '#b8860b',
            fontSize: '10px', fontWeight: 700, padding: '3px 10px',
            borderRadius: '20px', border: '1px solid #ffd700', marginBottom: '8px',
          }}>⭐ 프리미엄 스팟</span>
        )}
        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#111', letterSpacing: '-0.03em' }}>
          {displayName}
        </h2>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '6px',
          padding: '4px 10px', background: '#f5f2ee', borderRadius: '20px',
          fontSize: '11px', color: '#888',
        }}>
          ⏱ {remaining || '계산 중...'}
        </div>
      </div>

      <div style={{ border: '1px solid #e8e2d9', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
        {sq.imageUrl && (
          <div style={{ width: '100%', height: '160px', overflow: 'hidden' }}>
            <img src={sq.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            {sq.imageUrl && (
              <img src={sq.imageUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            )}
            <div>
              <p style={{ fontSize: '15px', fontWeight: 900, color: '#111' }}>{sq.ownerName}</p>
              <p style={{ fontSize: '12px', color: '#888' }}>{sq.description}</p>
            </div>
          </div>
          {sq.message && (
            <div style={{
              background: '#faf9f7', borderRadius: '8px', padding: '10px 12px',
              fontSize: '13px', color: '#444', lineHeight: 1.6,
              whiteSpace: 'pre-line', marginBottom: '10px',
              borderLeft: '3px solid #e63946',
            }}>
              {sq.message}
            </div>
          )}
          {sq.link && (
            <a href={sq.link} target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#e63946', textDecoration: 'none', fontWeight: 600 }}>
              🔗 바로가기
            </a>
          )}
        </div>
      </div>

      <div style={{ background: '#faf9f7', border: '1px solid #e8e2d9', borderRadius: '8px', padding: '10px 14px', fontSize: '11px', color: '#aaa', marginBottom: '16px' }}>
        이 칸은 현재 점령 중입니다. 점령이 해제되면 선점할 수 있습니다.
      </div>
      <button style={S.btn(false)} onClick={onClose}>닫기</button>
    </div>
  );
}

export default function PurchaseModal({ target, onClose }) {
  const { purchaseDong } = useSquares();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ ownerName: '', description: '', message: '', link: '', depositorName: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const price = target.isPremium ? 30000 : 10000;
  const isAlreadyPurchased = target.existing?.status === 'confirmed';
  const displayName = PREMIUM_DONG_LABELS[target.code] || target.name;

  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setImageFile(compressed);
    setImagePreview(URL.createObjectURL(compressed));
  }

  async function handleSubmit() {
    setLoading(true);
    let imageUrl = imagePreview || '';
    const data = { ...form, imageUrl, name: displayName };
    purchaseDong(target.code, data);
    setLoading(false);
    setStep(3);
  }

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <button style={S.close} onClick={onClose}>✕</button>

        {isAlreadyPurchased && <SquareViewer target={target} onClose={onClose} />}

        {!isAlreadyPurchased && step === 1 && (
          <>
            <div style={{ marginBottom: '20px' }}>
              {target.isPremium && (
                <span style={{
                  display: 'inline-block', background: '#fffbea', color: '#b8860b',
                  fontSize: '10px', fontWeight: 700, padding: '3px 10px',
                  borderRadius: '20px', border: '1px solid #ffd700', marginBottom: '8px',
                }}>⭐ 프리미엄 스팟</span>
              )}
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#111', letterSpacing: '-0.03em' }}>
                {displayName} 선점하기
              </h2>
            </div>
            <StepBar current={1} />

            <div style={{ display: 'flex', gap: '14px', marginBottom: '12px', alignItems: 'flex-start' }}>
              <div onClick={() => fileRef.current?.click()} style={{
                width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
                border: '2px dashed #ddd', background: '#faf9f7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden', fontSize: '20px',
              }}>
                {imagePreview ? <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📷'}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              </div>
              <div style={{ flex: 1 }}>
                <input style={S.input} placeholder="이름 / 브랜드명 *" value={form.ownerName} maxLength={30}
                  onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} />
                <input style={S.input} placeholder="한 줄 소개 *" value={form.description} maxLength={40}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>

            <textarea style={{ ...S.input, resize: 'none', height: '72px' }}
              placeholder="메시지 (최대 3줄)" rows={3} value={form.message} maxLength={150}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
            <input style={S.input} placeholder="링크 URL (선택)" value={form.link}
              onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#faf9f7', border: '1px solid #e8e2d9',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
            }}>
              <div>
                <span style={{ fontSize: '12px', color: '#999' }}>결제 금액</span>
                <span style={{ fontSize: '11px', color: '#bbb', marginLeft: '8px' }}>2주 게시</span>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#e63946' }}>{price.toLocaleString()}원</span>
            </div>

            <button style={{ ...S.btn(true), opacity: (!form.ownerName.trim() || !form.description.trim()) ? 0.4 : 1 }}
              disabled={!form.ownerName.trim() || !form.description.trim()}
              onClick={() => setStep(2)}>
              다음 →
            </button>
          </>
        )}

        {!isAlreadyPurchased && step === 2 && (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#111', letterSpacing: '-0.03em', marginBottom: '20px' }}>계좌이체 안내</h2>
            <StepBar current={2} />

            <div style={{ background: '#faf9f7', border: '1px solid #e8e2d9', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
              <p style={S.label}>입금 계좌</p>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#111', fontFamily: 'monospace' }}>{ACCOUNT}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div style={{ background: '#faf9f7', border: '1px solid #e8e2d9', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <p style={S.label}>입금 금액</p>
                <p style={{ fontSize: '18px', fontWeight: 900, color: '#e63946' }}>{price.toLocaleString()}원</p>
              </div>
              <div style={{ background: '#faf9f7', border: '1px solid #e8e2d9', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <p style={S.label}>입금자명</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#e63946' }}>{displayName}{form.ownerName}</p>
              </div>
            </div>

            <div style={{ background: '#fff8f0', border: '1px solid #f4dfc0', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px' }}>
              <p style={{ fontSize: '11px', color: '#c47a1e', lineHeight: 1.6 }}>
                입금자명을 <strong>{displayName}{form.ownerName}</strong>으로 입력해주세요.<br />
                확인 후 24시간 이내 지도에 등록됩니다.
              </p>
            </div>

            <input style={S.input} placeholder={`입금자명 (예: ${displayName}${form.ownerName})`}
              value={form.depositorName}
              onChange={e => setForm(f => ({ ...f, depositorName: e.target.value }))} />

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button style={{ ...S.btn(false), flex: 1, width: 'auto', padding: '12px 20px' }} onClick={() => setStep(1)}>← 이전</button>
              <button style={{ ...S.btn(true), flex: 2, opacity: (!form.depositorName.trim() || loading) ? 0.4 : 1 }}
                disabled={!form.depositorName.trim() || loading}
                onClick={handleSubmit}>
                {loading ? '처리 중...' : '신청 완료'}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ fontSize: '40px', marginBottom: '14px' }} className="float-anim">✅</p>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#111', marginBottom: '8px' }}>신청 완료!</h2>
            <p style={{ fontSize: '13px', color: '#777', marginBottom: '6px' }}>입금 확인 후 관리자가 직접 지도에 등록합니다.</p>
            <p style={{ fontSize: '12px', color: '#bbb', marginBottom: '20px' }}>보통 수 시간 내 처리됩니다.</p>
            <button style={S.btn(true)} onClick={onClose}>지도로 돌아가기</button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepBar({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
      {[1, 2, 3].map(n => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 700,
            background: n < current ? '#e63946' : n === current ? '#111' : '#eee',
            color: n <= current ? '#fff' : '#bbb',
          }}>
            {n < current ? '✓' : n}
          </div>
          {n < 3 && <div style={{ width: '20px', height: '2px', background: n < current ? '#e63946' : '#eee', borderRadius: '2px' }} />}
        </div>
      ))}
      <span style={{ fontSize: '11px', color: '#bbb', marginLeft: '4px' }}>
        {current === 1 ? '정보 입력' : current === 2 ? '결제 안내' : '완료'}
      </span>
    </div>
  );
}

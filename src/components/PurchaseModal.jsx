import { useState, useRef, useEffect } from 'react';
import { useSquares } from '../context/SquaresContext';
import { PREMIUM_DONG_LABELS } from '../data/mockData';
import { submitDongSquare, uploadImage as uploadImageApi } from '../api/index';
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

// 외부 링크 이동 전 확인 팝업
function ExternalLinkModal({ url, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '14px',
        padding: '24px', width: '100%', maxWidth: '340px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
      }}>
        <p style={{ fontSize: '16px', fontWeight: 900, color: '#111', marginBottom: '6px' }}>외부 링크로 이동합니다</p>
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px', lineHeight: 1.6 }}>
          아래 주소로 연결됩니다.<br />신뢰할 수 있는 사이트인지 확인 후 이동하세요.
        </p>
        <div style={{
          background: '#f5f5f5', borderRadius: '8px',
          padding: '10px 12px', marginBottom: '18px',
          fontSize: '11px', color: '#555',
          wordBreak: 'break-all', lineHeight: 1.6,
          border: '1px solid #e8e8e8',
        }}>
          🔗 {url}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '11px', fontSize: '13px', fontWeight: 600,
            background: '#f5f5f5', color: '#888',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
          }}>취소</button>
          <button onClick={onConfirm} style={{
            flex: 2, padding: '11px', fontSize: '13px', fontWeight: 700,
            background: '#111', color: '#fff',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
          }}>이동하기</button>
        </div>
      </div>
    </div>
  );
}

function SquareViewer({ target, onClose }) {
  const sq = target.existing;
  const createdAt = sq.createdAt || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const remaining = useCountdown(createdAt);
  const displayName = PREMIUM_DONG_LABELS[target.code] || target.name;
  const [linkModal, setLinkModal] = useState(false);

  return (
    <div style={{ margin: '-28px', borderRadius: '16px', overflow: 'hidden' }}>
      {/* 풀와이드 이미지 */}
      <div style={{ position: 'relative', width: '100%', height: '220px', background: '#111', overflow: 'hidden' }}>
        {sq.imageUrl
          ? <img src={sq.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#111' }} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }} />
        }
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)',
        }} />
        <button onClick={onClose} style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%',
          width: '32px', height: '32px', color: '#fff', fontSize: '14px',
          cursor: 'pointer', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
        <div style={{ position: 'absolute', bottom: '14px', left: '16px', right: '16px' }}>
          {target.isPremium && (
            <span style={{
              fontSize: '10px', fontWeight: 700, color: '#ffd700',
              background: 'rgba(0,0,0,0.5)', padding: '2px 8px',
              borderRadius: '20px', border: '1px solid rgba(255,215,0,0.4)',
              marginBottom: '4px', display: 'inline-block',
            }}>⭐ 프리미엄 스팟</span>
          )}
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>{displayName}</p>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {sq.ownerName}
          </h2>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div style={{ padding: '20px 20px 24px', background: '#fff' }}>
        <p style={{ fontSize: '14px', color: '#555', marginBottom: '12px', lineHeight: 1.6 }}>
          {sq.description}
        </p>

        {sq.message && (
          <div style={{
            background: '#f8f8f8', borderRadius: '10px',
            padding: '12px 14px', marginBottom: '16px',
            borderLeft: '3px solid #e63946',
            fontSize: '13px', color: '#333', lineHeight: 1.7,
            whiteSpace: 'pre-line',
          }}>
            {sq.message}
          </div>
        )}

        {/* CTA 버튼 - 클릭 시 확인 팝업 */}
        {sq.link && (
          <button
            onClick={() => setLinkModal(true)}
            style={{
              display: 'block', width: '100%',
              padding: '13px', marginBottom: '12px',
              background: '#111', color: '#fff',
              borderRadius: '10px', textAlign: 'center',
              fontSize: '14px', fontWeight: 700,
              border: 'none', cursor: 'pointer',
              letterSpacing: '0.02em', boxSizing: 'border-box',
            }}
          >
            🔗 바로가기
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: '#bbb' }}>⏱ {remaining || '계산 중...'}</span>
          <button onClick={onClose} style={{
            padding: '8px 18px', fontSize: '12px', fontWeight: 600,
            background: '#f5f5f5', color: '#888',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
          }}>닫기</button>
        </div>
      </div>

      {/* 외부 링크 확인 팝업 */}
      {linkModal && (
        <ExternalLinkModal
          url={sq.link}
          onConfirm={() => { window.open(sq.link, '_blank', 'noopener,noreferrer'); setLinkModal(false); }}
          onCancel={() => setLinkModal(false)}
        />
      )}
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
  const [error, setError] = useState('');
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
    setError('');
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImageApi(imageFile);
      }
      await submitDongSquare({
        dongCode: target.code,
        name: displayName,
        isPremium: target.isPremium || false,
        ownerName: form.ownerName,
        description: form.description,
        message: form.message || '',
        link: form.link || '',
        imageUrl,
        depositorName: form.depositorName,
      });
      setStep(3);
    } catch (e) {
      console.error('신청 실패', e);
      setError(e.message || '신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>

        {isAlreadyPurchased && <SquareViewer target={target} onClose={onClose} />}

        {!isAlreadyPurchased && (
          <button style={S.close} onClick={onClose}>✕</button>
        )}

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
                border: imagePreview ? '2px solid #e63946' : '2px dashed #e63946',
                background: '#fff5f5',
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

            <button style={{ ...S.btn(true), opacity: (!form.ownerName.trim() || !form.description.trim() || !imageFile) ? 0.4 : 1 }}
              disabled={!form.ownerName.trim() || !form.description.trim() || !imageFile}
              onClick={() => setStep(2)}>
              다음 →
            </button>
            {!imageFile && (
              <p style={{ fontSize: '11px', color: '#e63946', textAlign: 'center', marginTop: '8px' }}>📷 이미지를 등록해야 다음으로 넘어갈 수 있어요</p>
            )}
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

            {error && (
              <div style={{ background: '#fff5f5', border: '1px solid #fcc', borderRadius: '8px', padding: '10px 14px', marginBottom: '10px', fontSize: '12px', color: '#e63946' }}>
                {error}
              </div>
            )}

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

        {!isAlreadyPurchased && step === 3 && (
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

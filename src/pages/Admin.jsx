import { useState } from 'react';
import { fetchAdminPending, confirmSquare, rejectSquare } from '../api/index';

const S = {
  input: {
    width: '100%', padding: '10px 14px', fontSize: '14px',
    border: '1px solid #e0dbd4', borderRadius: '9px',
    outline: 'none', color: '#111', background: '#faf9f7',
    marginBottom: '12px',
  },
  btn: (accent) => ({
    padding: '8px 18px', fontSize: '13px', fontWeight: 700,
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    background: accent === 'confirm' ? '#e63946' : accent === 'reject' ? '#f5f2ee' : '#111',
    color: accent === 'reject' ? '#999' : '#fff',
  }),
};

export default function Admin() {
  const [pw, setPw] = useState('');
  const [authed, setAuthed] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    if (!pw.trim()) return;
    sessionStorage.setItem('admin_pw', pw);
    await load(pw);
    setAuthed(true);
  }

  async function load(password) {
    setLoading(true);
    try {
      const data = await fetchAdminPending(password);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(id) {
    await confirmSquare(id, sessionStorage.getItem('admin_pw'));
    setItems(prev => prev.filter(i => i.id !== id));
  }

  async function handleReject(id) {
    await rejectSquare(id, sessionStorage.getItem('admin_pw'));
    setItems(prev => prev.filter(i => i.id !== id));
  }

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={handleLogin} style={{
          width: '320px', background: '#fff', border: '1px solid #e8e2d9',
          borderRadius: '14px', padding: '32px',
          boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
        }}>
          <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#111', marginBottom: '20px', letterSpacing: '-0.03em' }}>
            관리자
          </h1>
          <input
            type="password"
            placeholder="비밀번호"
            value={pw}
            onChange={e => setPw(e.target.value)}
            style={S.input}
          />
          <button type="submit" style={{ ...S.btn(false), width: '100%', padding: '11px' }}>
            로그인
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f2ee', padding: '32px 20px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#111', letterSpacing: '-0.03em' }}>
            입금 대기 목록
          </h1>
          <button onClick={() => load(sessionStorage.getItem('admin_pw'))} style={S.btn(false)}>
            새로고침
          </button>
        </div>

        {loading && <p style={{ color: '#999', fontSize: '13px' }}>로딩 중...</p>}

        {!loading && items.length === 0 && (
          <div style={{
            background: '#fff', border: '1px solid #e8e2d9', borderRadius: '12px',
            padding: '40px', textAlign: 'center', color: '#bbb', fontSize: '13px',
          }}>
            대기 중인 항목 없음 ✅
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map(item => (
            <div key={item.id} style={{
              background: '#fff', border: '1px solid #e8e2d9',
              borderRadius: '12px', padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              {item.imageUrl && (
                <img src={item.imageUrl} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>{item.name}</span>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, color: '#e63946',
                    background: '#fff5f5', padding: '2px 8px',
                    borderRadius: '20px', border: '1px solid #f4c0c4',
                  }}>
                    {item.guCode ? '구 칸' : '프리미엄'}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#888' }}>광고주: {item.ownerName} · 입금자: {item.depositorName}</p>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer"
                    style={{ fontSize: '12px', color: '#e63946' }}>{item.link}</a>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button onClick={() => handleConfirm(item.id)} style={S.btn('confirm')}>확인 ✓</button>
                <button onClick={() => handleReject(item.id)} style={S.btn('reject')}>거절</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

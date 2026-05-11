import { useState } from 'react';
import { fetchAdminPending, confirmSquare, rejectSquare } from '../api/index';

const BASE = import.meta.env.VITE_API_URL || '';

const API = {
  async getSquares(pw) {
    const r = await fetch(`${BASE}/api/admin/squares`, { headers: { 'X-Admin-Password': encodeURIComponent(pw) } });
    return r.json();
  },
  async getStats(pw) {
    const r = await fetch(`${BASE}/api/admin/stats`, { headers: { 'X-Admin-Password': encodeURIComponent(pw) } });
    return r.json();
  },
  async getExpired(pw) {
    const r = await fetch(`${BASE}/api/admin/expired`, { headers: { 'X-Admin-Password': encodeURIComponent(pw) } });
    return r.json();
  },
  async forceDelete(dongCode, pw) {
    const r = await fetch(`${BASE}/api/admin/square/${dongCode}`, {
      method: 'DELETE', headers: { 'X-Admin-Password': encodeURIComponent(pw) },
    });
    return r.json();
  },
};

const TABS = ['대기', '활성', '만료', '통계'];

const S = {
  input: {
    width: '100%', padding: '11px 14px', fontSize: '14px',
    border: '1px solid #e0e0e0', borderRadius: '9px',
    outline: 'none', color: '#111', background: '#fafafa',
    marginBottom: '12px',
  },
};

function Badge({ label, color }) {
  const colors = {
    red:    { bg: '#fff5f5', border: '#fcc', text: '#e63946' },
    green:  { bg: '#f0fff4', border: '#b7ebc8', text: '#1a8f3f' },
    orange: { bg: '#fff8f0', border: '#fddcb5', text: '#d97706' },
    gray:   { bg: '#f5f5f5', border: '#e0e0e0', text: '#888' },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      fontSize: '10px', fontWeight: 700,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      padding: '2px 8px', borderRadius: '20px',
    }}>{label}</span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      flex: 1, minWidth: '120px',
      background: accent ? '#fff5f5' : '#fff',
      border: accent ? '1.5px solid #e63946' : '1px solid #eee',
      borderRadius: '12px', padding: '16px',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: '11px', color: '#aaa', marginBottom: '6px' }}>{label}</p>
      <p style={{ fontSize: '26px', fontWeight: 900, color: accent ? '#e63946' : '#111', letterSpacing: '-0.02em' }}>{value ?? '-'}</p>
      {sub && <p style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>{sub}</p>}
    </div>
  );
}

function RemainingBadge({ expiresAt }) {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt) - new Date();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) return <Badge label="만료됨" color="gray" />;
  if (days <= 3) return <Badge label={`D-${days}`} color="red" />;
  return <Badge label={`D-${days}`} color="green" />;
}

export default function Admin() {
  const [pw, setPw] = useState('');
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState('대기');
  const [pending, setPending] = useState([]);
  const [squares, setSquares] = useState([]);
  const [expired, setExpired] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const [loginError, setLoginError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    if (!pw.trim()) return;
    setLoading(true);
    setLoginError('');
    try {
      // 비밀번호 검증 - pending 조회 시도
      const result = await fetchAdminPending(pw);
      // 배열이 오면 인증 성공
      if (Array.isArray(result)) {
        sessionStorage.setItem('admin_pw', pw);
        setPending(result);
        setAuthed(true);
        await loadAll(pw);
      } else {
        setLoginError('비밀번호가 올바르지 않습니다.');
      }
    } catch (e) {
      setLoginError('비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function loadAll(password) {
    const p = password || sessionStorage.getItem('admin_pw');
    setLoading(true);
    try {
      const [pend, sq, exp, st] = await Promise.all([
        fetchAdminPending(p),
        API.getSquares(p),
        API.getExpired(p),
        API.getStats(p),
      ]);
      setPending(Array.isArray(pend) ? pend : []);
      setSquares(Array.isArray(sq) ? sq : []);
      setExpired(Array.isArray(exp) ? exp : []);
      setStats(st);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(id) {
    await confirmSquare(id, sessionStorage.getItem('admin_pw'));
    setPending(prev => prev.filter(i => i.id !== id));
    await loadAll();
  }

  async function handleReject(id) {
    await rejectSquare(id, sessionStorage.getItem('admin_pw'));
    setPending(prev => prev.filter(i => i.id !== id));
  }

  async function handleForceDelete(dongCode, name) {
    if (!confirm(`${name} 칸을 강제 초기화할까요?`)) return;
    await API.forceDelete(dongCode, sessionStorage.getItem('admin_pw'));
    await loadAll();
  }

  // ── 로그인 화면 ──
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', background: '#f7f7f7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Noto Sans KR', sans-serif",
      }}>
        <form onSubmit={handleLogin} style={{
          width: '320px', background: '#fff',
          border: '1px solid #eee', borderRadius: '16px',
          padding: '36px', boxShadow: '0 4px 30px rgba(0,0,0,0.07)',
        }}>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', letterSpacing: '0.1em', color: '#111', marginBottom: '4px' }}>한칸서울</p>
          <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '24px' }}>관리자 페이지</p>
          <input
            type="password" placeholder="비밀번호"
            value={pw} onChange={e => setPw(e.target.value)}
            style={S.input}
          />
          {loginError && (
            <p style={{ fontSize: '12px', color: '#e63946', marginBottom: '10px', marginTop: '-6px' }}>{loginError}</p>
          )}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px',
            background: '#111', color: '#fff', border: 'none',
            borderRadius: '9px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            opacity: loading ? 0.5 : 1,
          }}>{loading ? '확인 중...' : '로그인'}</button>
        </form>
      </div>
    );
  }

  // ── 관리자 대시보드 ──
  return (
    <div style={{
      minHeight: '100vh', background: '#f7f7f7',
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      {/* 헤더 */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #eee',
        padding: '14px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '0.08em', color: '#111' }}>한칸서울 관리자</span>
          <a href="/" style={{ fontSize: '12px', color: '#aaa', textDecoration: 'none' }}>← 지도로</a>
        </div>
        <button
          onClick={() => loadAll()}
          disabled={loading}
          style={{
            padding: '7px 14px', fontSize: '12px', fontWeight: 700,
            background: '#111', color: '#fff', border: 'none',
            borderRadius: '8px', cursor: 'pointer', opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? '로딩...' : '새로고침'}
        </button>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 16px' }}>

        {/* 탭 */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#eee', borderRadius: '10px', padding: '4px' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '8px 0', fontSize: '13px', fontWeight: 700,
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? '#111' : '#999',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}>
              {t}
              {t === '대기' && pending.length > 0 && (
                <span style={{
                  marginLeft: '5px', background: '#e63946', color: '#fff',
                  borderRadius: '50%', width: '16px', height: '16px',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', fontWeight: 900,
                }}>{pending.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── 대기 탭 ── */}
        {tab === '대기' && (
          <div>
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '14px' }}>
              입금 확인 후 승인하면 지도에 즉시 반영됩니다.
            </p>
            {pending.length === 0 ? (
              <Empty text="대기 중인 신청 없음 ✅" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pending.map(item => (
                  <PendingCard key={item.id} item={item} onConfirm={handleConfirm} onReject={handleReject} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 활성 탭 ── */}
        {tab === '활성' && (
          <div>
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '14px' }}>
              현재 지도에 표시 중인 모든 칸입니다.
            </p>
            {squares.length === 0 ? (
              <Empty text="활성 칸 없음" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {squares.map(item => (
                  <ActiveCard key={item.dongCode} item={item} onDelete={handleForceDelete} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 만료 탭 ── */}
        {tab === '만료' && (
          <div>
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '14px' }}>
              2주가 지나 자동 만료된 칸 목록입니다.
            </p>
            {expired.length === 0 ? (
              <Empty text="만료된 칸 없음" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {expired.map(item => (
                  <div key={item.dongCode} style={{
                    background: '#fff', border: '1px solid #eee',
                    borderRadius: '12px', padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    opacity: 0.7,
                  }}>
                    {item.imageUrl && <img src={item.imageUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>{item.name}</p>
                      <p style={{ fontSize: '12px', color: '#aaa' }}>{item.ownerName} · {new Date(item.createdAt).toLocaleDateString('ko-KR')} 만료</p>
                    </div>
                    <Badge label="만료" color="gray" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 통계 탭 ── */}
        {tab === '통계' && (
          <div>
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '16px' }}>실시간 현황</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
              <StatCard label="전체 동" value={stats?.total ?? 423} />
              <StatCard label="점령 완료" value={stats?.confirmed} accent />
              <StatCard label="대기 중" value={stats?.pending} sub="입금 확인 필요" />
              <StatCard label="만료됨" value={stats?.expired} />
              <StatCard label="빈 칸" value={stats?.empty} />
              <StatCard label="프리미엄 점령" value={stats?.premiumConfirmed} sub="/ 14" />
            </div>

            {/* 수익 */}
            <div style={{
              background: '#fff', border: '1.5px solid #e63946',
              borderRadius: '14px', padding: '20px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>총 수익 (예상)</p>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '36px', color: '#e63946', letterSpacing: '-0.02em' }}>
                {stats?.revenue ? `${stats.revenue.toLocaleString()}원` : '-'}
              </p>
              <p style={{ fontSize: '11px', color: '#ccc', marginTop: '4px' }}>일반 10,000원 · 프리미엄 30,000원 기준</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function PendingCard({ item, onConfirm, onReject }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #eee',
      borderRadius: '12px', padding: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {item.imageUrl && (
          <img src={item.imageUrl} alt="" style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#111' }}>{item.name}</span>
            <Badge label={item.isPremium ? '⭐ 프리미엄' : '일반'} color={item.isPremium ? 'red' : 'gray'} />
          </div>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>
            브랜드: <b style={{ color: '#111' }}>{item.ownerName}</b>
          </p>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>
            입금자명: <b style={{ color: '#e63946' }}>{item.depositorName}</b>
          </p>
          {item.description && <p style={{ fontSize: '12px', color: '#aaa' }}>{item.description}</p>}
          <p style={{ fontSize: '11px', color: '#ccc', marginTop: '4px' }}>
            신청: {new Date(item.createdAt).toLocaleString('ko-KR')}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          onClick={() => onConfirm(item.id)}
          style={{
            flex: 1, padding: '10px', fontSize: '13px', fontWeight: 700,
            background: '#e63946', color: '#fff', border: 'none',
            borderRadius: '8px', cursor: 'pointer',
          }}
        >✓ 입금 확인 · 지도 등록</button>
        <button
          onClick={() => onReject(item.id)}
          style={{
            padding: '10px 16px', fontSize: '13px', fontWeight: 700,
            background: '#f5f5f5', color: '#999', border: 'none',
            borderRadius: '8px', cursor: 'pointer',
          }}
        >거절</button>
      </div>
    </div>
  );
}

function ActiveCard({ item, onDelete }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #eee',
      borderRadius: '12px', padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      {item.imageUrl && (
        <img src={item.imageUrl} alt="" style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>{item.name}</span>
          <Badge label={item.isPremium ? '⭐ 프리미엄' : '일반'} color={item.isPremium ? 'red' : 'gray'} />
          <RemainingBadge expiresAt={item.expiresAt} />
        </div>
        <p style={{ fontSize: '12px', color: '#888' }}>
          {item.ownerName} · 등록 {new Date(item.createdAt).toLocaleDateString('ko-KR')}
          {item.expiresAt && ` · 만료 ${new Date(item.expiresAt).toLocaleDateString('ko-KR')}`}
        </p>
      </div>
      <button
        onClick={() => onDelete(item.dongCode, item.name)}
        style={{
          padding: '6px 12px', fontSize: '11px', fontWeight: 700,
          background: '#fff', color: '#ccc',
          border: '1px solid #eee', borderRadius: '7px', cursor: 'pointer',
        }}
      >초기화</button>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #eee', borderRadius: '12px',
      padding: '48px', textAlign: 'center', color: '#bbb', fontSize: '13px',
    }}>{text}</div>
  );
}

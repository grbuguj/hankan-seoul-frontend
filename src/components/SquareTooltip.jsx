export default function SquareTooltip({ x, y, name, data, isPremium }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x + 14,
        top: y - 12,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <div style={{
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        minWidth: '160px',
        maxWidth: '220px',
      }}>
        {isPremium && (
          <span style={{
            display: 'inline-block',
            background: '#fff5f5',
            color: '#e63946',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '20px',
            border: '1px solid #f4c0c4',
            marginBottom: '6px',
          }}>
            프리미엄 스팟
          </span>
        )}
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: data ? '6px' : 0 }}>
          {name}
        </p>
        {data ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {data.imageUrl && (
              <img
                src={data.imageUrl}
                alt=""
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
            )}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#333' }}>{data.ownerName}</p>
              <p style={{ fontSize: '10px', color: '#999' }}>{data.description}</p>
              {data.status === 'pending' && (
                <p style={{ fontSize: '10px', color: '#f4a261', marginTop: '2px' }}>입금 확인 중</p>
              )}
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '11px', color: '#aaa' }}>
            {isPremium ? '선점 가능' : '클릭해서 선점하기'}
          </p>
        )}
      </div>
    </div>
  );
}

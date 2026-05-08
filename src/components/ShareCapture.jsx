import { toPng } from 'html-to-image';
import { useState } from 'react';

export default function ShareCapture({ mapRef, dark }) {
  const [capturing, setCapturing] = useState(false);

  async function handleCapture() {
    if (!mapRef?.current) return;
    setCapturing(true);
    try {
      const dataUrl = await toPng(mapRef.current, { cacheBust: true, quality: 0.95 });
      const link = document.createElement('a');
      link.download = '한칸서울.png';
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
    }
    setCapturing(false);
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    alert('링크 복사 완료!');
  }

  const btnStyle = {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '6px 12px', fontSize: '12px', fontWeight: 500,
    background: dark ? '#1a1a1a' : '#fff',
    color: dark ? '#888' : '#555',
    border: dark ? '1px solid #2a2a2a' : '1px solid #ddd',
    borderRadius: '7px', cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button onClick={handleCapture} disabled={capturing} style={{ ...btnStyle, opacity: capturing ? 0.5 : 1 }}>
        {capturing ? '캡처 중...' : '캡처'}
      </button>
      <button onClick={handleCopyLink} style={btnStyle}>
        공유
      </button>
    </div>
  );
}

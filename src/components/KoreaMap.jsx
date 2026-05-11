import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3-geo';
import { zoom as d3zoom, zoomIdentity } from 'd3-zoom';
import { select } from 'd3-selection';
import { useSquares } from '../context/SquaresContext';
import { PREMIUM_DONG_CODES, PREMIUM_DONG_LABELS } from '../data/mockData';
import SquareTooltip from './SquareTooltip';

const W = 900;
const H = 660;

const COLOR = {
  empty:              '#e2e4e8',
  emptyStroke:        '#c8cace',
  hover:              '#d0d3d8',
  confirmed:          '#4a6fa5',
  confirmedStroke:    '#3a5a8a',
  premiumEmpty:       '#e2e4e8',
  premiumEmptyStroke: '#c8cace',
  premiumHover:       '#d0d3d8',
  guBorder:           '#9aa0a8',
  guLabel:            '#444',
};

const GU_NAMES = {
  '1101': '종로구', '1102': '중구',    '1103': '용산구',  '1104': '성동구',
  '1105': '광진구', '1106': '동대문구', '1107': '중랑구',  '1108': '성북구',
  '1109': '강북구', '1110': '도봉구',  '1111': '노원구',  '1112': '은평구',
  '1113': '서대문구','1114': '마포구',  '1115': '양천구',  '1116': '강서구',
  '1117': '구로구', '1118': '금천구',  '1119': '영등포구', '1120': '동작구',
  '1121': '관악구', '1122': '서초구',  '1123': '강남구',  '1124': '송파구',
  '1125': '강동구',
};

export default function KoreaMap({ onSelectDong, mapRef, showGuNames = true, onReady }) {
  const { dongSquares } = useSquares();
  const [geoData, setGeoData]         = useState(null);
  const [guData, setGuData]            = useState(null);
  const [riverBorder, setRiverBorder]  = useState(null);
  const [projection, setProjection]    = useState(null);
  const [transform, setTransform]      = useState({ x: 0, y: 0, k: 1 });
  const [hovered, setHovered]          = useState(null);
  const [tooltipPos, setTooltipPos]    = useState({ x: 0, y: 0 });
  const svgRef  = useRef();
  const zoomRef = useRef();

  useEffect(() => {
    Promise.all([
      fetch('/data/seoul-dong.json').then(r => r.json()),
      fetch('/data/seoul-gu-border.json').then(r => r.json()),
      fetch('/data/hangang-border.json').then(r => r.json()),
    ]).then(([dong, gu, river]) => {
      const proj = d3.geoMercator().fitExtent([[20, 20], [W - 20, H - 20]], dong);
      setProjection(() => proj);
      setGeoData(dong);
      setGuData(gu);
      setRiverBorder(river);
      // 검색 기능용 동 목록 전달
      if (onReady) {
        const dongList = dong.features.map(f => ({
          code: f.properties.code,
          name: f.properties.name,
        }));
        onReady({ dongList, focusDong: (code) => focusDongByCode(code, dong, proj) });
      }
    });
  }, []);

  // d3-zoom 설정
  useEffect(() => {
    if (!svgRef.current) return;
    const zoomBehavior = d3zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        setTransform(event.transform);
        setHovered(null);
      });
    zoomRef.current = zoomBehavior;
    select(svgRef.current).call(zoomBehavior);
    return () => select(svgRef.current).on('.zoom', null);
  }, []);

  const pathGen = projection ? d3.geoPath().projection(projection) : null;

  function focusDongByCode(code, dongData, proj) {
    const feat = dongData.features.find(f => f.properties.code === code);
    if (!feat || !svgRef.current || !zoomRef.current) return;
    const path = d3.geoPath().projection(proj);
    const [[x0, y0], [x1, y1]] = path.bounds(feat);
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const scale = Math.min(8, 0.9 / Math.max((x1 - x0) / W, (y1 - y0) / H));
    const tx = W / 2 - scale * cx;
    const ty = H / 2 - scale * cy;
    const { zoomIdentity: zi } = { zoomIdentity };
    select(svgRef.current)
      .transition().duration(600)
      .call(zoomRef.current.transform,
        zi.translate(tx, ty).scale(scale)
      );
  }

  const guCentroids = useMemo(() => {
    if (!geoData || !pathGen) return {};
    const acc = {};
    geoData.features.forEach(feat => {
      const guCode = feat.properties.code.slice(0, 4);
      const c = pathGen.centroid(feat);
      if (!c || isNaN(c[0])) return;
      if (!acc[guCode]) acc[guCode] = { x: 0, y: 0, n: 0 };
      acc[guCode].x += c[0];
      acc[guCode].y += c[1];
      acc[guCode].n += 1;
    });
    const result = {};
    Object.entries(acc).forEach(([code, { x, y, n }]) => {
      result[code] = [x / n, y / n];
    });
    return result;
  }, [geoData, pathGen]);

  function getFill(code) {
    const sq = dongSquares[code];
    const isPremium = PREMIUM_DONG_CODES.has(code);
    const isHov = hovered?.code === code;
    if (!sq || sq.status !== 'confirmed') {
      if (isHov) return isPremium ? COLOR.premiumHover : COLOR.hover;
      return isPremium ? COLOR.premiumEmpty : COLOR.empty;
    }
    return COLOR.confirmed;
  }

  function getStroke(code) {
    const sq = dongSquares[code];
    const isPremium = PREMIUM_DONG_CODES.has(code);
    if (!sq || sq.status !== 'confirmed') return isPremium ? COLOR.premiumEmptyStroke : COLOR.emptyStroke;
    return COLOR.confirmedStroke;
  }

  function handleMouseMove(e) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    // transform 역산해서 실제 SVG 좌표로
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    setTooltipPos({ x, y });
  }

  const hoveredData      = hovered ? dongSquares[hovered.code] : null;
  const hoveredIsPremium = hovered ? PREMIUM_DONG_CODES.has(hovered.code) : false;

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={mapRef}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: '100vh', display: 'block', touchAction: 'none' }}
      >
        <defs>
          {geoData && pathGen && geoData.features.map(feat => (
            <clipPath key={`clip-${feat.properties.code}`} id={`clip-${feat.properties.code}`}>
              <path d={pathGen(feat)} />
            </clipPath>
          ))}
          <filter id="glow-red">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 배경 */}
        <rect width={W} height={H} fill="#d6cfc6" />

        {/* 줄 /패닝 포함 전체 콘텐츠 */}
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>

        {/* 동 폴리곤 */}
        {geoData && pathGen && geoData.features.map(feat => {
          const { code, name } = feat.properties;
          const sq = dongSquares[code];
          const isPremium = PREMIUM_DONG_CODES.has(code);
          const isHov = hovered?.code === code;
          const d = pathGen(feat);
          const isConfirmedImg = sq?.status === 'confirmed' && sq?.imageUrl;

          return (
            <g key={code}>
              <path
                d={d}
                fill={getFill(code)}
                stroke={getStroke(code)}
                strokeWidth={isPremium ? 1.0 : 0.5}
                style={{ cursor: 'pointer', transition: 'fill 0.1s', outline: 'none' }}
                onMouseEnter={e => { setHovered({ code, name }); handleMouseMove(e); }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelectDong({ code, name, existing: sq, isPremium })}
              />
              {isConfirmedImg && (() => {
                const b = pathGen.bounds(feat);
                return (
                  <image
                    href={sq.imageUrl}
                    x={b[0][0]} y={b[0][1]}
                    width={b[1][0] - b[0][0]} height={b[1][1] - b[0][1]}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#clip-${code})`}
                    opacity={0.85}
                    style={{ pointerEvents: 'none' }}
                  />
                );
              })()}
            </g>
          );
        })}

        {/* 구 경계선 - 동 데이터에서 직접 추온 것이라 좌표 완전 일치 */}
        {guData && pathGen && guData.features.map((feat, i) => (
          <path
            key={`gu-border-${i}`}
            d={pathGen(feat)}
            fill="none"
            stroke={COLOR.guBorder}
            strokeWidth={2.2}
            opacity={0.9}
            style={{ pointerEvents: 'none' }}
          />
        ))}

        {/* 한강 - 강북/강남 구가 공유하는 경계선만 파랗게 */}
        {riverBorder && pathGen && (
          <g style={{ pointerEvents: 'none' }}>
            {/* 강폭 느낌 - 두꺼운 파란선 */}
            {riverBorder.features.map((feat, i) => (
              <path
                key={`rb-${i}`}
                d={pathGen(feat)}
                fill="none"
                stroke="#7ec8e3"
                strokeWidth={10}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.85}
              />
            ))}
            {/* 중앙 하이라이트 */}
            {riverBorder.features.map((feat, i) => (
              <path
                key={`rh-${i}`}
                d={pathGen(feat)}
                fill="none"
                stroke="#c5e8f5"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.7}
              />
            ))}
          </g>
        )}

        {/* 프리미엄 테두리 */}
        {geoData && pathGen && geoData.features
          .filter(feat => PREMIUM_DONG_CODES.has(feat.properties.code) && !dongSquares[feat.properties.code])
          .map(feat => {
            const { code } = feat.properties;
            const isHov = hovered?.code === code;
            return (
              <path
                key={`premium-border-${code}`}
                d={pathGen(feat)}
                fill="none"
                stroke="#e63946"
                strokeWidth={1.2}
                className="premium-border"
                style={{ pointerEvents: 'none' }}
              />
            );
          })
        }

        {/* 구 이름 레이블 */}
        {showGuNames && Object.entries(guCentroids).map(([guCode, [cx, cy]]) => {
          const guName = GU_NAMES[guCode];
          if (!guName) return null;
          return (
            <text
              key={`gu-label-${guCode}`}
              x={cx} y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: '9px', fontWeight: 700,
                fill: COLOR.guLabel,
                pointerEvents: 'none',
                paintOrder: 'stroke',
                stroke: '#fff',
                strokeWidth: '3px',
                letterSpacing: '0.02em',
              }}
            >
              {guName}
            </text>
          );
        })}
        </g> {/* end zoom group */}
      </svg>

      {/* 지도 초기화 버튼 */}
      {transform.k > 1 && (
        <button
          onClick={() => {
            select(svgRef.current)
              .transition().duration(300)
              .call(zoomRef.current.transform, zoomIdentity);
          }}
          style={{
            position: 'absolute', bottom: '12px', right: '12px',
            background: '#fff', border: '1px solid #ddd',
            borderRadius: '8px', padding: '6px 12px',
            fontSize: '12px', color: '#555', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          전체보기
        </button>
      )}

      {hovered && (
        <SquareTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          name={PREMIUM_DONG_LABELS[hovered.code] || hovered.name}
          data={hoveredData}
          isPremium={hoveredIsPremium}
        />
      )}
    </div>
  );
}

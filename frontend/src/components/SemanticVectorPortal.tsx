import React, { useState, useEffect } from 'react';
import { API } from '../api/client';

interface VectorPoint {
  id: string;
  x: number;
  y: number;
  category: 'person' | 'vehicle' | 'anomaly' | 'query';
  cameraId: string;
  cameraName: string;
  confidence: number;
  label: string;
  timestamp: string;
}

export const SemanticVectorPortal: React.FC = () => {
  const [points, setPoints] = useState<VectorPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<VectorPoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<VectorPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeQuery, setActiveQuery] = useState('검은색 후드티를 입고 담을 넘는 사람');
  const [totalEmbeddings, setTotalEmbeddings] = useState(14285901);

  // 초기 벡터 산점도 데이터 생성 (사람, 차량, 이상행동 클러스터)
  useEffect(() => {
    generateVectorPoints();
  }, []);

  const generateVectorPoints = () => {
    const newPoints: VectorPoint[] = [];
    
    // 클러스터 1: 사람 감지 (중앙 좌측 영역: x: 250~450, y: 200~400)
    for (let i = 0; i < 28; i++) {
      newPoints.push({
        id: `VEC-P${String(i + 1).padStart(3, '0')}`,
        x: 350 + (Math.random() - 0.5) * 160,
        y: 300 + (Math.random() - 0.5) * 140,
        category: 'person',
        cameraId: `CAM-0${(i % 4) + 1}`,
        cameraName: ['외곽 1구역 펜스 북부', '자재 창고 출입구', '중앙 변전실 내부', '본관 메인 로비'][i % 4],
        confidence: 0.88 + Math.random() * 0.1,
        label: ['보행자 통행', '보안 요원 순찰', '작업자 이동', '방문객 출입'][i % 4],
        timestamp: '14:0' + (i % 9) + ':12'
      });
    }

    // 클러스터 2: 차량 활동 (우측 상단 영역: x: 650~850, y: 150~320)
    for (let i = 0; i < 22; i++) {
      newPoints.push({
        id: `VEC-V${String(i + 1).padStart(3, '0')}`,
        x: 750 + (Math.random() - 0.5) * 150,
        y: 220 + (Math.random() - 0.5) * 120,
        category: 'vehicle',
        cameraId: `CAM-0${(i % 3) + 1}`,
        cameraName: ['자재 창고 출입구', '외곽 1구역 펜스 북부', '본관 메인 로비'][i % 3],
        confidence: 0.91 + Math.random() * 0.08,
        label: ['화물 트럭 진입', '승용차 주차', '지게차 하역', '순찰 차량'][i % 4],
        timestamp: '13:5' + (i % 9) + ':45'
      });
    }

    // 클러스터 3: 이상 / 침입 감지 (중앙 하단 영역: x: 450~650, y: 400~520)
    for (let i = 0; i < 15; i++) {
      newPoints.push({
        id: `VEC-A${String(i + 1).padStart(3, '0')}`,
        x: 550 + (Math.random() - 0.5) * 130,
        y: 440 + (Math.random() - 0.5) * 100,
        category: 'anomaly',
        cameraId: `CAM-01`,
        cameraName: '외곽 1구역 펜스 북부',
        confidence: 0.94 + Math.random() * 0.05,
        label: ['월담 및 무단 침입', '펜스 절단 시도', '배회 의심 행동'][i % 3],
        timestamp: '14:02:45'
      });
    }

    // 활성 쿼리 임베딩 지점 (이상 감지 클러스터 근처)
    newPoints.push({
      id: 'QUERY-NOW',
      x: 570,
      y: 430,
      category: 'query',
      cameraId: 'CAM-01',
      cameraName: '외곽 1구역 펜스 북부',
      confidence: 0.985,
      label: activeQuery,
      timestamp: 'NOW'
    });

    setPoints(newPoints);
    setSelectedPoint(newPoints.find(p => p.category === 'anomaly') || newPoints[0]);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTotalEmbeddings(prev => prev + Math.floor(Math.random() * 40) + 10);
    setTimeout(() => {
      generateVectorPoints();
      setIsSyncing(false);
    }, 600);
  };

  return (
    <main className="flex-1 min-w-0 h-[calc(100vh-3.5rem)] flex flex-col bg-[#070A13] relative z-10 select-none">
      <div className="flex-1 flex flex-col p-5 gap-4 overflow-hidden">
        
        {/* Header section */}
        <header className="flex justify-between items-center shrink-0 border-b border-[#232C3F] pb-3">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">hub</span>
              다차원 의미 벡터 가시화 &amp; 임베딩 공간 분석 포탈
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              ChromaDB • MiniLM-L6-v2 (dim=384 -&gt; t-SNE dim=2, perplexity=30) • 실시간 비전 연속 인덱싱 활성
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="px-3.5 py-1.5 border border-[#232C3F] bg-[#121724] hover:bg-white/5 text-xs font-mono text-white flex items-center gap-2 rounded-lg transition-colors"
            >
              <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>sync</span> 
              {isSyncing ? '벡터 인덱스 동기화 중...' : '임베딩 공간 동기화'}
            </button>
          </div>
        </header>

        {/* Center: 2D Semantic Vector Space (Scatter Plot) */}
        <div className="flex-1 bg-[#0b0e17] border border-[#232C3F] rounded-xl relative overflow-hidden flex flex-col shadow-inner">
          
          {/* Overlay Grid & Axis */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-40" 
            style={{ 
              backgroundImage: "linear-gradient(to right, rgba(35, 44, 63, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(35, 44, 63, 0.4) 1px, transparent 1px)", 
              backgroundSize: "50px 50px" 
            }}
          ></div>
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-border-subtle opacity-30 pointer-events-none"></div>
          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-border-subtle opacity-30 pointer-events-none"></div>

          {/* Legend Overlay */}
          <div className="absolute top-4 right-4 bg-[#121724]/90 backdrop-blur border border-[#232C3F] p-3 rounded-lg shadow-xl z-20 text-xs">
            <div className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">임베딩 클러스터 범례</div>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center gap-2 text-primary">
                <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_6px_#7C3AED]"></div>
                <span>사람 감지 (Person, N=28)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]"></div>
                <span>차량 활동 (Vehicle, N=22)</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]"></div>
                <span>침입/이상 행동 (Anomaly, N=15)</span>
              </div>
              <div className="flex items-center gap-2 text-red-400 mt-2 pt-2 border-t border-[#232C3F] font-bold">
                <span className="material-symbols-outlined text-[15px] animate-pulse">star</span> 
                <span>현재 검색 쿼리 벡터</span>
              </div>
            </div>
          </div>

          {/* Active Query Banner */}
          <div className="absolute top-4 left-4 bg-[#121724]/90 backdrop-blur border border-[#232C3F] px-3.5 py-2 rounded-lg z-20 flex items-center gap-2 text-xs">
            <span className="text-gray-400 font-mono">쿼리:</span>
            <span className="text-white font-bold">{activeQuery}</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
              Cosine Sim 0.985
            </span>
          </div>

          {/* The Interactive SVG Scatter Plot Canvas */}
          <svg 
            className="w-full h-full relative z-10" 
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
          >
            {/* Draw connection line between query and nearest anomaly */}
            {points.filter(p => p.category === 'query').map(qp => {
              const nearest = points.filter(p => p.category === 'anomaly')[0];
              if (!nearest) return null;
              return (
                <line 
                  key="query-line"
                  x1={qp.x} 
                  y1={qp.y} 
                  x2={nearest.x} 
                  y2={nearest.y} 
                  stroke="#EF4444" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
              );
            })}

            {/* Render Vector Points */}
            {points.map(pt => {
              const isSelected = selectedPoint?.id === pt.id;
              const isQuery = pt.category === 'query';
              const color = 
                isQuery ? '#EF4444' :
                pt.category === 'person' ? '#7C3AED' :
                pt.category === 'vehicle' ? '#10B981' : '#F59E0B';

              return (
                <g 
                  key={pt.id}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => setSelectedPoint(pt)}
                  onMouseEnter={(e) => {
                    setHoveredPoint(pt);
                    setTooltipPos({ x: pt.x, y: pt.y });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Glow circle for selected/query */}
                  {(isSelected || isQuery) && (
                    <circle 
                      cx={pt.x} 
                      cy={pt.y} 
                      r={isQuery ? 14 : 10} 
                      fill={color} 
                      opacity="0.3"
                      className="animate-ping"
                    />
                  )}
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r={isQuery ? 7 : isSelected ? 6 : 4.5} 
                    fill={color}
                    stroke="#FFFFFF"
                    strokeWidth={isSelected ? 2 : 0.8}
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Overlay */}
          {hoveredPoint && (
            <div 
              className="absolute bg-[#121724] border border-[#232C3F] p-2.5 rounded-lg shadow-2xl text-[11px] font-mono text-white z-30 pointer-events-none whitespace-nowrap -translate-x-1/2 -translate-y-full mb-3"
              style={{ left: `${(tooltipPos.x / 1000) * 100}%`, top: `${(tooltipPos.y / 600) * 100}%` }}
            >
              <div className="font-bold text-primary mb-0.5">{hoveredPoint.id} • {hoveredPoint.label}</div>
              <div className="text-gray-400">채널: <span className="text-white">{hoveredPoint.cameraName}</span></div>
              <div className="text-gray-400">코사인 유사도: <span className="text-emerald-400 font-bold">{(hoveredPoint.confidence * 100).toFixed(1)}%</span></div>
            </div>
          )}

          {/* Selected Point Inspector Modal / Card */}
          {selectedPoint && (
            <div className="absolute bottom-4 left-4 bg-[#121724]/95 backdrop-blur border border-[#232C3F] p-3 rounded-xl shadow-2xl z-20 flex items-center gap-3.5 max-w-[480px]">
              <div className="w-32 h-20 bg-black rounded-lg overflow-hidden border border-[#232C3F] shrink-0 relative">
                <img 
                  src={`http://localhost:8001/snapshot/${selectedPoint.cameraId.toLowerCase()}?t=${Date.now()}`}
                  alt="Snapshot"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `http://localhost:8001/snapshot/cam-01?t=${Date.now()}`;
                  }}
                />
                <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono text-white px-1 rounded">
                  {selectedPoint.cameraId}
                </span>
              </div>
              <div className="flex flex-col min-w-0 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white truncate">{selectedPoint.label}</span>
                  <span className="text-[10px] font-mono text-primary bg-primary/10 px-1 rounded border border-primary/20">
                    {selectedPoint.id}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 font-mono">발생원: {selectedPoint.cameraName}</div>
                <div className="text-[11px] text-gray-400 font-mono">
                  신뢰도 / 유사도: <span className="text-emerald-400 font-bold">{(selectedPoint.confidence * 100).toFixed(2)}%</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPoint(null)}
                className="p-1 text-gray-400 hover:text-white rounded ml-auto shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

        </div>

        {/* Bottom: Real-time Vector Indexing Stats */}
        <div className="h-28 shrink-0 grid grid-cols-3 gap-4">
          
          {/* Stat Card 1: Cumulative Embeddings */}
          <div className="bg-[#0e121d] border border-[#232C3F] rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
            <div className="text-xs text-gray-400 font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[16px]">database</span> 
              누적 비전/텍스트 벡터 임베딩 
            </div>
            <div className="flex items-end gap-3">
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                {totalEmbeddings.toLocaleString()}
              </div>
              <div className="text-xs font-mono text-emerald-400 flex items-center mb-1">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 1.4k/s 
              </div>
            </div>
            <div className="w-full h-1 bg-[#121724] rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[82%]"></div>
            </div>
          </div>

          {/* Stat Card 2: DB Latency */}
          <div className="bg-[#0e121d] border border-[#232C3F] rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden shadow-sm">
            <div className="text-xs text-gray-400 font-bold flex items-center gap-2 z-10">
              <span className="material-symbols-outlined text-emerald-400 text-[16px]">speed</span> 
              HNSW 벡터 근사 최근접 검색 지연 (P99)
            </div>
            <div className="text-2xl font-bold font-mono text-white z-10 flex items-baseline gap-1">
              18<span className="text-xs text-gray-400 font-normal">ms</span>
            </div>
            {/* Real-time Dynamic Bars */}
            <div className="absolute bottom-0 left-0 w-full h-8 flex items-end gap-1 px-4 pb-1.5 opacity-40">
              {[40, 30, 60, 50, 80, 35, 45, 25, 55, 30, 65, 20].map((h, i) => (
                <div key={i} className="flex-1 bg-primary rounded-t" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>

          {/* Stat Card 3: Top Cosine Match */}
          <div className="bg-[#0e121d] border border-[#232C3F] rounded-xl p-3 flex flex-col overflow-hidden shadow-sm">
            <div className="text-xs text-gray-400 font-bold flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-amber-400 text-[16px]">target</span> 
              상위 코사인 일치 벡터 (Top 3)
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 text-xs font-mono">
              <div className="flex justify-between items-center bg-[#121724] px-2 py-0.5 rounded border border-[#232C3F]">
                <span className="text-gray-300">VEC-A001 (침입 감지)</span>
                <span className="text-emerald-400 font-bold">0.985</span>
              </div>
              <div className="flex justify-between items-center bg-[#121724] px-2 py-0.5 rounded border border-[#232C3F]">
                <span className="text-gray-300">VEC-A003 (담장 배회)</span>
                <span className="text-emerald-400 font-bold">0.962</span>
              </div>
              <div className="flex justify-between items-center bg-[#121724] px-2 py-0.5 rounded border border-[#232C3F]">
                <span className="text-gray-300">VEC-P012 (야간 이동)</span>
                <span className="text-emerald-400 font-bold">0.938</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

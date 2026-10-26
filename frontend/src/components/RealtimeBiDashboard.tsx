import React, { useState, useEffect } from 'react';
import { useEventLogStore } from '../store/useEventLogStore';
import { API } from '../api/client';

export const RealtimeBiDashboard: React.FC = () => {
  const { logs } = useEventLogStore();
  const [stats, setStats] = useState<any>(null);
  const [selectedCam, setSelectedCam] = useState<string>('cam-real-1787557630');
  const [cameras, setCameras] = useState<any[]>([]);

  // Fetch cameras and initial BI stats
  useEffect(() => {
    API.getCameras()
      .then((cams) => {
        if (Array.isArray(cams) && cams.length > 0) {
          setCameras(cams);
          setSelectedCam(cams[0].camera_id);
        } else {
          setCameras([
            { camera_id: 'cam-real-1787557630', name: '외곽 1구역 펜스' },
            { camera_id: 'cam-real-1787579299', name: '메인 진입로 게이트' },
            { camera_id: 'cctv-0024', name: '서쪽 계단 L2' }
          ]);
        }
      })
      .catch(console.error);

    API.getBiStats()
      .then((data) => {
        if (data && data.status === 'SUCCESS') {
          setStats(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const criticalCount = logs.filter((l) => l.level === 'critical').length;
  const personCount = stats?.personCount || 248 + logs.length * 3;
  const vehicleCount = stats?.vehicleCount || 42 + logs.length;
  const highRiskCount = stats?.highRiskCount || criticalCount;

  return (
    <>
      <main className="p-container-padding h-[calc(100vh-56px)] overflow-y-auto bg-[#070A13]">
        <div className="grid grid-cols-2 gap-4 h-full min-h-[700px]">
          {/* Row 1 Left: Real Camera Live Crowd Density Heatmap */}
          <div className="bg-surface-container-low border border-border-subtle rounded-lg flex flex-col overflow-hidden relative shadow-lg">
            <div className="p-3.5 border-b border-border-subtle bg-surface flex justify-between items-center z-10 relative">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">local_fire_department</span>
                <h2 className="text-title-sm font-title-sm text-on-surface font-bold">
                  실시간 카메라 군중 밀집도 히트맵
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {/* Camera Selector Dropdown */}
                <select
                  value={selectedCam}
                  onChange={(e) => setSelectedCam(e.target.value)}
                  className="bg-[#0b0e17] text-white border border-border-subtle rounded px-2.5 py-1 text-xs font-mono outline-none focus:border-primary"
                >
                  {cameras.map((c) => (
                    <option key={c.camera_id} value={c.camera_id}>
                      {c.name || c.camera_id} ({c.camera_id})
                    </option>
                  ))}
                </select>

                <div className="flex gap-2.5 text-[11px] font-mono text-text-muted">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-danger animate-pulse"></div> 과밀집
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-warning"></div> 주의
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-tertiary"></div> 안전
                  </div>
                </div>
              </div>
            </div>

            {/* Live Camera Stream with Visual Heatmap Overlay */}
            <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
              <img
                src={`http://localhost:8001/stream/${selectedCam}`}
                alt="Live Heatmap Background"
                className="w-full h-full object-contain opacity-70"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `http://localhost:8001/snapshot/${selectedCam}`;
                }}
              />

              {/* Dynamic Heatmap Glowing Blobs Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[35%] left-[45%] w-36 h-36 bg-danger/50 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute top-[55%] left-[25%] w-28 h-28 bg-warning/40 rounded-full blur-xl"></div>
                <div className="absolute top-[25%] right-[25%] w-44 h-44 bg-tertiary/25 rounded-full blur-2xl"></div>
              </div>

              {/* OSD Status Tag */}
              <div className="absolute bottom-3 left-3 bg-black/80 border border-border-subtle px-3 py-1.5 rounded backdrop-blur text-xs font-mono text-gray-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-danger animate-ping"></span>
                <span>채널: {selectedCam.toUpperCase()} • 밀집도 지수: <strong>3.8명/㎡</strong> (주의 단계)</span>
              </div>
            </div>
          </div>

          {/* Row 1 Right: Incident Alert Trend */}
          <div className="bg-surface-container-low border border-border-subtle rounded-lg flex flex-col shadow-lg">
            <div className="p-3.5 border-b border-border-subtle bg-surface flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-danger text-[18px]">show_chart</span>
                <h2 className="text-title-sm font-title-sm text-on-surface font-bold">
                  시간대별 사건·경보 발생 추이
                </h2>
              </div>
              <span className="text-xs font-mono text-text-muted">실시간 통계 누적</span>
            </div>
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div className="flex-1 border-b border-l border-border-subtle relative flex items-end justify-between px-4 pb-2 pt-8 gap-3">
                {/* Simulated Chart Grid */}
                <div className="absolute top-1/4 left-0 w-full border-t border-border-subtle/40 border-dashed"></div>
                <div className="absolute top-2/4 left-0 w-full border-t border-border-subtle/40 border-dashed"></div>
                <div className="absolute top-3/4 left-0 w-full border-t border-border-subtle/40 border-dashed"></div>

                {/* Bars */}
                <div className="w-full bg-tertiary/30 border border-tertiary/60 h-[35%] relative group cursor-pointer hover:bg-tertiary/50 transition-colors rounded-t">
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-text-muted hidden group-hover:block">12건</span>
                </div>
                <div className="w-full bg-tertiary/30 border border-tertiary/60 h-[48%] relative group cursor-pointer hover:bg-tertiary/50 transition-colors rounded-t">
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-text-muted hidden group-hover:block">18건</span>
                </div>
                <div className="w-full bg-warning/30 border border-warning/60 h-[62%] relative group cursor-pointer hover:bg-warning/50 transition-colors rounded-t">
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-text-muted hidden group-hover:block">26건</span>
                </div>
                <div className="w-full bg-danger/40 border border-danger/70 h-[88%] relative group cursor-pointer hover:bg-danger/60 transition-colors rounded-t">
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10 whitespace-nowrap">
                    최대 경보: {criticalCount + 8}건
                  </div>
                </div>
                <div className="w-full bg-warning/30 border border-warning/60 h-[52%] relative group cursor-pointer hover:bg-warning/50 transition-colors rounded-t">
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-text-muted hidden group-hover:block">21건</span>
                </div>
                <div className="w-full bg-tertiary/30 border border-tertiary/60 h-[38%] relative group cursor-pointer hover:bg-tertiary/50 transition-colors rounded-t">
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-text-muted hidden group-hover:block">15건</span>
                </div>
              </div>

              {/* X Axis Time Labels */}
              <div className="flex justify-between mt-2 text-[11px] font-mono text-text-muted px-3">
                <span>10:00</span>
                <span>12:00</span>
                <span>14:00</span>
                <span className="text-danger font-bold">16:00 (피크)</span>
                <span>18:00</span>
                <span>20:00</span>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 mt-3 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-danger/60 border border-danger rounded-sm"></div> 침입·추락
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-warning/50 border border-warning rounded-sm"></div> 불법 주정차
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-primary/50 border border-primary rounded-sm"></div> 화재 전조
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 Left: Object Counting Data */}
          <div className="bg-surface-container-low border border-border-subtle rounded-lg flex flex-col shadow-lg">
            <div className="p-3.5 border-b border-border-subtle bg-surface">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
                <h2 className="text-title-sm font-title-sm text-on-surface font-bold">
                  YOLOv11 실시간 객체 계수 (누적)
                </h2>
              </div>
            </div>
            <div className="flex-1 p-4 grid grid-cols-1 gap-3">
              <div className="bg-[#0b0e17] border border-border-subtle rounded p-4 flex justify-between items-center hover:border-primary transition-colors">
                <div>
                  <div className="text-text-muted text-xs font-bold uppercase mb-1">식별 인원 (Person)</div>
                  <div className="text-display-lg font-display-lg text-white font-mono font-bold">
                    {personCount.toLocaleString()}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-3xl">directions_walk</span>
                </div>
              </div>

              <div className="bg-[#0b0e17] border border-border-subtle rounded p-4 flex justify-between items-center hover:border-tertiary transition-colors">
                <div>
                  <div className="text-text-muted text-xs font-bold uppercase mb-1">식별 차량 (Vehicle)</div>
                  <div className="text-display-lg font-display-lg text-tertiary font-mono font-bold">
                    {vehicleCount.toLocaleString()}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center border border-tertiary/20">
                  <span className="material-symbols-outlined text-tertiary text-3xl">directions_car</span>
                </div>
              </div>

              <div className="bg-[#0b0e17] border border-danger/40 rounded p-4 flex justify-between items-center hover:border-danger transition-colors relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-danger"></div>
                <div>
                  <div className="text-danger text-xs font-bold uppercase mb-1">위험 행동 추적군 (High Risk)</div>
                  <div className="text-display-lg font-display-lg text-danger font-mono font-bold">
                    {highRiskCount.toLocaleString()}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center border border-danger/20">
                  <span className="material-symbols-outlined text-danger text-3xl animate-pulse">warning</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 Right: Dwell Time Analytics */}
          <div className="bg-surface-container-low border border-border-subtle rounded-lg flex flex-col shadow-lg">
            <div className="p-3.5 border-b border-border-subtle bg-surface">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[18px]">timer</span>
                <h2 className="text-title-sm font-title-sm text-on-surface font-bold">
                  주요 구역별 체류 시간 (Dwell Time)
                </h2>
              </div>
            </div>
            <div className="flex-1 p-5 flex flex-col gap-4 justify-around bg-[#0b0e17]">
              <div className="space-y-1.5">
                <div className="flex justify-between items-end text-xs font-mono">
                  <span className="text-gray-300 font-bold">A-3 지하철 연결 출구</span>
                  <span className="text-primary font-bold">1분 24초</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: '25%' }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-end text-xs font-mono">
                  <span className="text-gray-300 font-bold">C-1 화물 하역장 진입로 (정체 심각)</span>
                  <span className="text-danger font-bold">8분 45초 (지연)</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                  <div className="bg-danger h-full rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-end text-xs font-mono">
                  <span className="text-gray-300 font-bold">중앙 로비 대기열</span>
                  <span className="text-warning font-bold">4분 12초</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                  <div className="bg-warning h-full rounded-full transition-all duration-500" style={{ width: '50%' }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-end text-xs font-mono">
                  <span className="text-gray-300 font-bold">외곽 북문 보안 게이트</span>
                  <span className="text-tertiary font-bold">0분 45초 (원활)</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                  <div className="bg-tertiary h-full rounded-full transition-all duration-500" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { useSopStore } from '../store/useSopStore';
import { API } from '../api/client';

export const DisasterVirtualWarRoom: React.FC = () => {
  const { currentEventId, ruleTitle, actions, isSopActive, toggleAction } = useSopStore();
  const [isEscalated, setIsEscalated] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active multi-channel cameras
  const [mainCamId, setMainCamId] = useState<string>('cam-real-1787557630');
  const [subCam1Id, setSubCam1Id] = useState<string>('cam-real-1787579299');
  const [subCam2Id, setSubCam2Id] = useState<string>('cctv-0024');

  // Elapsed timer for incident
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(842);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `00:${m}:${s}`;
  };

  const handleEscalate = () => {
    setIsEscalated(true);
    setToastMessage('🚨 소방방재청 및 지자체 통합관제센터로 1급 재난 에스컬레이션이 전파되었습니다.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleExportLog = () => {
    setToastMessage('📥 재난 대응 SOP 체크리스트 및 VLM 분석 로그가 파일로 내보내졌습니다.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <>
      <main className="flex-1 flex flex-col p-container-padding gap-container-padding h-full overflow-hidden bg-[#070A13] relative">
        {toastMessage && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-[#121829] border border-danger text-white px-6 py-3 rounded-lg shadow-2xl font-body-base text-body-base flex items-center gap-2 animate-bounce">
            <span className="material-symbols-outlined text-danger text-[22px]">emergency</span>
            {toastMessage}
          </div>
        )}

        {/* Disaster Alert Header */}
        <div className="bg-surface-container-low border border-danger/60 p-3.5 flex items-center justify-between rounded shadow-[0_0_20px_rgba(239,68,68,0.25)] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="bg-danger/20 text-danger p-2 rounded flex items-center justify-center border border-danger/40">
              <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
            </div>
            <div>
              <h1 className="text-title-sm font-title-sm text-danger flex items-center gap-2 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-danger animate-ping"></span>
                {isSopActive ? ruleTitle : '중대 재난 대응 프로토콜 발효 (화재·붕괴 전조)'}
              </h1>
              <p className="text-mono-data font-mono-data text-text-muted text-xs mt-0.5">
                INCIDENT ID: <strong className="text-white">{isSopActive ? currentEventId : 'VLM-WAR-992'}</strong> | 
                주관제 채널: <strong className="text-primary">{mainCamId.toUpperCase()}</strong> | 
                경과 시간: <strong className="text-warning">{formatElapsed(elapsedSeconds)}</strong>
              </p>
            </div>
          </div>

          {/* SOP Checklist Render */}
          <div className="hidden lg:flex flex-1 px-6 items-center justify-center gap-5">
            {(actions && actions.length > 0 ? actions : [
              { clause: '초기 통제', description: '현장 소방 경보 및 핫라인 연결', isCompleted: true },
              { clause: '인명 대피', description: '방송 설비 자동 대피 안내', isCompleted: false },
              { clause: '진입 차단', description: '비상 차단기 및 차수벽 가동', isCompleted: false }
            ]).map((act, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 cursor-pointer group bg-[#0b0e17] px-3 py-1.5 rounded border border-border-subtle hover:border-primary transition-colors"
                onClick={() => toggleAction(idx)}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    act.isCompleted ? 'bg-primary border-primary text-white' : 'border-border-subtle bg-surface-container'
                  }`}
                >
                  {act.isCompleted && <span className="material-symbols-outlined text-[12px]">check</span>}
                </div>
                <span className={`text-xs font-semibold ${act.isCompleted ? 'text-text-muted line-through' : 'text-on-surface'}`}>
                  {act.clause}: {act.description}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportLog}
              className="bg-surface-container border border-border-subtle text-on-surface px-3.5 py-2 rounded text-xs font-bold hover:bg-surface-container-high transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              로그 내보내기
            </button>
            <button
              className={`px-5 py-2 rounded text-xs font-bold shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all flex items-center gap-1.5 cursor-pointer ${
                isEscalated
                  ? 'bg-danger/20 border border-danger text-danger cursor-not-allowed'
                  : 'bg-danger text-white hover:bg-red-600'
              }`}
              onClick={handleEscalate}
              disabled={isEscalated}
            >
              <span className="material-symbols-outlined text-[16px]">notification_important</span>
              {isEscalated ? '에스컬레이션 완료 (통합대응)' : '지역 본부 즉각 에스컬레이션'}
            </button>
          </div>
        </div>

        {/* Multi-Agency Video Fusion Grid (3 cols, 2 rows) */}
        <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-gutter min-h-0">
          {/* Main Feed: Primary Incident VLM Source (2 cols, 2 rows) */}
          <div className="col-span-2 row-span-2 rounded border-2 border-danger bg-black relative overflow-hidden shadow-2xl flex items-center justify-center">
            <img
              src={`http://localhost:8001/stream/${mainCamId}`}
              alt="Main Incident Feed"
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `http://localhost:8001/snapshot/${mainCamId}`;
              }}
            />

            {/* OSD Status Overlays */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              <span className="bg-black/80 backdrop-blur px-2.5 py-1 text-xs font-mono text-primary flex items-center gap-1.5 border border-border-subtle rounded">
                <span className="material-symbols-outlined text-[14px]">videocam</span>
                주관제 피드: {mainCamId.toUpperCase()} (VLM_SOURCE)
              </span>
              <span className="bg-danger/90 backdrop-blur px-2.5 py-1 text-xs font-mono text-white font-bold border border-danger rounded flex items-center gap-1.5 shadow">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                VLM 실시간 감지: 위험 구역 복합 이상 징후 (97.4%)
              </span>
            </div>

            {/* Simulated Live Bounding Box Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[35%] h-[40%] border-2 border-danger bg-danger/10 relative rounded shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse">
                <span className="absolute -top-6 left-0 text-xs font-mono font-bold text-white bg-danger px-2 py-0.5 rounded-t">
                  CRITICAL ZONE IDENTIFIED
                </span>
              </div>
            </div>

            {/* Camera Switcher Controls */}
            <div className="absolute bottom-3 right-3 flex gap-1.5 bg-black/70 backdrop-blur p-1 rounded border border-border-subtle z-10">
              {['cam-real-1787557630', 'cam-real-1787579299', 'cctv-0024'].map((cid, i) => (
                <button
                  key={cid}
                  onClick={() => setMainCamId(cid)}
                  className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                    mainCamId === cid ? 'bg-primary text-black font-bold' : 'text-text-muted hover:text-white'
                  }`}
                >
                  CAM {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Agency Feed 1: Police / Patrol (Col 3, Row 1) */}
          <div className="rounded border border-border-subtle bg-black relative overflow-hidden flex items-center justify-center group">
            <img
              src={`http://localhost:8001/stream/${subCam1Id}`}
              alt="Police Agency Feed"
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `http://localhost:8001/snapshot/${subCam1Id}`;
              }}
            />
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-black/80 backdrop-blur px-2 py-1 text-[11px] font-mono text-tertiary flex items-center gap-1 border border-border-subtle rounded">
                <span className="material-symbols-outlined text-[13px]">local_police</span>
                경찰 순찰대 연동 피드 ({subCam1Id})
              </span>
            </div>
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-text-muted bg-black/60 px-1.5 py-0.5 rounded">
              GPS: 37.5665, 126.9780
            </div>
          </div>

          {/* Agency Feed 2: Fire Dept / Drone UAV (Col 3, Row 2) */}
          <div className="rounded border border-border-subtle bg-black relative overflow-hidden flex items-center justify-center group">
            <img
              src={`http://localhost:8001/stream/${subCam2Id}`}
              alt="Fire Dept Feed"
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `http://localhost:8001/snapshot/${subCam2Id}`;
              }}
            />
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-black/80 backdrop-blur px-2 py-1 text-[11px] font-mono text-warning flex items-center gap-1 border border-border-subtle rounded">
                <span className="material-symbols-outlined text-[13px]">flight_takeoff</span>
                소방 UAV 드론 관제 피드 ({subCam2Id})
              </span>
            </div>
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-text-muted bg-black/60 px-1.5 py-0.5 rounded">
              ALT: 45m • THERMAL SENSOR ON
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

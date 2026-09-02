import React, { useState, useEffect } from 'react';

export const MobilePatrolApp: React.FC = () => {
  const [isPttActive, setIsPttActive] = useState(false);
  const [dispatchAlert, setDispatchAlert] = useState<any>(null);

  useEffect(() => {
    let ws: WebSocket;
    const connectWs = () => {
      ws = new WebSocket('ws://localhost:8000/ws/alerts');
      
      let gpsInterval: any;
      ws.onopen = () => {
        // 모바일 기기의 GPS 위치를 주기적으로 관제실로 전송 (시뮬레이션)
        gpsInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'GPS_UPDATE',
              patrol_id: 'MOBILE-UNIT-01',
              lat: 37.5665 + (Math.random() - 0.5) * 0.01,
              lng: 126.9780 + (Math.random() - 0.5) * 0.01,
              timestamp: new Date().toISOString()
            }));
          }
        }, 5000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'DISPATCH') {
            setDispatchAlert(data);
          }
        } catch (e) {
          console.error("Failed to parse websocket message", e);
        }
      };
      
      ws.onclose = () => {
        clearInterval(gpsInterval);
        setTimeout(connectWs, 3000); // Reconnect
      };
    };
    connectWs();
    return () => {
      if (ws) ws.close();
    };
  }, []);

  return ( <>
<main className="flex-1 flex flex-col gap-4 p-container-padding h-full overflow-hidden">
{/* Emergency Alert Banner (Global Alert Level 4) */}
{dispatchAlert ? (
  <div className={`bg-surface-container border-2 ${dispatchAlert.level === 'critical' ? 'border-danger alert-glow' : 'border-warning'} rounded-lg p-3 relative overflow-hidden flex flex-col gap-2 cursor-pointer active:scale-95 transition-transform duration-100 shrink-0`}>
    {dispatchAlert.level === 'critical' && <div className="absolute inset-0 bg-danger/10 animate-pulse"></div>}
    <div className="relative z-10 flex justify-between items-start">
      <div className={`flex items-center gap-2 ${dispatchAlert.level === 'critical' ? 'text-danger' : 'text-warning'}`}>
        <span className="material-symbols-outlined" data-icon="warning" data-weight="fill">warning</span>
        <h2 className="text-title-sm font-title-sm font-bold">지령 수신: {dispatchAlert.alert_id}</h2>
      </div>
      <span className="text-mono-data font-mono-data text-text-muted">{dispatchAlert.timestamp}</span>
    </div>
    <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
      <p className="text-body-sm font-body-sm text-on-surface-variant w-full sm:w-3/4 break-words">{dispatchAlert.message} (발생원: {dispatchAlert.target})</p>
      <div className={`${dispatchAlert.level === 'critical' ? 'bg-danger text-on-error' : 'bg-warning text-on-warning'} px-2 py-1 rounded text-osd-label font-osd-label whitespace-nowrap self-end`}>터치하여 영상 확인</div>
    </div>
  </div>
) : (
  <div className="bg-surface-container border border-border-subtle rounded-lg p-3 flex items-center justify-center shrink-0">
    <p className="text-body-sm text-text-muted">수신된 현장 디스패치 지령이 없습니다.</p>
  </div>
)}
{/* Main Content: Left Video, Right Controls */}
<div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
  {/* Left: Video Area */}
  <section className="flex flex-col gap-2 flex-[2] min-h-0">
    <div className="flex justify-between items-center shrink-0">
      <h3 className="text-label-caps font-label-caps text-text-muted">현장 라이브 뷰어</h3>
      <span className="flex items-center gap-1 text-tertiary text-osd-label font-osd-label">
        <div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_4px_#4edea3]"></div> 실시간
      </span>
    </div>
{/* Video Frame (Level 2) */}
<div className="relative w-full h-full min-h-[300px] rounded border-2 border-primary-container video-glow active-glow bg-surface-dim overflow-hidden group">
<div className="absolute inset-0 flex items-center justify-center text-text-muted">
<img className="w-full h-full object-cover mix-blend-luminosity opacity-80" data-alt="A gritty, high-contrast security camera feed showing an industrial alleyway at night. The image has a subtle digital noise overlay and a cyan/magenta chromatic aberration effect at the edges. A person in dark clothing is partially visible near a chain-link fence. The lighting is sparse, primarily from a harsh, artificial sodium vapor lamp." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdTy9iuO87bdj5MxYu8ZMG4Nb80hPGkg9g8cVWUbBHFa98GQ79vK4ZAJFqDk5VfsST_oxTGlI2KnQCmnZNljIHYTsUvTpsKFHtPZU7H49SWZ0jqAkXI23rD8Bn7wDAMFqm9rEMisjvb_tqgP_LPC2qPw7l-OhKjzc18BOpeTpbvAOJP5eQEAVNlpASAr7tcx3eHQDotmbeKGZ9HQFLXtjWC38299zQGCi5npkiv7tSYlZ6ePOAQloHsw"/>
</div>
{/* OSD Overlays (Level 3) */}
<div className="absolute top-2 left-2 bg-surface/80 backdrop-blur px-1.5 py-0.5 rounded border border-border-subtle">
<span className="text-osd-label font-osd-label text-text-primary">CAM-04 (구역 A)</span>
</div>
<div className="absolute bottom-2 left-2 bg-surface/80 backdrop-blur px-1.5 py-0.5 rounded border border-border-subtle">
<span className="text-mono-data font-mono-data text-primary">PTZ: P 45° T 12° Z 2.0x</span>
</div>
{/* Bounding Box Example */}
<div className="absolute top-1/4 left-1/3 w-1/4 h-1/2 border-[1.5px] border-primary-container bg-primary-container/10">
<span className="absolute -top-4 left-0 text-[10px] text-primary-container bg-surface/80 px-1 font-bold">인물 89%</span>
</div>
</div>
</section>
{/* Right: Controls Area */}
  <section className="flex flex-col gap-4 flex-1 min-w-[300px] overflow-y-auto pr-1">
    {/* Mobile PTZ Joystick */}
    <div className="bg-surface p-4 rounded-lg border border-border-subtle flex flex-col gap-4">
      <h4 className="text-label-caps font-label-caps text-text-muted text-center">PTZ 제어 (스와이프)</h4>
      <div className="flex justify-center items-center h-32">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full ptz-joystick relative flex items-center justify-center">
          {/* Crosshairs */}
          <div className="absolute w-full h-[1px] bg-border-subtle"></div>
          <div className="absolute h-full w-[1px] bg-border-subtle"></div>
          {/* Directional Indicators */}
          <span className="material-symbols-outlined absolute top-2 text-text-muted text-sm">keyboard_arrow_up</span>
          <span className="material-symbols-outlined absolute bottom-2 text-text-muted text-sm">keyboard_arrow_down</span>
          <span className="material-symbols-outlined absolute left-2 text-text-muted text-sm">keyboard_arrow_left</span>
          <span className="material-symbols-outlined absolute right-2 text-text-muted text-sm">keyboard_arrow_right</span>
          {/* The Handle */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full ptz-handle z-10 flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-text-muted text-sm sm:text-base">control_camera</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between gap-2">
        <button className="flex-1 py-2 sm:py-3 border border-border-subtle rounded text-text-primary font-title-sm hover:bg-surface-variant transition-colors flex justify-center items-center gap-1">
          <span className="material-symbols-outlined text-base sm:text-lg">zoom_out</span> 줌 아웃 
        </button>
        <button className="flex-1 py-2 sm:py-3 border border-border-subtle rounded text-text-primary font-title-sm hover:bg-surface-variant transition-colors flex justify-center items-center gap-1">
          <span className="material-symbols-outlined text-base sm:text-lg">zoom_in</span> 줌 인 
        </button>
      </div>
    </div>

    {/* Communication Panel */}
    <div className="flex flex-col gap-2">
      <h3 className="text-label-caps font-label-caps text-text-muted">통신 및 제어</h3>
      <div className="grid grid-cols-2 gap-2">
{/* PTT Button (Very Large) */}
<button 
  className={`col-span-2 py-4 text-white rounded-lg font-title-sm flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-transform shadow-[0_0_10px_rgba(124,58,237,0.3)] ${isPttActive ? 'bg-danger' : 'bg-primary-container'}`}
  onPointerDown={() => setIsPttActive(true)}
  onPointerUp={() => setIsPttActive(false)}
  onPointerLeave={() => setIsPttActive(false)}
>
<span className="material-symbols-outlined text-3xl mb-1" data-icon="mic" data-weight="fill">mic</span>
<span>{isPttActive ? '전송 중...' : '무전 전송 (PTT)'}</span>
<span className="text-osd-label opacity-70 font-normal">길게 누르고 말하세요</span>
</button>
{/* Macro TTS Buttons */}
<button className="py-3 bg-surface border border-border-subtle rounded text-body-sm text-text-primary hover:bg-surface-variant transition-colors flex flex-col items-center gap-1">
<span className="material-symbols-outlined text-tertiary" data-icon="campaign">campaign</span>
<span>경고 방송 송출</span>
</button>
<button className="py-3 bg-surface border border-border-subtle rounded text-body-sm text-text-primary hover:bg-surface-variant transition-colors flex flex-col items-center gap-1">
<span className="material-symbols-outlined text-warning" data-icon="support_agent">support_agent</span>
<span>상황실 지원 요청</span>
</button>
<button className="py-3 bg-surface border border-border-subtle rounded text-body-sm text-text-primary hover:bg-surface-variant transition-colors flex flex-col items-center gap-1">
<span className="material-symbols-outlined text-secondary" data-icon="local_police">local_police</span>
<span>경찰 인계 대기</span>
</button>
<button className="py-3 bg-surface border border-border-subtle rounded text-body-sm text-text-primary hover:bg-surface-variant transition-colors flex flex-col items-center gap-1">
<span className="material-symbols-outlined text-text-muted" data-icon="check_circle">check_circle</span>
<span>상황 종료 보고</span>
</button>
      </div>
    </div>
  </section>
</div>
</main> </> );
};

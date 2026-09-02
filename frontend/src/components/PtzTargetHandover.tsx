import React, { useEffect, useState } from 'react';
import { API } from '../api/client';
import { usePtzStore } from '../store/usePtzStore';
import { WebRTCPlayer } from './WebRTCPlayer';

export const PtzTargetHandover: React.FC = () => {
  const activeCameraId = usePtzStore(state => state.activeCameraId) || 'CAM_04_PTZ_NORTH';
  const [handoverStage, setHandoverStage] = useState<'tracking' | 'handover' | 'lost'>('handover');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Simulate handover sequence
    const timer1 = setTimeout(() => setHandoverStage('tracking'), 3000);
    return () => clearTimeout(timer1);
  }, []);

  const handlePtz = (action: string) => {
    API.controlPtz(activeCameraId, action)
      .then(res => {
        console.log(`PTZ action ${action} successful on ${activeCameraId}:`, res);
        setToastMessage(`명령 전송: ${action}`);
        setTimeout(() => setToastMessage(null), 2000);
      })
      .catch(err => {
        console.error(`PTZ action ${action} failed:`, err);
        setToastMessage(`전송 실패: ${action}`);
        setTimeout(() => setToastMessage(null), 2000);
      });
  };

  return ( <>
<main className="w-full h-full relative">
{toastMessage && (
  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-primary-container text-white px-4 py-2 rounded-lg shadow-lg font-mono-data text-[12px] animate-pulse">
    {toastMessage}
  </div>
)}
<div className="ptz-grid">
{/* Left: Video Canvas & Lock-on View */}
<div className="flex flex-col gap-gutter bg-[#070A13] p-gutter">
{/* Primary Target View */}
<div className="video-feed active flex-1 relative">
<WebRTCPlayer streamUrl={`http://localhost:8889/${(activeCameraId || 'cam-01').toLowerCase()}`} />
{/* OSD Overlays */}
<div className="osd-overlay inset-0">
{/* Bounding Box */}
<div className="bounding-box" style={{ top: "30%", left: "40%", width: "25%", height: "20%" }}>
<div className="absolute -top-6 left-0 bg-surface-container px-2 py-1 border border-primary-container text-primary font-osd-label text-osd-label uppercase flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">lock</span> TARGET_ID: VLM-892 </div>
{/* Crosshair corners */}
<div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary"></div>
<div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary"></div>
<div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary"></div>
<div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary"></div>
</div>
{/* OSD HUD Info */}
<div className="absolute top-osd-margin left-osd-margin flex flex-col gap-1">
<span className="bg-surface/80 text-on-surface font-mono-data text-mono-data px-2 py-0.5 rounded backdrop-blur">{activeCameraId}</span>
<span className={`bg-surface/80 font-mono-data text-mono-data px-2 py-0.5 rounded backdrop-blur flex items-center gap-1 ${handoverStage === 'tracking' ? 'text-tertiary' : 'text-warning'}`}>
  <span className={`led-indicator ${handoverStage === 'tracking' ? 'led-live' : 'bg-warning'}`}></span> 
  {handoverStage === 'tracking' ? 'AUTO-TRACKING ACTIVE' : 'HANDOVER IN PROGRESS'}
</span>
</div>
<div className="absolute bottom-osd-margin right-osd-margin flex flex-col gap-1 text-right">
<span className="bg-surface/80 text-on-surface font-mono-data text-mono-data px-2 py-0.5 rounded backdrop-blur">PAN: +45.2° | TILT: -12.5° | ZOOM: 18x</span>
<span className="bg-surface/80 text-danger font-mono-data text-mono-data px-2 py-0.5 rounded backdrop-blur">속도: 45km/h</span>
</div>
</div>
</div>
{/* Handover Sequence Flow / Secondary Feeds */}
<div className="h-1/3 flex gap-gutter">
<div className="video-feed w-1/3 relative">
<div className="absolute inset-0 bg-surface-container-lowest flex items-center justify-center">
<WebRTCPlayer streamUrl="http://localhost:8889/cam-03" />
<div className="absolute top-osd-margin left-osd-margin bg-surface/80 text-text-muted font-mono-data text-mono-data px-2 py-0.5 rounded">CAM_03 (LOST)</div>
</div>
</div>
<div className="video-feed w-1/3 relative active">
<div className="absolute inset-0 bg-surface-container-lowest flex items-center justify-center">
<span className="material-symbols-outlined text-primary-container text-[48px] animate-pulse">sync_alt</span>
</div>
<div className="absolute top-osd-margin left-osd-margin bg-surface/80 text-primary font-mono-data text-mono-data px-2 py-0.5 rounded">HANDOVER IN PROGRESS</div>
</div>
<div className="video-feed w-1/3 relative">
<WebRTCPlayer streamUrl="http://localhost:8889/cam-05" />
<div className="absolute top-osd-margin left-osd-margin bg-surface/80 text-warning font-mono-data text-mono-data px-2 py-0.5 rounded">CAM_05 (PREDICTED)</div>
{/* Predicted Path Overlay */}
<div className="absolute inset-0 border-2 border-dashed border-warning/50 m-4 rounded pointer-events-none"></div>
</div>
</div>
</div>
{/* Right: Control Panel (Layer 1 Surface) */}
<div className="bg-surface flex flex-col border-l border-border-subtle h-full overflow-y-auto">
{/* Header */}
<div className="p-container-padding border-b border-border-subtle bg-surface-container">
<h2 className="text-title-sm font-title-sm font-semibold flex items-center gap-2">
<span className="material-symbols-outlined text-primary-container">psychology</span> 지능형 추적 제어 </h2>
</div>
{/* Target Info Card */}
<div className="p-container-padding border-b border-border-subtle">
<div className="bg-surface-container p-3 rounded-lg border border-border-subtle flex flex-col gap-2">
<div className="flex justify-between items-center">
<span className="font-label-caps text-label-caps text-text-muted">활성 타겟</span>
<span className="bg-primary-container text-white text-[10px] px-1.5 py-0.5 rounded font-bold">타겟 잠김</span>
</div>
<div className="font-mono-data text-mono-data text-primary">ID: VLM-892-SUV-BLK</div>
<div className="text-body-sm font-body-sm text-on-surface-variant mt-1"> 신뢰도: 98%<br/> 추적 시간: 04:12s </div>
</div>
</div>
{/* PTZ Controls (Jog Shuttle) */}
<div className="p-container-padding flex flex-col items-center gap-4 border-b border-border-subtle">
<span className="font-label-caps text-label-caps text-text-muted self-start w-full">수동 제어 (PTZ)</span>
<div className="jog-shuttle my-4 shadow-lg flex items-center justify-center">
<div className="w-16 h-16 rounded-full bg-surface-container-lowest border border-border-subtle shadow-inner flex items-center justify-center relative z-10">
<span className="material-symbols-outlined text-primary-container">gamepad</span>
</div>
{/* Directional Arrows */}
<button className="jog-btn top-2 left-1/2 -translate-x-1/2" onMouseDown={() => handlePtz('up')} onMouseUp={() => handlePtz('stop')} onMouseLeave={() => handlePtz('stop')}><span className="material-symbols-outlined">expand_less</span></button>
<button className="jog-btn bottom-2 left-1/2 -translate-x-1/2" onMouseDown={() => handlePtz('down')} onMouseUp={() => handlePtz('stop')} onMouseLeave={() => handlePtz('stop')}><span className="material-symbols-outlined">expand_more</span></button>
<button className="jog-btn left-2 top-1/2 -translate-y-1/2" onMouseDown={() => handlePtz('left')} onMouseUp={() => handlePtz('stop')} onMouseLeave={() => handlePtz('stop')}><span className="material-symbols-outlined">chevron_left</span></button>
<button className="jog-btn right-2 top-1/2 -translate-y-1/2" onMouseDown={() => handlePtz('right')} onMouseUp={() => handlePtz('stop')} onMouseLeave={() => handlePtz('stop')}><span className="material-symbols-outlined">chevron_right</span></button>
</div>
<div className="flex gap-2 w-full">
<button className="flex-1 bg-surface-container hover:bg-surface-container-high border border-border-subtle text-on-surface font-label-caps text-label-caps py-2 rounded transition-colors flex items-center justify-center gap-1" onMouseDown={() => handlePtz('zoom-out')} onMouseUp={() => handlePtz('stop')} onMouseLeave={() => handlePtz('stop')}>
<span className="material-symbols-outlined text-[16px]">zoom_out</span> OUT </button>
<button className="flex-1 bg-surface-container hover:bg-surface-container-high border border-border-subtle text-on-surface font-label-caps text-label-caps py-2 rounded transition-colors flex items-center justify-center gap-1" onMouseDown={() => handlePtz('zoom-in')} onMouseUp={() => handlePtz('stop')} onMouseLeave={() => handlePtz('stop')}> IN <span className="material-symbols-outlined text-[16px]">zoom_in</span>
</button>
</div>
</div>
{/* Handover Rules List */}
<div className="p-container-padding flex flex-col gap-3">
<div className="flex justify-between items-center">
<span className="font-label-caps text-label-caps text-text-muted">인계 시퀀스</span>
<span className="material-symbols-outlined text-text-muted text-[16px] cursor-pointer hover:text-on-surface">settings</span>
</div>
{/* List Items */}
<div className="flex flex-col gap-1">
<div className="bg-surface-container-lowest border border-border-subtle p-2 flex items-center gap-3 rounded opacity-50">
<span className="material-symbols-outlined text-text-muted">check_circle</span>
<div className="flex-1 font-mono-data text-mono-data text-text-muted">CAM_03 (ZONE A)</div>
<span className="text-[10px] text-text-muted">PASSED</span>
</div>
<div className="bg-primary-container/10 border border-primary-container p-2 flex items-center gap-3 rounded relative overflow-hidden">
<div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>
<span className="material-symbols-outlined text-primary-container animate-spin" style={{ animationDuration: "3s" }}>settings</span>
<div className="flex-1 font-mono-data text-mono-data text-primary pl-1">CAM_04 (ZONE B)</div>
<span className="text-[10px] text-primary font-bold">ACTIVE</span>
</div>
<div className="bg-surface-container border border-border-subtle p-2 flex items-center gap-3 rounded">
<span className="material-symbols-outlined text-warning">schedule</span>
<div className="flex-1 font-mono-data text-mono-data text-on-surface-variant">CAM_05 (ZONE C)</div>
<span className="text-[10px] text-warning">NEXT 5s</span>
</div>
</div>
<button className="w-full mt-4 bg-primary-container hover:bg-inverse-primary text-white font-label-caps text-label-caps py-3 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-lg">
<span className="material-symbols-outlined text-[18px]">stop_circle</span> 자동 추적 중단 </button>
</div>
</div>
</div>
</main> </> );
};

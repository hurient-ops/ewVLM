import React, { useState } from 'react';

export const MobilePatrolApp: React.FC = () => {
  const [isPttActive, setIsPttActive] = useState(false);

  return ( <>
<main className="flex-1 flex flex-col gap-4 p-container-padding overflow-y-auto pb-24">
{/* Emergency Alert Banner (Global Alert Level 4) */}
<div className="bg-surface-container border-2 border-danger rounded-lg p-3 alert-glow relative overflow-hidden flex flex-col gap-2 cursor-pointer active:scale-95 transition-transform duration-100">
<div className="absolute inset-0 bg-danger/10 animate-pulse"></div>
<div className="relative z-10 flex justify-between items-start">
<div className="flex items-center gap-2 text-danger">
<span className="material-symbols-outlined" data-icon="warning" data-weight="fill">warning</span>
<h2 className="text-title-sm font-title-sm font-bold">침입 감지 - Sector C</h2>
</div>
<span className="text-mono-data font-mono-data text-text-muted">14:02:45</span>
</div>
<div className="relative z-10 flex justify-between items-end">
<p className="text-body-sm font-body-sm text-on-surface-variant w-3/4">CAM-012에서 미인가 인원 감지. 즉시 확인 요망.</p>
<div className="bg-danger text-on-error px-2 py-1 rounded text-osd-label font-osd-label">터치하여 영상 확인</div>
</div>
</div>
{/* Live Viewer & PTZ Area */}
<section className="flex flex-col gap-2">
<div className="flex justify-between items-center">
<h3 className="text-label-caps font-label-caps text-text-muted">현장 라이브 뷰어</h3>
<span className="flex items-center gap-1 text-tertiary text-osd-label font-osd-label"><div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_4px_#4edea3]"></div> 실시간</span>
</div>
{/* Video Frame (Level 2) */}
<div className="relative w-full aspect-video rounded border-2 border-primary-container video-glow active-glow bg-surface-dim overflow-hidden group">
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
{/* Mobile PTZ Joystick (Large touch area) */}
<div className="bg-surface p-4 rounded-lg border border-border-subtle flex flex-col gap-4 mt-2">
<h4 className="text-label-caps font-label-caps text-text-muted text-center">PTZ 제어 (스와이프)</h4>
<div className="flex justify-center items-center h-40">
<div className="w-32 h-32 rounded-full ptz-joystick relative flex items-center justify-center">
{/* Crosshairs */}
<div className="absolute w-full h-[1px] bg-border-subtle"></div>
<div className="absolute h-full w-[1px] bg-border-subtle"></div>
{/* Directional Indicators */}
<span className="material-symbols-outlined absolute top-2 text-text-muted text-sm" data-icon="keyboard_arrow_up">keyboard_arrow_up</span>
<span className="material-symbols-outlined absolute bottom-2 text-text-muted text-sm" data-icon="keyboard_arrow_down">keyboard_arrow_down</span>
<span className="material-symbols-outlined absolute left-2 text-text-muted text-sm" data-icon="keyboard_arrow_left">keyboard_arrow_left</span>
<span className="material-symbols-outlined absolute right-2 text-text-muted text-sm" data-icon="keyboard_arrow_right">keyboard_arrow_right</span>
{/* The Handle */}
<div className="w-16 h-16 rounded-full ptz-handle z-10 flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
<span className="material-symbols-outlined text-text-muted" data-icon="control_camera">control_camera</span>
</div>
</div>
</div>
<div className="flex justify-between gap-2">
<button className="flex-1 py-3 border border-border-subtle rounded text-text-primary font-title-sm hover:bg-surface-variant transition-colors flex justify-center items-center gap-1">
<span className="material-symbols-outlined text-lg" data-icon="zoom_out">zoom_out</span> 줌 아웃 </button>
<button className="flex-1 py-3 border border-border-subtle rounded text-text-primary font-title-sm hover:bg-surface-variant transition-colors flex justify-center items-center gap-1">
<span className="material-symbols-outlined text-lg" data-icon="zoom_in">zoom_in</span> 줌 인 </button>
</div>
</div>
</section>
{/* Communication Panel */}
<section className="flex flex-col gap-2 mt-4">
<h3 className="text-label-caps font-label-caps text-text-muted">통신 및 제어</h3>
<div className="grid grid-cols-2 gap-2">
{/* PTT Button (Very Large) */}
<button 
  className={`col-span-2 py-4 text-white rounded-lg font-title-sm flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-transform shadow-[0_0_10px_rgba(124,58,237,0.3)] ${isPttActive ? 'bg-danger' : 'bg-primary-container'}`}
  onMouseDown={() => setIsPttActive(true)}
  onMouseUp={() => setIsPttActive(false)}
  onTouchStart={() => setIsPttActive(true)}
  onTouchEnd={() => setIsPttActive(false)}
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
</section>
</main> </> );
};

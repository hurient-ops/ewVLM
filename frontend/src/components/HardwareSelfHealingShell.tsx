import React, { useState } from 'react';

export const HardwareSelfHealingShell: React.FC = () => {
  const [isHealing, setIsHealing] = useState(false);

  const handleHealing = () => {
    setIsHealing(true);
    setTimeout(() => setIsHealing(false), 3000);
  };

  return ( <>
<main className="h-[calc(100vh-3.5rem)] p-container-padding flex gap-unit overflow-hidden">
{/* Left Column: Camera Feed & Primary Controls */}
<div className="w-2/3 flex flex-col gap-unit h-full">
{/* Video Feed Area */}
<div className="relative bg-surface rounded flex-grow border-2 border-border-subtle overflow-hidden flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
{/* Using placeholder for camera feed */}
<img className="absolute inset-0 w-full h-full object-cover opacity-60" data-alt="A highly detailed, gritty, high-contrast industrial security camera feed showing an outdoor perimeter at dusk. The scene is illuminated by harsh sodium-vapor floodlights, casting deep shadows across concrete barriers and chain-link fences. The image has a subtle digital noise grain and scanlines typical of a tactical surveillance feed. The overall mood is tense and secure, fitting a mission-critical military or high-end corporate facility context." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBL6lv80Gg85sr0F5jplwPRxrDrvg32Lk8bS-yRabyvPd6vg1ohQ1JMo62-rKH7zdu1C3bedK7TYVt0a8EGtZVgPhpjclNQe4lB2Igf6fbQrGIsYH3dlr_14O1b-KtipZ3bcX82pSVX879Nxml0iQRL2uEb_zBTcdGpyimdyiG1rg3AKaGhC0EPFagnae2UyEeqspZwxnAJGpRxw3DO1XTl7MEi79iiAUyeHE2QcRkI2wquTYUyXBxyJQ"/>
{/* OSD Elements */}
<div className="absolute top-osd-margin left-osd-margin text-osd-label font-osd-label text-white bg-black/50 px-2 py-1 rounded">CAM-042-NORTH // 4K 60FPS</div>
<div className="absolute top-osd-margin right-osd-margin flex gap-2">
<span className="text-osd-label font-osd-label text-warning bg-black/50 px-2 py-1 rounded border border-warning/50">HEATER: ON</span>
<span className="text-osd-label font-osd-label text-tertiary bg-black/50 px-2 py-1 rounded">WIPER: IDLE</span>
</div>
{/* Crosshair overlay */}
<div className="absolute inset-0 pointer-events-none flex items-center justify-center">
<div className="w-16 h-16 border border-primary/30 rounded-full relative">
<div className="absolute top-1/2 left-0 w-full h-px bg-primary/30 -translate-y-1/2"></div>
<div className="absolute left-1/2 top-0 w-px h-full bg-primary/30 -translate-x-1/2"></div>
</div>
</div>
<div className="absolute bottom-osd-margin left-osd-margin right-osd-margin flex justify-between items-end">
<div className="bg-surface/80 backdrop-blur border border-border-subtle p-2 rounded flex gap-4">
<div className="flex flex-col">
<span className="text-label-caps font-label-caps text-text-muted">FOCUS</span>
<span className="text-mono-data font-mono-data text-on-surface">AF-C 98%</span>
</div>
<div className="w-px h-full bg-border-subtle"></div>
<div className="flex flex-col">
<span className="text-label-caps font-label-caps text-text-muted">IRIS</span>
<span className="text-mono-data font-mono-data text-on-surface">f/1.4 AUTO</span>
</div>
</div>
{/* Self-Healing Trigger */}
<button 
  className={`px-4 py-2 rounded text-label-caps font-label-caps flex items-center gap-2 shadow-lg transition-colors border ${isHealing ? 'bg-inverse-primary border-primary text-white' : 'bg-primary-container hover:bg-inverse-primary text-white border-primary'}`}
  onClick={handleHealing}
  disabled={isHealing}
>
<span className={`material-symbols-outlined text-[18px] ${isHealing ? 'animate-spin' : ''}`} data-icon="auto_fix">auto_fix</span> {isHealing ? '자율 복구 진행 중...' : '자율 복구 시작'} </button>
</div>
</div>
{/* Lower Diagnostics Panel */}
<div className="h-1/3 flex gap-unit">
{/* Power & Environment */}
<div className="data-card p-4 rounded flex-1 flex flex-col">
<h3 className="text-label-caps font-label-caps text-text-muted mb-4 border-b border-border-subtle pb-2">전력 및 온도</h3>
<div className="flex-grow grid grid-cols-2 gap-4">
<div>
<div className="text-mono-data font-mono-data text-text-muted mb-1">PoE 입력 전압</div>
<div className="text-title-sm font-title-sm text-on-surface flex items-end gap-2"> 48.2 <span className="text-body-sm font-body-sm text-text-muted">VDC</span>
<span className="material-symbols-outlined text-tertiary text-[16px]" data-icon="check_circle">check_circle</span>
</div>
</div>
<div>
<div className="text-mono-data font-mono-data text-text-muted mb-1">소비 전류</div>
<div className="text-title-sm font-title-sm text-on-surface flex items-end gap-2"> 14.5 <span className="text-body-sm font-body-sm text-text-muted">W</span>
</div>
</div>
<div>
<div className="text-mono-data font-mono-data text-text-muted mb-1">내부 온도</div>
<div className="text-title-sm font-title-sm text-warning flex items-end gap-2"> 42.5 <span className="text-body-sm font-body-sm text-text-muted">°C</span>
<span className="material-symbols-outlined text-warning text-[16px]" data-icon="warning">warning</span>
</div>
<div className="w-full bg-surface-container-highest h-1 mt-2 rounded overflow-hidden">
<div className="bg-warning h-full w-[85%]"></div>
</div>
</div>
<div>
<div className="text-mono-data font-mono-data text-text-muted mb-1">HEATER/FAN STATUS</div>
<div className="flex items-center gap-3 mt-1">
<span className="px-2 py-1 bg-surface-container-high rounded text-mono-data font-mono-data text-warning border border-warning/30">HTR: ON</span>
<span className="px-2 py-1 bg-surface-container-high rounded text-mono-data font-mono-data text-on-surface-variant">FAN: OFF</span>
</div>
</div>
</div>
</div>
{/* Physical Mechanisms */}
<div className="data-card p-4 rounded w-1/3 flex flex-col">
<h3 className="text-label-caps font-label-caps text-text-muted mb-4 border-b border-border-subtle pb-2">물리 장치 상태</h3>
<div className="flex flex-col gap-4 flex-grow justify-center">
<div className="flex justify-between items-center">
<span className="text-body-sm font-body-sm text-on-surface-variant">Wiper Motor</span>
<button className="border border-border-subtle hover:bg-surface-container-high px-3 py-1 rounded text-label-caps font-label-caps text-on-surface transition-colors flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]" data-icon="water_drop">water_drop</span> 테스트 </button>
</div>
<div className="flex justify-between items-center">
<span className="text-body-sm font-body-sm text-on-surface-variant">PTZ Motors</span>
<span className="text-mono-data font-mono-data text-tertiary flex items-center gap-1">
<span className="status-dot active"></span> NOMINAL </span>
</div>
<div className="flex justify-between items-center">
<span className="text-body-sm font-body-sm text-on-surface-variant">Housing Seal</span>
<span className="text-mono-data font-mono-data text-tertiary flex items-center gap-1">
<span className="status-dot active"></span> INTACT </span>
</div>
</div>
</div>
</div>
</div>
{/* Right Column: Diagnostics & Controls */}
<div className="w-1/3 flex flex-col gap-unit h-full">
{/* Lens Calibration */}
<div className="data-card p-4 rounded flex flex-col gap-4">
<h3 className="text-label-caps font-label-caps text-text-muted border-b border-border-subtle pb-2 flex justify-between items-center"> 광학 캘리브레이션 <span className="material-symbols-outlined text-[16px]" data-icon="camera">camera</span>
</h3>
<div className="bg-surface-container-low p-3 rounded border border-border-subtle">
<div className="flex justify-between mb-2">
<span className="text-body-sm font-body-sm text-on-surface-variant">백 포커스 정렬</span>
<span className="text-mono-data font-mono-data text-warning">저하됨 (-12%)</span>
</div>
<p className="text-body-sm font-body-sm text-text-muted mb-4">Thermal expansion detected affecting back-plane focus. Remote calibration recommended.</p>
<button className="w-full bg-surface-container hover:bg-surface-container-high border border-primary/50 text-primary px-4 py-2 rounded text-label-caps font-label-caps flex items-center justify-center gap-2 transition-colors">
<span className="material-symbols-outlined text-[16px]" data-icon="center_focus_strong">center_focus_strong</span> 원격 캘리브레이션 실행 </button>
</div>
{/* Jog Control Simulation */}
<div className="mt-2 flex justify-center">
<div className="w-32 h-32 rounded-full border-2 border-border-subtle bg-surface-container-low relative flex items-center justify-center shadow-inner">
<div className="w-16 h-16 rounded-full border border-border-subtle bg-surface-container-highest cursor-pointer hover:bg-surface-variant transition-colors flex items-center justify-center shadow-lg">
<div className="w-2 h-2 rounded-full bg-primary/50"></div>
</div>
{/* Axis markers */}
<div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-2 bg-text-muted"></div>
<div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-2 bg-text-muted"></div>
<div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-1 bg-text-muted"></div>
<div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-1 bg-text-muted"></div>
</div>
</div>
<div className="text-center text-label-caps font-label-caps text-text-muted mt-2">MICRO-STEP FOCUS JOG</div>
</div>
{/* Event Log / System Log */}
<div className="data-card rounded flex-grow flex flex-col overflow-hidden">
<h3 className="text-label-caps font-label-caps text-text-muted p-4 border-b border-border-subtle bg-surface-container-low">시스템 진단 로그</h3>
<div className="flex-grow overflow-y-auto p-4 flex flex-col gap-2">
<div className="flex gap-3 text-mono-data font-mono-data items-start">
<span className="text-text-muted whitespace-nowrap">14:02:11.45</span>
<span className="text-warning">[WARN]</span>
<span className="text-on-surface-variant">Internal temp threshold exceeded (42.5C). Heater shutdown initiated.</span>
</div>
<div className="flex gap-3 text-mono-data font-mono-data items-start">
<span className="text-text-muted whitespace-nowrap">14:01:50.02</span>
<span className="text-tertiary">[INFO]</span>
<span className="text-on-surface-variant">PoE negotiation stabilized at IEEE 802.3at (Class 4).</span>
</div>
<div className="flex gap-3 text-mono-data font-mono-data items-start">
<span className="text-text-muted whitespace-nowrap">13:45:00.00</span>
<span className="text-tertiary">[INFO]</span>
<span className="text-on-surface-variant">Scheduled health check completed. All mechanical systems nominal.</span>
</div>
<div className="flex gap-3 text-mono-data font-mono-data items-start">
<span className="text-text-muted whitespace-nowrap">12:15:22.88</span>
<span className="text-primary">[SYS]</span>
<span className="text-on-surface-variant">Auto-focus routine completed successfully.</span>
</div>
<div className="flex gap-3 text-mono-data font-mono-data items-start opacity-50">
<span className="text-text-muted whitespace-nowrap">11:00:05.12</span>
<span className="text-danger">[ERR]</span>
<span className="text-on-surface-variant">Network latency spike detected (150ms).</span>
</div>
</div>
</div>
</div>
</main> </> );
};

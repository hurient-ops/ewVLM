import React, { useState } from 'react';

export const PrivacyExportWorkshop: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2500);
  };

  return ( <>
<main className="flex-1 flex overflow-hidden">
{/* Left/Center: Canvas & Timeline */}
<div className="flex-1 flex flex-col min-w-0 border-r border-border-subtle">
{/* Editor Canvas Area */}
<div className="flex-1 relative bg-surface-container-lowest bg-tech-grid flex items-center justify-center p-container-padding overflow-hidden">
{/* Floating Toolbar (Left) */}
<div className="absolute left-container-padding top-container-padding bg-surface border border-border-subtle rounded-lg flex flex-col gap-1 p-1 shadow-sm z-10">
<button className="w-10 h-10 flex items-center justify-center rounded hover:bg-surface-variant text-text-muted hover:text-primary transition-colors" title="선택">
<span className="material-symbols-outlined">arrow_selector_tool</span>
</button>
<div className="w-8 h-px bg-border-subtle my-1"></div>
<button className="w-10 h-10 flex items-center justify-center rounded bg-primary-container text-on-primary-container" title="수동 마스크 브러시">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>brush</span>
</button>
<button className="w-10 h-10 flex items-center justify-center rounded hover:bg-surface-variant text-text-muted hover:text-primary transition-colors" title="지우개">
<span className="material-symbols-outlined">ink_eraser</span>
</button>
<div className="w-8 h-px bg-border-subtle my-1"></div>
<button className="w-10 h-10 flex items-center justify-center rounded hover:bg-surface-variant text-secondary hover:text-secondary-fixed transition-colors relative" title="VLM 자동 마스크">
<span className="material-symbols-outlined">psychology</span>
<span className="absolute top-1 right-1 w-2 h-2 bg-secondary-container rounded-full"></span>
</button>
</div>
{/* Video Frame Container */}
<div className="relative w-full max-w-4xl aspect-video border-[2px] border-border-subtle rounded bg-black shadow-[0_4px_12px_rgba(0,0,0,0.5)] overflow-hidden">
{/* Video Placeholder Image */}
<div className="absolute inset-0 bg-cover bg-center opacity-85" data-alt="A still frame from a high-definition CCTV security camera monitoring a busy urban intersection at night. The lighting is characterized by harsh, high-contrast neon signs and streetlamps piercing through a dark, moody atmosphere. Several vehicles and pedestrians are visible, serving as subjects for automated privacy redaction. The visual style is realistic, gritty, and industrial-grade, fitting a professional surveillance system context." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBWzN3ugr8EzYLAirjd1Y2fPLIJKeU_lcL5s6sfxgZ1gEYfAW6hq7-8usrYQmzaPqB4zwazYAwvdGv3gMCDRg-aQbQWoK1PZcnK0in7AgG2LP4cyuTiix3v_14ZnM3P6B8QkcvlDEqRkDLSEZVgv_opzw79H9aXLTknsGYerF8ot3ybXqSqkocg_9nZuR9qTOaSPdZSa-IZkN_DASa1R67mlxCnBEnojBay8a-2HB1eoDKe7RyM022eGw')" }}></div>
{/* OSD Overlays / Redaction Zones */}
{/* Automated Face Blur */}
<div className="absolute top-[35%] left-[45%] w-16 h-16 border-2 border-primary-container/80 bg-black/60 backdrop-blur-xl rounded-sm flex items-start justify-start p-1 shadow-[0_0_8px_rgba(124,58,237,0.4)]">
<span className="font-osd-label text-osd-label text-primary-fixed bg-black/50 px-1 rounded-sm">VLM: FACE</span>
</div>
{/* Manual License Plate Mask (Solid Black) */}
<div className="absolute top-[60%] left-[20%] w-24 h-8 border border-border-subtle bg-black rounded-sm flex items-start justify-start p-1">
<span className="font-osd-label text-osd-label text-text-muted">MANUAL</span>
</div>
{/* Crosshair / Reticle Overlay (Subtle) */}
<div className="absolute inset-0 pointer-events-none opacity-20">
<div className="absolute top-1/2 left-0 w-full h-px bg-primary-fixed"></div>
<div className="absolute top-0 left-1/2 w-px h-full bg-primary-fixed"></div>
</div>
</div>
{/* Floating Tool Settings (Right - context aware) */}
<div className="absolute right-container-padding top-container-padding bg-surface border border-border-subtle rounded-lg p-3 w-48 shadow-sm flex flex-col gap-3">
<div className="font-label-caps text-label-caps text-text-muted mb-1">브러시 설정</div>
<div>
<div className="flex justify-between font-mono-data text-mono-data text-text-primary mb-1">
<span>크기</span>
<span>24px</span>
</div>
<div className="h-1 bg-surface-variant rounded-full overflow-hidden">
<div className="h-full bg-primary-container w-[40%]"></div>
</div>
</div>
<div className="flex flex-col gap-2 mt-2">
<label className="flex items-center gap-2 cursor-pointer group">
<div className="w-4 h-4 rounded-full border border-primary-container bg-primary-container flex items-center justify-center">
<div className="w-1.5 h-1.5 rounded-full bg-on-primary-container"></div>
</div>
<span className="font-body-sm text-body-sm text-primary group-hover:text-white">모자이크</span>
</label>
<label className="flex items-center gap-2 cursor-pointer group">
<div className="w-4 h-4 rounded-full border border-border-subtle group-hover:border-primary-container flex items-center justify-center"></div>
<span className="font-body-sm text-body-sm text-text-muted group-hover:text-primary">단색 채우기</span>
</label>
</div>
</div>
</div>
{/* Timeline & Frame Control */}
<div className="h-56 bg-surface border-t border-border-subtle flex flex-col shrink-0">
{/* Transport Controls */}
<div className="h-12 border-b border-border-subtle bg-surface-container-low flex items-center justify-between px-4">
<div className="flex items-center gap-2">
<button className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-primary rounded hover:bg-surface-variant"><span className="material-symbols-outlined">skip_previous</span></button>
<button className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-primary rounded hover:bg-surface-variant"><span className="material-symbols-outlined">fast_rewind</span></button>
<button className="w-10 h-10 flex items-center justify-center text-on-surface bg-surface-variant hover:bg-surface-bright rounded-full mx-1"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span></button>
<button className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-primary rounded hover:bg-surface-variant"><span className="material-symbols-outlined">fast_forward</span></button>
<button className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-primary rounded hover:bg-surface-variant"><span className="material-symbols-outlined">skip_next</span></button>
</div>
<div className="font-mono-data text-mono-data text-primary bg-surface px-3 py-1 rounded border border-border-subtle tracking-widest"> 00:04:22:15 / 00:15:00:00 </div>
</div>
{/* Tracks Area */}
<div className="flex-1 relative overflow-y-auto overflow-x-hidden p-2 flex flex-col gap-1">
{/* Playhead (absolute overlay) */}
<div className="absolute top-0 bottom-0 left-[30%] w-[2px] bg-warning z-20 pointer-events-none">
<div className="absolute top-0 -left-[4px] w-[10px] h-3 bg-warning clip-path-playhead rounded-b-sm"></div>
</div>
{/* Time Ruler */}
<div className="h-6 flex items-end border-b border-border-subtle mb-1 relative">
<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDEwbTAtNSB2NW0xMC01IHY1bTEwLTUgdjVtMTAteS4uLiIgLz4=')] opacity-20"></div> {/* Mock ruler texture */}
<div className="w-full h-full flex justify-between font-mono-data text-mono-data text-[10px] text-text-muted px-2">
<span>04:20</span>
<span>04:21</span>
<span>04:22</span>
<span className="text-warning">04:23</span>
<span>04:24</span>
<span>04:25</span>
</div>
</div>
{/* Track 1: Source Video */}
<div className="flex h-12 bg-surface-container-low border border-border-subtle rounded-sm overflow-hidden group">
<div className="w-24 bg-surface border-r border-border-subtle flex flex-col justify-center px-2 shrink-0">
<span className="font-label-caps text-[10px] text-text-muted">CH_01</span>
<span className="font-body-sm text-[11px] text-primary truncate">원본 피드</span>
</div>
<div className="flex-1 relative bg-surface-variant/30">
{/* Video clip representation */}
<div className="absolute top-1 bottom-1 left-4 right-12 bg-surface-variant border border-border-subtle rounded-sm overflow-hidden">
{/* Fake thumbnails */}
<div className="w-full h-full flex opacity-30 mix-blend-screen bg-[url('placeholder')] bg-cover" data-alt="Abstract sequence of small video thumbnails showing urban traffic flow, creating a textured bar representing a continuous video timeline track in an editing interface."></div>
</div>
</div>
</div>
{/* Track 2: VLM Auto Mask */}
<div className="flex h-10 bg-surface-container-low border border-border-subtle rounded-sm overflow-hidden group">
<div className="w-24 bg-surface border-r border-border-subtle flex flex-col justify-center px-2 shrink-0">
<span className="font-label-caps text-[10px] text-secondary">AI LAYER</span>
<span className="font-body-sm text-[11px] text-primary truncate">자동 블러</span>
</div>
<div className="flex-1 relative bg-surface-variant/20">
{/* Mask clip */}
<div className="absolute top-1.5 bottom-1.5 left-20 right-32 bg-secondary-container/40 border border-secondary-container rounded-sm flex items-center px-2">
<span className="font-mono-data text-[10px] text-on-secondary-container">감지됨: 14 개체</span>
</div>
</div>
</div>
{/* Track 3: Manual Mask */}
<div className="flex h-10 bg-surface-container-low border border-border-subtle rounded-sm overflow-hidden group">
<div className="w-24 bg-surface border-r border-border-subtle flex flex-col justify-center px-2 shrink-0">
<span className="font-label-caps text-[10px] text-text-muted">USER LAYER</span>
<span className="font-body-sm text-[11px] text-primary truncate">마스크 01</span>
</div>
<div className="flex-1 relative bg-surface-variant/20">
{/* Manual keyframes */}
<div className="absolute top-1.5 bottom-1.5 left-[28%] w-48 bg-surface-bright border border-outline-variant rounded-sm flex items-center justify-between px-1">
<div className="w-2 h-2 rotate-45 bg-primary-container"></div>
<div className="w-2 h-2 rotate-45 bg-primary-container"></div>
</div>
</div>
</div>
</div>
</div>
</div>
{/* Right Settings Panel */}
<aside className="w-sidebar-width bg-surface flex flex-col overflow-y-auto">
<div className="p-4 border-b border-border-subtle">
<h2 className="font-headline-md text-title-sm text-primary">반출 설정</h2>
<p className="font-body-sm text-body-sm text-text-muted mt-1">생성 전 출력 포맷 및 보안 제약을 설정합니다.</p>
</div>
{/* Output Settings */}
<div className="p-4 border-b border-border-subtle flex flex-col gap-4">
<h3 className="font-label-caps text-label-caps text-text-muted flex items-center gap-2">
<span className="material-symbols-outlined" style={{ fontSize: "16px" }}>video_settings</span> 미디어 사양 </h3>
<div className="flex flex-col gap-1.5">
<label className="font-body-sm text-body-sm text-text-primary">코덱</label>
<div className="relative">
<select className="w-full bg-surface-container-low border border-border-subtle text-primary text-body-sm rounded p-2 appearance-none focus:outline-none focus:border-primary-container">
<option>H.265 (HEVC) - 고효율</option>
<option>H.264 (AVC) - 표준</option>
<option>ProRes 422 - 무손실</option>
</select>
<span className="material-symbols-outlined absolute right-2 top-2.5 text-text-muted pointer-events-none" style={{ fontSize: "18px" }}>expand_more</span>
</div>
</div>
<div className="flex gap-4">
<div className="flex-1 flex flex-col gap-1.5">
<label className="font-body-sm text-body-sm text-text-primary">해상도</label>
<select className="w-full bg-surface-container-low border border-border-subtle text-primary text-body-sm rounded p-2 appearance-none">
<option>1080p (Native)</option>
<option>720p</option>
</select>
</div>
<div className="flex-1 flex flex-col gap-1.5">
<label className="font-body-sm text-body-sm text-text-primary">프레임레이트</label>
<select className="w-full bg-surface-container-low border border-border-subtle text-primary text-body-sm rounded p-2 appearance-none">
<option>30 fps</option>
<option>60 fps</option>
</select>
</div>
</div>
</div>
{/* Security & Watermark */}
<div className="p-4 border-b border-border-subtle flex flex-col gap-4">
<h3 className="font-label-caps text-label-caps text-text-muted flex items-center gap-2">
<span className="material-symbols-outlined" style={{ fontSize: "16px" }}>security</span> 증거 보전 </h3>
<div className="flex items-center justify-between">
<div>
<div className="font-body-sm text-body-sm text-primary">워터마크 각인</div>
<div className="font-mono-data text-[10px] text-text-muted">사용자 ID 및 타임스탬프 오버레이</div>
</div>
{/* Toggle Switch */}
<div className="w-10 h-5 bg-primary-container rounded-full relative cursor-pointer">
<div className="absolute right-1 top-0.5 w-4 h-4 bg-on-primary-container rounded-full"></div>
</div>
</div>
<div className="flex flex-col gap-1.5">
<label className="font-body-sm text-body-sm text-text-primary">사용자 정의 워터마크 텍스트</label>
<input className="w-full bg-surface-container-low border border-border-subtle text-primary text-body-sm rounded p-2 focus:outline-none focus:border-primary-container font-mono-data" type="text" value="대외비 - 배포 금지"/>
</div>
<div className="w-full h-px bg-border-subtle my-2"></div>
<div className="flex items-center justify-between">
<div>
<div className="font-body-sm text-body-sm text-primary">아카이브 암호화</div>
<div className="font-mono-data text-[10px] text-text-muted">AES-256으로 .zip 컨테이너 보호</div>
</div>
{/* Toggle Switch (Off) */}
<div className="w-10 h-5 bg-surface-variant border border-border-subtle rounded-full relative cursor-pointer">
<div className="absolute left-1 top-0.5 w-3.5 h-3.5 bg-text-muted rounded-full"></div>
</div>
</div>
<div className="flex flex-col gap-1.5 opacity-50 pointer-events-none">
<label className="font-body-sm text-body-sm text-text-primary">복호화 비밀번호</label>
<input className="w-full bg-surface-container-low border border-border-subtle text-primary text-body-sm rounded p-2" placeholder="비밀번호 입력..." type="password"/>
</div>
</div>
{/* Footer Action */}
<div className="mt-auto p-4 bg-surface-container-low border-t border-border-subtle flex flex-col gap-3">
<div className="flex justify-between font-mono-data text-mono-data text-text-muted">
<span>예상 파일 크기:</span>
<span className="text-primary">~45.2 MB</span>
</div>
<button 
  className={`w-full font-label-caps text-label-caps py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm ${isExporting ? 'bg-surface-variant text-text-muted cursor-not-allowed' : 'bg-primary-container hover:bg-primary-container/90 text-on-primary-container'}`}
  onClick={handleExport}
  disabled={isExporting}
>
<span className={`material-symbols-outlined ${isExporting ? 'animate-spin' : ''}`} style={{ fontSize: "18px" }}>{isExporting ? 'sync' : 'output'}</span> {isExporting ? '반출 진행 중...' : '반출 실행'} </button>
</div>
</aside>
</main> </> );
};

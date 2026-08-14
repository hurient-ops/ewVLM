import React, { useState } from 'react';
import { API } from '../api/client';

export const GeometryCalibrationConsole: React.FC = () => {
  const [altitude, setAltitude] = useState<number>(4.25);
  const [tilt, setTilt] = useState<number>(-15.2);
  const [focalLength, setFocalLength] = useState<number>(4.0);

  const handleSave = () => {
    API.saveCalibration('CH-04', altitude, tilt, focalLength)
      .then(res => {
        alert('보정값이 성공적으로 저장되었습니다.');
        console.log(res);
      })
      .catch(err => {
        alert('저장 실패');
        console.error(err);
      });
  };

  return ( <>
<main className="flex-1 p-container-padding flex flex-col gap-4 overflow-y-auto bg-background">
<header className="flex justify-between items-end pb-4 border-b border-border-subtle">
<div>
<h1 className="text-headline-md font-headline-md text-text-primary">3차원 기하학 좌표계 보정 및 가상 펜스 설정 콘솔</h1>
<p className="text-text-muted text-body-base font-body-base mt-1">Camera CH-04 / North Gate Perimeter</p>
</div>
<div className="flex gap-2">
<button className="px-4 py-2 border border-border-subtle text-on-surface hover:bg-surface-container-highest transition-colors rounded text-body-sm font-body-sm font-semibold">매트릭스 초기화</button>
<button className="px-4 py-2 bg-primary-container text-on-primary-container hover:bg-inverse-primary transition-colors rounded text-body-sm font-body-sm font-semibold flex items-center gap-2" onClick={handleSave}>
<span className="material-symbols-outlined text-sm">save</span> 보정 적용 </button>
</div>
</header>
<div className="flex gap-4 flex-1 h-full min-h-0">
{/* Viewport */}
<div className="flex-1 bg-surface border border-border-subtle rounded-lg flex flex-col overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)] relative group">
<div className="absolute top-0 left-0 w-full p-2 bg-gradient-to-b from-background/80 to-transparent z-10 flex justify-between items-start pointer-events-none">
<div className="flex flex-col gap-1">
<span className="bg-surface-container-lowest/80 border border-border-subtle px-2 py-1 rounded text-osd-label font-osd-label text-neon-gold backdrop-blur-sm inline-flex items-center gap-1">
<span className="w-2 h-2 rounded-full bg-neon-gold blur-[2px] animate-pulse"></span> LIVE CALIBRATION MODE </span>
<span className="text-mono-data font-mono-data text-primary-fixed-dim bg-background/50 px-1 rounded inline-block">FOV: 82.4° | TILT: -15.2°</span>
</div>
<div className="flex gap-2 pointer-events-auto">
<button className="p-1.5 bg-surface-container border border-border-subtle rounded hover:bg-surface-container-highest text-text-muted transition-colors" title="Toggle Grid">
<span className="material-symbols-outlined text-sm">grid_on</span>
</button>
<button className="p-1.5 bg-surface-container border border-border-subtle rounded hover:bg-surface-container-highest text-text-muted transition-colors" title="Overlay Virtual Fence">
<span className="material-symbols-outlined text-sm">fence</span>
</button>
</div>
</div>
{/* Simulated Camera Feed with Calibration Overlay */}
<div className="relative w-full h-full bg-surface-container-lowest grid-overlay overflow-hidden">
<img alt="Camera Feed Background" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen" data-alt="A wide-angle, high-resolution security camera feed looking down at an industrial perimeter fence line during dusk. The scene is slightly desaturated, emphasizing the concrete textures and steel fencing. A digital 3D perspective grid in bright primary violet is overlaid on the ground plane, receding towards the horizon, simulating a calibration tool interface. Technical, precise, dark mode aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoMFKlCS3W7LW3VPx4asiUb-QnQ4mJw0rZ_tDnHyZ7JFeB7gb-TNnOyFlfQmZIj6bVaNp73b9sIwohnNMTwZ7TQAhoVXYgaKHGtl9xTuSxWEP0oF_dxJLhAnjhPOlEO-SQTaVDgTW-nhbbJ8jiVwBY-QcJMcj3oBevhl-ztrtstonX15QrgJF0NYCyDxUx4SW5DKL8iwq5z3QiBajpE8fh7wDVSqIE1vgef7diEuY3RPkYVtQVxjqm6Q"/>
{/* 3D Perspective Lines (SVG Overlay) */}
<svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 600">
<defs>
<linearGradient id="grid-fade" x1="0" x2="0" y1="1" y2="0">
<stop offset="0%" stop-color="#7c3aed" stop-opacity="0.8"></stop>
<stop offset="100%" stop-color="#7c3aed" stop-opacity="0"></stop>
</linearGradient>
</defs>
{/* Horizon */}
<line stroke="#7D8D9F" stroke-dasharray="4 4" strokeWidth="1" x1="0" x2="1000" y1="200" y2="200"></line>
{/* Perspective Grid */}
<path d="M 500 200 L 100 600 M 500 200 L 300 600 M 500 200 L 500 600 M 500 200 L 700 600 M 500 200 L 900 600" stroke="url(#grid-fade)" strokeWidth="1.5"></path>
<path d="M 0 300 L 1000 300 M 0 400 L 1000 400 M 0 500 L 1000 500" stroke="url(#grid-fade)" strokeWidth="1"></path>
{/* Virtual Fence Setup Indicator */}
<polygon fill="rgba(245, 158, 11, 0.1)" points="300,500 700,450 750,550 350,600" stroke="#F59E0B" stroke-dasharray="5 5" strokeWidth="2"></polygon>
{/* Origin Point */}
<circle cx="500" cy="400" fill="#7c3aed" r="4"></circle>
<circle className="animate-ping" cx="500" cy="400" fill="none" r="12" stroke="#7c3aed" strokeWidth="1"></circle>
<text fill="#eaddff" font-family="JetBrains Mono" font-size="12" x="515" y="395">Origin (0,0,0)</text>
</svg>
</div>
</div>
{/* Parameters Panel */}
<div className="w-80 flex flex-col gap-4">
{/* Sensor Data Card */}
<div className="bg-surface border border-border-subtle rounded-lg p-4 shadow-sm">
<h3 className="text-title-sm font-title-sm text-on-surface mb-3 flex items-center gap-2 border-b border-border-subtle pb-2">
<span className="material-symbols-outlined text-primary text-sm">tune</span> 기하학 파라미터 </h3>
<div className="space-y-4">
<div>
<label className="block text-osd-label font-osd-label text-text-muted mb-1">설치 고도 (Z축)</label>
<div className="flex items-center bg-surface-container rounded border border-border-subtle focus-within:border-primary transition-colors px-2">
<input className="w-full bg-transparent border-none text-on-surface text-mono-data font-mono-data focus:ring-0 px-1 py-1.5 h-8" step="0.01" type="number" value={altitude} onChange={(e) => setAltitude(parseFloat(e.target.value))}/>
<span className="text-text-muted text-mono-data font-mono-data pr-1">m</span>
</div>
</div>
<div>
<label className="block text-osd-label font-osd-label text-text-muted mb-1">틸트 각도 (Pitch)</label>
<div className="flex items-center bg-surface-container rounded border border-border-subtle focus-within:border-primary transition-colors px-2">
<input className="w-full bg-transparent border-none text-on-surface text-mono-data font-mono-data focus:ring-0 px-1 py-1.5 h-8" step="0.1" type="number" value={tilt} onChange={(e) => setTilt(parseFloat(e.target.value))}/>
<span className="text-text-muted text-mono-data font-mono-data pr-1">°</span>
</div>
</div>
<div>
<label className="block text-osd-label font-osd-label text-text-muted mb-1">초점 거리</label>
<div className="flex items-center bg-surface-container rounded border border-border-subtle focus-within:border-primary transition-colors px-2">
<input className="w-full bg-transparent border-none text-on-surface text-mono-data font-mono-data focus:ring-0 px-1 py-1.5 h-8" step="0.1" type="number" value={focalLength} onChange={(e) => setFocalLength(parseFloat(e.target.value))}/>
<span className="text-text-muted text-mono-data font-mono-data pr-1">mm</span>
</div>
</div>
</div>
</div>
{/* Virtual Fence Tools */}
<div className="bg-surface border border-border-subtle rounded-lg p-4 shadow-sm flex-1">
<h3 className="text-title-sm font-title-sm text-on-surface mb-3 flex items-center gap-2 border-b border-border-subtle pb-2">
<span className="material-symbols-outlined text-warning text-sm">polyline</span> 가상 펜스 설정 </h3>
<div className="space-y-3">
<button className="w-full border border-border-subtle bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface rounded py-2 text-body-sm font-body-sm flex justify-center items-center gap-2">
<span className="material-symbols-outlined text-sm">draw</span> 3D 폴리곤 그리기 </button>
<div className="bg-surface-container-lowest border border-border-subtle rounded p-2 mt-4">
<div className="text-osd-label font-osd-label text-text-muted mb-2 uppercase">활성 구역</div>
<div className="flex items-center justify-between p-2 bg-surface-container rounded border-l-2 border-warning">
<span className="text-mono-data font-mono-data text-on-surface text-xs">Perimeter_A</span>
<span className="material-symbols-outlined text-text-muted text-[16px] cursor-pointer hover:text-danger">delete</span>
</div>
</div>
</div>
</div>
</div>
</div>
</main> </> );
};

import React from 'react'; export const NvrStorageDashboard: React.FC = () => { return ( <>
<main className="flex-1 p-container-padding flex flex-col gap-4 overflow-hidden relative">
{/* Header Section */}
<div className="flex justify-between items-end pb-2 border-b border-border-subtle">
<div>
<h1 className="text-headline-md lg:text-[28px] font-display-lg text-primary whitespace-nowrap overflow-hidden text-ellipsis">NVR 스토리지 및 하드웨어 상태 검수 대시보드</h1>
<p className="text-body-base font-body-base text-text-muted mt-1">스토리지 및 녹화 서버 상태 모니터링</p>
</div>
<div className="flex items-center gap-4 text-mono-data font-mono-data">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-tertiary led-safe"></div>
<span className="text-tertiary">시스템 정상</span>
</div>
<div className="px-2 py-1 bg-surface-variant rounded border border-border-subtle"> 가동 시간: 94일 14시간 22분 </div>
</div>
</div>
{/* Dashboard Grid */}
<div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
{/* Left Column: NVR Assets */}
<div className="col-span-12 lg:col-span-4 flex flex-col gap-4 min-h-0">
<div className="bg-surface rounded-lg border border-border-subtle flex flex-col flex-1 overflow-hidden shadow-lg shadow-black/50 relative">
{/* Glassmorphism accent */}
<div className="absolute inset-0 bg-gradient-to-br from-surface-variant/20 to-transparent pointer-events-none"></div>
<div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-container-low">
<h3 className="text-title-sm font-title-sm flex items-center gap-2">
<span className="material-symbols-outlined text-primary">dns</span> 녹화 서버 </h3>
<span className="text-mono-data font-mono-data text-text-muted">3 노드</span>
</div>
<div className="p-4 flex flex-col gap-4 overflow-y-auto">
{/* Node 1 */}
<div className="p-3 border border-border-subtle rounded bg-surface-container relative">
<div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary rounded-l"></div>
<div className="flex justify-between items-start mb-2">
<div className="flex flex-col">
<span className="text-label-caps font-label-caps text-on-surface">NVR-01-PRIMARY</span>
<span className="text-mono-data font-mono-data text-text-muted mt-1">10.0.4.12</span>
</div>
<div className="flex items-center gap-1 bg-tertiary/10 px-2 py-0.5 rounded border border-tertiary/30">
<div className="w-1.5 h-1.5 rounded-full bg-tertiary led-safe"></div>
<span className="text-mono-data font-mono-data text-tertiary">활성</span>
</div>
</div>
<div className="grid grid-cols-2 gap-4 mt-4 text-mono-data font-mono-data">
<div>
<div className="text-text-muted mb-1 flex justify-between">
<span>CPU</span>
<span className="text-on-surface">42%</span>
</div>
<div className="w-full h-1 bg-surface-variant rounded overflow-hidden">
<div className="h-full bg-primary" style={{ width: "42%" }}></div>
</div>
</div>
<div>
<div className="text-text-muted mb-1 flex justify-between">
<span>RAM</span>
<span className="text-on-surface">64%</span>
</div>
<div className="w-full h-1 bg-surface-variant rounded overflow-hidden">
<div className="h-full bg-primary" style={{ width: "64%" }}></div>
</div>
</div>
</div>
<div className="mt-3 pt-3 border-t border-border-subtle flex justify-between text-mono-data font-mono-data">
<span className="text-text-muted">할당된 카메라: <span className="text-on-surface">14</span></span>
<span className="text-text-muted">IOPS: <span className="text-on-surface">1.2k</span></span>
</div>
</div>
{/* Node 2 */}
<div className="p-3 border border-border-subtle rounded bg-surface-container relative">
<div className="absolute left-0 top-0 bottom-0 w-1 bg-warning rounded-l"></div>
<div className="flex justify-between items-start mb-2">
<div className="flex flex-col">
<span className="text-label-caps font-label-caps text-on-surface">NVR-02-PRIMARY</span>
<span className="text-mono-data font-mono-data text-text-muted mt-1">10.0.4.13</span>
</div>
<div className="flex items-center gap-1 bg-warning/10 px-2 py-0.5 rounded border border-warning/30">
<div className="w-1.5 h-1.5 rounded-full bg-warning led-warning"></div>
<span className="text-mono-data font-mono-data text-warning">높은 부하</span>
</div>
</div>
<div className="grid grid-cols-2 gap-4 mt-4 text-mono-data font-mono-data">
<div>
<div className="text-text-muted mb-1 flex justify-between">
<span>CPU</span>
<span className="text-warning">88%</span>
</div>
<div className="w-full h-1 bg-surface-variant rounded overflow-hidden">
<div className="h-full bg-warning" style={{ width: "88%" }}></div>
</div>
</div>
<div>
<div className="text-text-muted mb-1 flex justify-between">
<span>RAM</span>
<span className="text-on-surface">72%</span>
</div>
<div className="w-full h-1 bg-surface-variant rounded overflow-hidden">
<div className="h-full bg-primary" style={{ width: "72%" }}></div>
</div>
</div>
</div>
<div className="mt-3 pt-3 border-t border-border-subtle flex justify-between text-mono-data font-mono-data">
<span className="text-text-muted">할당된 카메라: <span className="text-on-surface">18</span></span>
<span className="text-text-muted">IOPS: <span className="text-on-surface">2.4k</span></span>
</div>
</div>
{/* Failover Node */}
<div className="p-3 border border-border-subtle rounded bg-surface-container relative border-dashed">
<div className="absolute left-0 top-0 bottom-0 w-1 bg-text-muted rounded-l"></div>
<div className="flex justify-between items-start mb-2">
<div className="flex flex-col">
<span className="text-label-caps font-label-caps text-text-muted">NVR-03-FAILOVER</span>
<span className="text-mono-data font-mono-data text-text-muted mt-1">10.0.4.14</span>
</div>
<div className="flex items-center gap-1 bg-surface-variant px-2 py-0.5 rounded border border-border-subtle">
<div className="w-1.5 h-1.5 rounded-full bg-text-muted"></div>
<span className="text-mono-data font-mono-data text-text-muted">대기</span>
</div>
</div>
<div className="mt-4 pt-2 border-t border-border-subtle text-mono-data font-mono-data text-text-muted text-center italic"> 주 서버 장애 시 제어 권한 인계 준비 완료. </div>
</div>
</div>
</div>
</div>
{/* Right Column: Storage & Network */}
<div className="col-span-12 lg:col-span-8 flex flex-col gap-4 min-h-0">
{/* Storage Array Health */}
<div className="bg-surface rounded-lg border border-border-subtle p-4 flex flex-col shadow-lg shadow-black/50">
<div className="flex justify-between items-center mb-4">
<h3 className="text-title-sm font-title-sm flex items-center gap-2">
<span className="material-symbols-outlined text-primary">storage</span> 스토리지 볼륨 및 드라이브 베이 상태 </h3>
<div className="flex items-center gap-4 text-mono-data font-mono-data">
<div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-tertiary"></div><span className="text-text-muted">정상</span></div>
<div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-warning"></div><span className="text-text-muted">경고</span></div>
<div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-danger"></div><span className="text-text-muted">실패</span></div>
</div>
</div>
<div className="grid grid-cols-2 gap-6">
{/* Volume A */}
<div className="border border-border-subtle rounded p-3 bg-surface-container-low">
<div className="flex justify-between items-center mb-3">
<span className="text-label-caps font-label-caps text-on-surface">VOLUME-A (NVR-01)</span>
<span className="text-mono-data font-mono-data text-tertiary">RAID 5 - OK</span>
</div>
{/* Drive Bays */}
<div className="grid grid-cols-4 gap-2 mb-4">
<div className="bg-surface-variant border border-tertiary/50 rounded h-12 flex items-center justify-center relative overflow-hidden">
<div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary"></div>
<span className="text-mono-data font-mono-data text-text-muted text-[10px]">HDD 0</span>
</div>
<div className="bg-surface-variant border border-tertiary/50 rounded h-12 flex items-center justify-center relative overflow-hidden">
<div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary"></div>
<span className="text-mono-data font-mono-data text-text-muted text-[10px]">HDD 1</span>
</div>
<div className="bg-surface-variant border border-tertiary/50 rounded h-12 flex items-center justify-center relative overflow-hidden">
<div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary"></div>
<span className="text-mono-data font-mono-data text-text-muted text-[10px]">HDD 2</span>
</div>
<div className="bg-surface-variant border border-tertiary/50 rounded h-12 flex items-center justify-center relative overflow-hidden">
<div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary"></div>
<span className="text-mono-data font-mono-data text-text-muted text-[10px]">HDD 3</span>
</div>
</div>
<div className="flex flex-col gap-1 text-mono-data font-mono-data">
<div className="flex justify-between text-text-muted">
<span>용량</span>
<span>12.4 TB / 16.0 TB</span>
</div>
<div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
<div className="h-full bg-primary" style={{ width: "77%" }}></div>
</div>
</div>
</div>
{/* Volume B */}
<div className="border border-danger/30 rounded p-3 bg-surface-container-low relative">
<div className="absolute inset-0 bg-danger/5 rounded pointer-events-none"></div>
<div className="flex justify-between items-center mb-3">
<span className="text-label-caps font-label-caps text-on-surface">VOLUME-B (NVR-02)</span>
<span className="text-mono-data font-mono-data text-danger animate-pulse">RAID 5 - DEGRADED</span>
</div>
{/* Drive Bays */}
<div className="grid grid-cols-4 gap-2 mb-4">
<div className="bg-surface-variant border border-tertiary/50 rounded h-12 flex items-center justify-center relative overflow-hidden">
<div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary"></div>
<span className="text-mono-data font-mono-data text-text-muted text-[10px]">HDD 0</span>
</div>
<div className="bg-surface-variant border border-danger/80 rounded h-12 flex items-center justify-center relative overflow-hidden bg-danger/10">
<div className="absolute bottom-0 left-0 w-full h-1 bg-danger led-danger"></div>
<span className="text-mono-data font-mono-data text-danger text-[10px] font-bold">불량 섹터</span>
</div>
<div className="bg-surface-variant border border-tertiary/50 rounded h-12 flex items-center justify-center relative overflow-hidden">
<div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary"></div>
<span className="text-mono-data font-mono-data text-text-muted text-[10px]">HDD 2</span>
</div>
<div className="bg-surface-variant border border-tertiary/50 rounded h-12 flex items-center justify-center relative overflow-hidden">
<div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary"></div>
<span className="text-mono-data font-mono-data text-text-muted text-[10px]">HDD 3</span>
</div>
</div>
<div className="flex flex-col gap-1 text-mono-data font-mono-data">
<div className="flex justify-between text-text-muted">
<span>용량</span>
<span>14.1 TB / 16.0 TB</span>
</div>
<div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
<div className="h-full bg-warning" style={{ width: "88%" }}></div>
</div>
</div>
</div>
</div>
</div>
{/* Network & Retention Bottom Row */}
<div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
{/* Network Transport */}
<div className="bg-surface rounded-lg border border-border-subtle p-4 flex flex-col shadow-lg shadow-black/50">
<div className="flex justify-between items-center border-b border-border-subtle pb-2 mb-3">
<h3 className="text-title-sm font-title-sm flex items-center gap-2">
<span className="material-symbols-outlined text-primary">router</span> 수신 대역폭 </h3>
<span className="text-display-lg font-display-lg text-primary">845<span className="text-body-base text-text-muted"> Mbps</span></span>
</div>
<div className="flex-1 relative flex flex-col justify-end min-h-[100px] border-b border-l border-border-subtle pl-2 pb-2">
{/* Abstract Chart Representation */}
<div className="absolute bottom-2 left-2 right-0 h-16 flex items-end gap-1 px-1">
<div className="w-full bg-primary/20 h-[40%] rounded-t border-t border-primary relative"></div>
<div className="w-full bg-primary/30 h-[45%] rounded-t border-t border-primary relative"></div>
<div className="w-full bg-primary/20 h-[50%] rounded-t border-t border-primary relative"></div>
<div className="w-full bg-primary/40 h-[60%] rounded-t border-t border-primary relative"></div>
<div className="w-full bg-primary/30 h-[55%] rounded-t border-t border-primary relative"></div>
<div className="w-full bg-primary/50 h-[70%] rounded-t border-t border-primary relative"></div>
<div className="w-full bg-warning/50 h-[90%] rounded-t border-t border-warning relative">
<div className="absolute -top-6 left-1/2 -translate-x-1/2 text-mono-data text-[10px] text-warning bg-surface-dim px-1 rounded border border-border-subtle">최고점</div>
</div>
<div className="w-full bg-primary/40 h-[65%] rounded-t border-t border-primary relative"></div>
<div className="w-full bg-primary/60 h-[80%] rounded-t border-t border-primary relative"></div>
<div className="w-full bg-primary/50 h-[75%] rounded-t border-t border-primary relative"></div>
</div>
</div>
<div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border-subtle">
<div>
<div className="text-osd-label text-text-muted mb-1">패킷 손실률</div>
<div className="text-title-sm font-title-sm text-tertiary">0.02%</div>
</div>
<div>
<div className="text-osd-label text-text-muted mb-1">네트워크 지터</div>
<div className="text-title-sm font-title-sm text-on-surface">12ms</div>
</div>
</div>
</div>
{/* Retention Policy */}
<div className="bg-surface rounded-lg border border-border-subtle p-4 flex flex-col shadow-lg shadow-black/50">
<div className="flex justify-between items-center border-b border-border-subtle pb-2 mb-3">
<h3 className="text-title-sm font-title-sm flex items-center gap-2">
<span className="material-symbols-outlined text-primary">history</span> 보존 정책 상태 </h3>
</div>
<div className="flex-1 flex flex-col justify-center gap-4">
{/* Policy Item 1 */}
<div className="flex items-center gap-4">
<div className="w-16 h-16 rounded-full border-4 border-surface-variant flex items-center justify-center relative">
<svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
<path className="text-tertiary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="100, 100" strokeWidth="4"></path>
</svg>
<span className="text-title-sm font-bold text-on-surface z-10">30일</span>
</div>
<div className="flex-1">
<div className="flex justify-between text-mono-data font-mono-data mb-1">
<span className="text-on-surface">고해상도 스트림 (1080p+)</span>
<span className="text-tertiary">충족</span>
</div>
<p className="text-body-sm font-body-sm text-text-muted">목표: 30일. 현재 32일 분량의 영상 보존 중.</p>
</div>
</div>
{/* Policy Item 2 */}
<div className="flex items-center gap-4">
<div className="w-16 h-16 rounded-full border-4 border-surface-variant flex items-center justify-center relative">
<svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
<path className="text-warning" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="85, 100" strokeWidth="4"></path>
</svg>
<span className="text-title-sm font-bold text-on-surface z-10">90일</span>
</div>
<div className="flex-1">
<div className="flex justify-between text-mono-data font-mono-data mb-1">
<span className="text-on-surface">저해상도 스트림 (보조)</span>
<span className="text-warning">위험</span>
</div>
<p className="text-body-sm font-body-sm text-text-muted">목표: 90일. 현재 볼륨 B 성능 저하로 인해 85일 분량 보존 중.</p>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</main> </> );
};

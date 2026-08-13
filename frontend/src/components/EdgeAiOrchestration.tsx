import React from 'react'; export const EdgeAiOrchestration: React.FC = () => { return ( <>
<main className="flex-1 p-container-padding overflow-y-auto h-full flex flex-col gap-4">
{/* Header Section */}
<div className="flex justify-between items-end mb-2">
<div>
<h1 className="text-headline-md font-headline-md text-on-surface whitespace-nowrap">에지 AI 컨테이너 오케스트레이션 및 NIM 분산 전개 모니터링 콘솔</h1>
<p className="text-body-base font-body-base text-text-muted mt-1">NIM 컨테이너 플릿 관리 및 프로파일링</p>
</div>
<div className="flex gap-2">
<button className="px-4 py-2 border border-border-subtle rounded text-body-sm font-body-sm hover:bg-surface-container-high transition-colors text-on-surface">플릿 동기화</button>
<button className="px-4 py-2 bg-primary-container text-on-primary-container rounded text-body-sm font-body-sm font-semibold hover:bg-inverse-primary transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">rocket_launch</span> NIM 배포 </button>
</div>
</div>
{/* Bento Grid Layout */}
<div className="grid grid-cols-12 gap-4 flex-1">
{/* Left Column: Edge Device List (Spans 4) */}
<div className="col-span-12 xl:col-span-4 bg-surface rounded-lg border border-border-subtle flex flex-col overflow-hidden">
<div className="p-3 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
<h3 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">router</span> 에지 노드 </h3>
<span className="text-mono-data font-mono-data text-text-muted">4 ACTIVE</span>
</div>
<div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
{/* Node Item 1 (Selected) */}
<div className="p-3 rounded border border-primary bg-surface-container-highest cursor-pointer">
<div className="flex justify-between items-start mb-2">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-tertiary industrial-glow"></div>
<span className="text-body-sm font-body-sm font-bold text-on-surface">EDGE-NODE-A1</span>
</div>
<span className="text-mono-data font-mono-data text-tertiary">98% UPTIME</span>
</div>
<div className="flex gap-4 text-mono-data font-mono-data text-text-muted mt-2">
<div className="flex flex-col"><span className="">GPU</span><span className="text-on-surface">Orin NX</span></div>
<div className="flex flex-col"><span className="">LOAD</span><span className="text-warning">84%</span></div>
<div className="flex flex-col"><span className="">TEMP</span><span className="text-on-surface">62°C</span></div>
</div>
</div>
{/* Node Item 2 */}
<div className="p-3 rounded border border-border-subtle bg-surface hover:border-outline-variant transition-colors cursor-pointer">
<div className="flex justify-between items-start mb-2">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-tertiary"></div>
<span className="text-body-sm font-body-sm font-bold text-on-surface">EDGE-NODE-B2</span>
</div>
<span className="text-mono-data font-mono-data text-tertiary">99% UPTIME</span>
</div>
<div className="flex gap-4 text-mono-data font-mono-data text-text-muted mt-2">
<div className="flex flex-col"><span className="">GPU</span><span className="text-on-surface">AGX Orin</span></div>
<div className="flex flex-col"><span className="">LOAD</span><span className="text-on-surface">45%</span></div>
<div className="flex flex-col"><span className="">TEMP</span><span className="text-on-surface">51°C</span></div>
</div>
</div>
{/* Node Item 3 */}
<div className="p-3 rounded border border-border-subtle bg-surface hover:border-outline-variant transition-colors cursor-pointer">
<div className="flex justify-between items-start mb-2">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-warning"></div>
<span className="text-body-sm font-body-sm font-bold text-on-surface">EDGE-NODE-C3</span>
</div>
<span className="text-mono-data font-mono-data text-warning">SYNCING</span>
</div>
<div className="flex gap-4 text-mono-data font-mono-data text-text-muted mt-2">
<div className="flex flex-col"><span className="">GPU</span><span className="text-on-surface">Orin NX</span></div>
<div className="flex flex-col"><span className="">LOAD</span><span className="text-on-surface">12%</span></div>
<div className="flex flex-col"><span className="">TEMP</span><span className="text-on-surface">45°C</span></div>
</div>
</div>
</div>
</div>
{/* Right Column: Profiling & Orchestration (Spans 8) */}
<div className="col-span-12 xl:col-span-8 flex flex-col gap-4">
{/* Hardware Profiler (Top Half) */}
<div className="bg-surface rounded-lg border border-border-subtle flex flex-col flex-1">
<div className="p-3 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
<h3 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">memory</span> EDGE-NODE-A1 프로파일러 </h3>
<div className="flex gap-2">
<span className="px-2 py-1 bg-surface-container-high rounded text-mono-data text-text-muted">ID: 0x9A4B</span>
</div>
</div>
<div className="p-4 grid grid-cols-3 gap-4">
{/* GPU Stats */}
<div className="col-span-1 border border-border-subtle rounded p-3 bg-surface-container">
<div className="text-label-caps font-label-caps text-text-muted mb-2">GPU 점유율</div>
<div className="flex items-end gap-2 mb-2">
<span className="text-display-lg font-display-lg text-warning">84%</span>
</div>
{/* Mock Chart */}
<div className="h-12 w-full flex items-end gap-1 opacity-70">
<div className="w-1/6 bg-primary h-3/6"></div>
<div className="w-1/6 bg-primary h-4/6"></div>
<div className="w-1/6 bg-primary h-2/6"></div>
<div className="w-1/6 bg-warning h-5/6"></div>
<div className="w-1/6 bg-warning h-4/6"></div>
<div className="w-1/6 bg-warning h-[84%]"></div>
</div>
</div>
{/* Memory Stats */}
<div className="col-span-1 border border-border-subtle rounded p-3 bg-surface-container">
<div className="text-label-caps font-label-caps text-text-muted mb-2">공유 메모리</div>
<div className="flex items-end gap-2 mb-2">
<span className="text-display-lg font-display-lg text-on-surface">12.4</span>
<span className="text-body-sm text-text-muted mb-1">/ 16 GB</span>
</div>
<div className="w-full bg-surface-container-lowest h-2 rounded mt-4 overflow-hidden">
<div className="bg-primary h-full w-[77%]"></div>
</div>
</div>
{/* Power/Temp Stats */}
<div className="col-span-1 border border-border-subtle rounded p-3 bg-surface-container flex flex-col justify-between">
<div>
<div className="flex justify-between items-center mb-1">
<span className="text-label-caps font-label-caps text-text-muted">소비 전력</span>
<span className="text-mono-data text-on-surface">18.5 W</span>
</div>
<div className="flex justify-between items-center mb-1">
<span className="text-label-caps font-label-caps text-text-muted">온도</span>
<span className="text-mono-data text-on-surface">62°C</span>
</div>
<div className="flex justify-between items-center">
<span className="text-label-caps font-label-caps text-text-muted">NPU 주파수</span>
<span className="text-mono-data text-on-surface">1.2 GHz</span>
</div>
</div>
</div>
</div>
</div>
{/* Container Orchestration (Bottom Half) */}
<div className="bg-surface rounded-lg border border-border-subtle flex flex-col flex-1">
<div className="p-3 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
<h3 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">view_in_ar</span> 구동 중인 NIM (가상 컨테이너) </h3>
<button className="text-primary hover:text-primary-fixed transition-colors text-mono-data flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">add_box</span> Hot Deploy </button>
</div>
<div className="p-0 overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="border-b border-border-subtle text-label-caps font-label-caps text-text-muted bg-surface-container-low">
<th className="p-3 font-normal">NIM 서비스</th>
<th className="p-3 font-normal">버전</th>
<th className="p-3 font-normal">상태</th>
<th className="p-3 font-normal">GPU 할당</th>
<th className="p-3 font-normal text-right">작업</th>
</tr>
</thead>
<tbody className="text-mono-data font-mono-data">
<tr className="border-b border-border-subtle hover:bg-surface-container-highest transition-colors">
<td className="p-3 flex items-center gap-2">
<span className="material-symbols-outlined text-tertiary text-[16px]">visibility</span>
<span className="text-on-surface">DeepStream-Vision</span>
</td>
<td className="p-3 text-text-muted">v6.3-devel</td>
<td className="p-3">
<span className="inline-flex items-center gap-1 text-tertiary bg-tertiary-fixed-dim bg-opacity-10 px-2 py-0.5 rounded">
<div className="w-1.5 h-1.5 rounded-full bg-tertiary"></div> 구동 중 </span>
</td>
<td className="p-3 text-on-surface">45%</td>
<td className="p-3 text-right">
<button className="text-text-muted hover:text-on-surface"><span className="material-symbols-outlined text-[18px]">restart_alt</span></button>
<button className="text-text-muted hover:text-danger ml-2"><span className="material-symbols-outlined text-[18px]">stop_circle</span></button>
</td>
</tr>
<tr className="border-b border-border-subtle hover:bg-surface-container-highest transition-colors">
<td className="p-3 flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[16px]">psychology</span>
<span className="text-on-surface">VLM-Reasoning-Edge</span>
</td>
<td className="p-3 text-text-muted">v1.2-nim</td>
<td className="p-3">
<span className="inline-flex items-center gap-1 text-tertiary bg-tertiary-fixed-dim bg-opacity-10 px-2 py-0.5 rounded">
<div className="w-1.5 h-1.5 rounded-full bg-tertiary"></div> 구동 중 </span>
</td>
<td className="p-3 text-on-surface">30%</td>
<td className="p-3 text-right">
<button className="text-text-muted hover:text-on-surface"><span className="material-symbols-outlined text-[18px]">restart_alt</span></button>
<button className="text-text-muted hover:text-danger ml-2"><span className="material-symbols-outlined text-[18px]">stop_circle</span></button>
</td>
</tr>
<tr className="hover:bg-surface-container-highest transition-colors">
<td className="p-3 flex items-center gap-2">
<span className="material-symbols-outlined text-text-muted text-[16px]">data_usage</span>
<span className="text-on-surface">Kafka-Telemetry</span>
</td>
<td className="p-3 text-text-muted">v3.4-slim</td>
<td className="p-3">
<span className="inline-flex items-center gap-1 text-warning bg-warning bg-opacity-10 px-2 py-0.5 rounded">
<div className="w-1.5 h-1.5 rounded-full bg-warning"></div> 재시작 중 </span>
</td>
<td className="p-3 text-on-surface">5%</td>
<td className="p-3 text-right">
<button className="text-text-muted hover:text-on-surface"><span className="material-symbols-outlined text-[18px]">restart_alt</span></button>
<button className="text-text-muted hover:text-danger ml-2"><span className="material-symbols-outlined text-[18px]">stop_circle</span></button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
</main> </> );
};

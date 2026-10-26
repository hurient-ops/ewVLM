import React, { useState } from 'react'; 
import { usePtzStore } from '../store/usePtzStore';
import { API } from '../api/client';

export const PtzPatrolSchedule: React.FC = () => { 
  const { isPatrolling, togglePatrol, presets, activeCameraId } = usePtzStore();
  const [activePresetIndex, setActivePresetIndex] = useState(0);

  const handlePatrolToggle = async () => {
    const action = isPatrolling ? 'PATROL_STOP' : 'PATROL_START';
    const camera = activeCameraId || 'CAM_01_PTZ';
    
    try {
      await API.controlPtz(camera, action);
      togglePatrol(); // Only toggle local state if API succeeds
    } catch (err) {
      console.error(`Failed to send ${action}`, err);
      alert('순찰 명령 전송에 실패했습니다.');
    }
  };

  const handleSave = () => {
    alert('순찰 시나리오 체인이 저장되었습니다.');
  };

return ( <>
<main className="p-container-padding flex-1 overflow-hidden flex flex-col gap-4 bg-background">
{/* Header */}
<header className="flex justify-between items-end pb-2 border-b border-border-subtle">
<div>
<h1 className="text-headline-md font-headline-md text-primary">지능형 자율 PTZ 순찰 투어 및 스케줄 기획 콘솔</h1>
<p className="text-body-sm font-body-sm text-text-muted mt-1">Configure autonomous preset chains and schedule 24/7 patrol routines.</p>
</div>
<div className="flex gap-2">
<button className="px-4 py-1.5 border border-border-subtle rounded-DEFAULT text-title-sm font-title-sm text-on-surface hover:bg-surface-container transition-colors">취소</button>
<button 
  className={`px-4 py-1.5 rounded-DEFAULT text-title-sm font-title-sm transition-colors flex items-center gap-2 ${isPatrolling ? 'bg-danger text-white hover:bg-danger/80' : 'bg-primary-container text-white hover:bg-inverse-primary'}`}
  onClick={handlePatrolToggle}
>
  <span className="material-symbols-outlined text-sm">{isPatrolling ? 'stop' : 'play_arrow'}</span>
  {isPatrolling ? '순찰 중지' : '순찰 시작'}
</button>
<button className="px-4 py-1.5 bg-surface-container-highest text-on-surface rounded-DEFAULT text-title-sm font-title-sm hover:bg-surface-variant transition-colors flex items-center gap-2" onClick={handleSave}>
<span className="material-symbols-outlined text-sm">save</span> 설정 저장 </button>
</div>
</header>
{/* Builder Workspace */}
<div className="flex-1 flex gap-4 min-h-0">
{/* Left Column: Preset Chain Builder */}
<div className="w-1/3 flex flex-col gap-4 min-h-0">
<div className="glass-panel rounded-lg flex-1 flex flex-col p-4">
<div className="flex justify-between items-center mb-4">
<h3 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary">linear_scale</span> 시나리오 체인 </h3>
<span className="bg-surface-container-highest text-mono-data font-mono-data px-2 py-0.5 rounded-DEFAULT text-text-muted border border-border-subtle">Total: 4m 30s</span>
</div>
<div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
{/* Chain Node 1 */}
<div className="tour-node bg-surface border-2 border-border-subtle rounded-DEFAULT p-3 flex flex-col gap-2 relative">
<div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-surface bg-primary-container z-10"></div>
<div className="flex justify-between items-start">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-text-muted text-sm cursor-move">drag_indicator</span>
<span className="text-label-caps font-label-caps text-on-surface">P01: Main Gate</span>
</div>
<div className="flex gap-1">
<span className="material-symbols-outlined text-text-muted text-sm hover:text-primary cursor-pointer">edit</span>
<span className="material-symbols-outlined text-text-muted text-sm hover:text-danger cursor-pointer">delete</span>
</div>
</div>
<div className="grid grid-cols-2 gap-2 text-mono-data font-mono-data text-text-muted mt-1">
<div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">timer</span> 머무름 시간: 30s</div>
<div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">speed</span> 속도: Fast</div>
<div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">zoom_in</span> 줌: 4x</div>
<div className="flex items-center gap-1 text-primary"><span className="material-symbols-outlined text-[14px]">psychology</span> AI: Person Det.</div>
</div>
</div>
{/* Chain Node 2 */}
<div className="tour-node bg-surface border-2 border-border-subtle rounded-DEFAULT p-3 flex flex-col gap-2 relative">
<div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-surface bg-surface-container-highest z-10"></div>
<div className="flex justify-between items-start">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-text-muted text-sm cursor-move">drag_indicator</span>
<span className="text-label-caps font-label-caps text-on-surface">P05: Perimeter East</span>
</div>
<div className="flex gap-1">
<span className="material-symbols-outlined text-text-muted text-sm hover:text-primary cursor-pointer">edit</span>
<span className="material-symbols-outlined text-text-muted text-sm hover:text-danger cursor-pointer">delete</span>
</div>
</div>
<div className="grid grid-cols-2 gap-2 text-mono-data font-mono-data text-text-muted mt-1">
<div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">timer</span> 머무름 시간: 60s</div>
<div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">speed</span> 속도: Slow</div>
<div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">zoom_in</span> 줌: 1x</div>
<div className="flex items-center gap-1 text-primary"><span className="material-symbols-outlined text-[14px]">psychology</span> AI: Veh. Det.</div>
</div>
</div>
{/* Add Node Button */}
<button className="w-full border border-dashed border-border-subtle rounded-DEFAULT py-3 flex items-center justify-center gap-2 text-text-muted hover:text-on-surface hover:border-primary-container transition-colors text-label-caps font-label-caps mt-2">
<span className="material-symbols-outlined text-sm">add_circle</span> 프리셋 노드 추가 </button>
</div>
</div>
{/* PTZ Preview Mini */}
<div className="glass-panel rounded-lg h-56 p-2 flex flex-col relative overflow-hidden bg-black border border-primary/40">
<span className="absolute top-3 left-3 z-20 text-osd-label font-osd-label text-white bg-black/70 backdrop-blur px-2 py-0.5 rounded border border-border-subtle flex items-center gap-1.5">
  <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
  {(activeCameraId || 'CAM-01').toUpperCase()} PTZ LIVE
</span>
<div className="absolute inset-0 bg-surface-container-lowest z-0 flex items-center justify-center">
<img 
  alt="Camera Feed Preview" 
  className="w-full h-full object-cover" 
  src={`http://localhost:8001/stream/${activeCameraId || 'cam-01'}`}
  onError={(e) => {
    const target = e.target as HTMLImageElement;
    target.src = `http://localhost:8001/snapshot/${activeCameraId || 'cam-01'}`;
  }}
/>
</div>
{/* Jog Shuttle Overlay */}
<div className="absolute bottom-3 right-3 w-14 h-14 rounded-full bg-black/70 border border-primary/50 flex items-center justify-center backdrop-blur-md z-10 shadow-lg cursor-pointer hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-primary text-xl">control_camera</span>
</div>
</div>
</div>
{/* Right Column: Scheduler Binder */}
<div className="w-2/3 glass-panel rounded-lg p-4 flex flex-col min-h-0">
<div className="flex justify-between items-center mb-4 border-b border-border-subtle pb-3">
<h3 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary">calendar_month</span> 주간 배포 스케줄러 </h3>
<div className="flex gap-2">
<button className="px-2 py-1 bg-surface-container-highest border border-border-subtle rounded text-mono-data font-mono-data hover:bg-surface-container-high">Night Ops</button>
<button className="px-2 py-1 bg-primary-container border border-primary-container rounded text-mono-data font-mono-data text-white shadow-[0_0_8px_rgba(124,58,237,0.4)]">Standard Patrol</button>
</div>
</div>
{/* 24/7 Grid Placeholder */}
<div className="flex-1 flex flex-col border border-border-subtle rounded-DEFAULT overflow-hidden bg-surface-container-lowest">
{/* Days Header */}
<div className="grid grid-cols-8 border-b border-border-subtle bg-surface-container-highest text-label-caps font-label-caps text-text-muted">
<div className="p-2 border-r border-border-subtle text-center">Time</div>
<div className="p-2 border-r border-border-subtle text-center">월</div>
<div className="p-2 border-r border-border-subtle text-center">화</div>
<div className="p-2 border-r border-border-subtle text-center">수</div>
<div className="p-2 border-r border-border-subtle text-center bg-surface-variant text-on-surface">목 (오늘)</div>
<div className="p-2 border-r border-border-subtle text-center">금</div>
<div className="p-2 border-r border-border-subtle text-center text-warning">토</div>
<div className="p-2 text-center text-warning">일</div>
</div>
{/* Timeline Body */}
<div className="flex-1 overflow-y-auto relative bg-surface-container-lowest scrollbar-hide">
{/* Horizontal Grid Lines & Labels */}
<div className="absolute inset-0 pointer-events-none">
{/* 00:00 to 23:00 blocks (simplified for visual) */}
<div className="grid grid-cols-8 h-12 border-b border-border-subtle/50">
<div className="border-r border-border-subtle/50 text-mono-data font-mono-data text-text-muted flex items-center justify-center text-[10px]">00:00</div>
<div className="border-r border-border-subtle/50"></div><div className="border-r border-border-subtle/50"></div><div className="border-r border-border-subtle/50"></div><div className="border-r border-border-subtle/50 bg-surface-container/30"></div><div className="border-r border-border-subtle/50"></div><div className="border-r border-border-subtle/50 bg-surface-container/20"></div><div className="bg-surface-container/20"></div>
</div>
<div className="grid grid-cols-8 h-12 border-b border-border-subtle/50">
<div className="border-r border-border-subtle/50 text-mono-data font-mono-data text-text-muted flex items-center justify-center text-[10px]">04:00</div>
<div className="border-r border-border-subtle/50"></div><div className="border-r border-border-subtle/50"></div><div className="border-r border-border-subtle/50"></div><div className="border-r border-border-subtle/50 bg-surface-container/30"></div><div className="border-r border-border-subtle/50"></div><div className="border-r border-border-subtle/50 bg-surface-container/20"></div><div className="bg-surface-container/20"></div>
</div>
<div className="grid grid-cols-8 h-12 border-b border-border-subtle/50">
<div className="border-r border-border-subtle/50 text-mono-data font-mono-data text-text-muted flex items-center justify-center text-[10px]">08:00</div>
<div className="border-r border-border-subtle/50"></div><div className="border-r border-border-subtle/50"></div><div className="border-r border-border-subtle/50"></div><div className="border-r border-border-subtle/50 bg-surface-container/30"></div><div className="border-r border-border-subtle/50"></div><div className="border-r border-border-subtle/50 bg-surface-container/20"></div><div className="bg-surface-container/20"></div>
</div>
<div className="grid grid-cols-8 h-12 border-b border-border-subtle/50">
<div className="border-r border-border-subtle/50 text-mono-data font-mono-data text-text-muted flex items-center justify-center text-[10px]">12:00</div>
<div className="border-r border-border-subtle/50"></div><div className="border-r border-border-subtle/50"></div><div className="border-r border-border-subtle/50"></div><div className="border-r border-border-subtle/50 bg-surface-container/30"></div><div className="border-r border-border-subtle/50"></div><div className="border-r border-border-subtle/50 bg-surface-container/20"></div><div className="bg-surface-container/20"></div>
</div>
</div>
{/* Schedule Blocks (Interactive Overlay) */}
<div className="absolute inset-0 grid grid-cols-8 pt-0">
<div className="col-start-2 col-span-1 relative">
<div className="absolute top-2 left-1 right-1 h-20 bg-primary-container/20 border border-primary-container rounded flex flex-col p-1 cursor-pointer hover:bg-primary-container/30 transition-colors">
<span className="text-[10px] font-label-caps text-primary leading-tight">Night Ops Chain</span>
<span className="text-[9px] font-mono-data text-on-surface-variant mt-auto">00:00 - 06:00</span>
</div>
</div>
<div className="col-start-5 col-span-1 relative"> {/* Thursday */}
<div className="absolute top-6 left-1 right-1 h-[70px] bg-secondary-container/20 border border-secondary-container rounded flex flex-col p-1 cursor-pointer hover:bg-secondary-container/30 transition-colors">
<span className="text-[10px] font-label-caps text-secondary leading-tight">Standard Patrol</span>
<span className="text-[9px] font-mono-data text-on-surface-variant mt-auto">02:00 - 08:00</span>
</div>
{/* Current Time Indicator Line */}
<div className="absolute top-[85px] left-0 right-0 h-px bg-danger shadow-[0_0_4px_rgba(239,68,68,0.8)] z-20 flex items-center">
<div className="w-1.5 h-1.5 rounded-full bg-danger -ml-0.5"></div>
</div>
</div>
</div>
</div>
</div>
{/* Quick Action Bar */}
<div className="mt-4 flex justify-between items-center bg-surface-container px-3 py-2 border border-border-subtle rounded-DEFAULT">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-warning text-sm">warning</span>
<span className="text-body-sm font-body-sm text-text-muted">Overlapping schedules detected on Friday.</span>
</div>
<button className="text-label-caps font-label-caps text-primary hover:text-primary-fixed transition-colors">충돌 해결</button>
</div>
</div>
</div>
</main> </> );
};

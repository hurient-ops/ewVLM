import React, { useState } from 'react';
import { API } from '../api/client';

export const LoraFinetuningConsole: React.FC = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleTrainingToggle = async () => {
    if (isTraining) {
      setIsTraining(false);
      setToastMessage('🛑 훈련이 중단되었습니다.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsTraining(true);
    setToastMessage('⏳ 모델 훈련을 시작합니다...');
    try {
      const res = await API.startLoraTraining('lora-target-vlm');
      if (res.status === 'SUCCESS') {
        setToastMessage(`✅ 훈련 스케줄 등록 성공 (Job ID: ${res.job_id})`);
      }
    } catch (err) {
      console.error(err);
      setToastMessage('❌ 훈련 시작 중 오류 발생');
      setIsTraining(false);
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return ( <>
<main className="h-full flex flex-col p-container-padding bg-[#070A13] relative">
{toastMessage && (
  <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-primary-container border border-primary text-white px-6 py-3 rounded-lg shadow-2xl font-body-base text-body-base animate-pulse">
    {toastMessage}
  </div>
)}
{/* Header */}
<header className="flex justify-between items-end pb-4 border-b border-border-subtle mb-4">
<div>
<h1 className="text-headline-md font-headline-md text-on-surface">LoRA 어댑터 엣지 파인튜닝 (VLM-Vision)</h1>
<p className="text-body-base font-body-base text-text-muted mt-1">현장 카메라 데이터를 바탕으로 특정 도메인(야간 해상 감시) 특화 가중치 학습</p>
</div>
<div className="flex gap-2 items-center">
<button 
  className={`px-4 py-2 rounded text-body-sm font-body-sm flex items-center gap-2 font-semibold transition-colors ${isTraining ? 'bg-danger text-white hover:bg-danger/80' : 'bg-primary-container text-white hover:bg-inverse-primary'}`}
  onClick={handleTrainingToggle}
>
<span className="material-symbols-outlined text-[18px]">{isTraining ? 'stop' : 'play_arrow'}</span> {isTraining ? '훈련 강제 중단' : '훈련 강제 시작'} </button>
</div>
</header>
{/* Bento Grid Layout */}
<div className="flex-1 grid grid-cols-12 grid-rows-3 gap-4 min-h-0">
{/* Left Column: Data Set Builder & Review */}
<div className="col-span-4 row-span-3 glass-panel rounded-lg flex flex-col overflow-hidden">
<div className="p-3 border-b border-border-subtle bg-surface flex justify-between items-center">
<h3 className="text-title-sm font-title-sm text-text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">fact_check</span> 데이터셋 빌더 </h3>
<span className="text-mono-data font-mono-data text-text-muted bg-surface-container-lowest px-2 py-0.5 rounded">Queue: 432</span>
</div>
<div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
{/* Data Item 1 */}
<div className="bg-surface-container-low border border-border-subtle rounded p-2 hover:border-primary transition-colors cursor-pointer group">
<div className="flex gap-2">
<div className="w-24 h-16 bg-surface-container-highest rounded border border-border-subtle overflow-hidden relative shrink-0">
<img className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" data-alt="Security camera footage frame, industrial setting, slight motion blur, dark mode, high contrast false positive detection box in red." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB440yA4387d48jYZ9Gq7MGskJZuflL0YiqDBXHjvFKNCh92xcKBl7CRnjn4-HpPwmm5fHYRF-6EpBhNJxDRkDEQmLylK0w59cSyVZdIBMGYHhQ4hXn5sECagpBMCHLY22Tx-CmDiciK4gsB_Qh1KrX4835hWtAf2uHL_U0FcQ9C7X_FfcF4R2y2JJmDCOYu9mN4ST3VOaXb9yb5TVbTy5fzcQx9rLhj4NlfUU48uSaJM8gpn0lIG9Cdg"/>
<div className="absolute inset-0 border-[1.5px] border-danger m-1"></div>
</div>
<div className="flex-1 flex flex-col justify-between">
<div>
<div className="flex justify-between items-start">
<span className="text-label-caps font-label-caps text-danger">False Positive</span>
<span className="text-mono-data font-mono-data text-text-muted text-[10px]">10:42:01</span>
</div>
<p className="text-body-sm font-body-sm text-on-surface-variant truncate w-32 mt-1">VLM detected 'Weapon'</p>
</div>
<div className="flex gap-1 mt-1">
<button className="flex-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold py-1 rounded hover:bg-opacity-80">승인</button>
<button className="flex-1 bg-surface-variant text-text-muted text-[10px] font-bold py-1 rounded hover:bg-surface-bright">소거</button>
</div>
</div>
</div>
</div>
{/* Data Item 2 */}
<div className="bg-surface-container-low border border-border-subtle rounded p-2 hover:border-primary transition-colors cursor-pointer group opacity-60">
<div className="flex gap-2">
<div className="w-24 h-16 bg-surface-container-highest rounded border border-border-subtle overflow-hidden relative shrink-0">
<img className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" data-alt="Night vision security feed, false positive detection of a shadow as a person, grainy texture, industrial perimeter." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBxBcRq1a_ssfgMzrJqMwKShzKBFI6gSD5PiJ68XPLQbsXjKpI41epH1QalWRHb0NQtmaDodB9UPe_AXKliLwf3a1crwg3zWG8hcSc6naWOQVfM4FhMwCrJ2-WfIQbguJMsgn1l8IKAo1rJm4Vvzx_H0wNS49XIgLBXegZiiqR0s7nld9OzBPRwz99lCJpwB1bhLpSuoJf2WBlsNSLrcs0nkDyv9nWNAj_YcFGSAc6eFQULDO08E8-Wg"/>
<div className="absolute inset-0 border-[1.5px] border-danger m-1"></div>
</div>
<div className="flex-1 flex flex-col justify-between">
<div>
<div className="flex justify-between items-start">
<span className="text-label-caps font-label-caps text-danger">False Positive</span>
<span className="text-mono-data font-mono-data text-text-muted text-[10px]">03:15:22</span>
</div>
<p className="text-body-sm font-body-sm text-on-surface-variant truncate w-32 mt-1">Shadow tagged 'Intruder'</p>
</div>
<div className="flex gap-1 mt-1">
<span className="text-mono-data font-mono-data text-tertiary flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">check_circle</span> Added to LoRA set </span>
</div>
</div>
</div>
</div>
</div>
</div>
{/* Top Right: Training Status & Loss Graph */}
<div className="col-span-8 row-span-2 glass-panel rounded-lg flex flex-col overflow-hidden">
<div className="p-3 border-b border-border-subtle bg-surface flex justify-between items-center">
<div className="flex items-center gap-3">
<h3 className="text-title-sm font-title-sm text-text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-neon-gold text-[18px]">model_training</span> 활성 훈련 사이클 (LoRA v4.2) </h3>
{isTraining && (
<span className="flex items-center gap-1 text-mono-data font-mono-data text-neon-gold bg-surface-container px-2 py-1 rounded-full border border-border-subtle">
<span className="status-dot training"></span> Training in progress </span>
)}
</div>
<div className="text-right">
<span className="text-mono-data font-mono-data text-text-muted block">Epoch: {isTraining ? '14/50' : '0/50'}</span>
<span className="text-mono-data font-mono-data text-text-muted block">Loss: {isTraining ? '0.2314' : 'N/A'} {isTraining && <span className="text-tertiary">↓</span>}</span>
</div>
</div>
<div className="flex-1 p-4 relative bg-surface-container-lowest">
{/* Simulated Graph Area */}
<div className="absolute inset-4 border-l border-b border-border-subtle">
{/* Y-axis labels */}
<div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-[10px] text-text-muted font-mono-data py-1">
<span>1.0</span>
<span>0.5</span>
<span>0.0</span>
</div>
{/* X-axis labels */}
<div className="absolute -bottom-6 left-0 w-full flex justify-between text-[10px] text-text-muted font-mono-data px-1">
<span>Ep 0</span>
<span>Ep 10</span>
<span>Ep 20</span>
<span>Ep 30</span>
<span>Ep 40</span>
<span>Ep 50</span>
</div>
{/* Decorative Graph Line (CSS based for simplicity, normally would use SVG/Canvas) */}
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
{/* Grid lines */}
<line stroke="#232C3F" stroke-dasharray="2" strokeWidth="0.5" x1="0" x2="100" y1="25" y2="25"></line>
<line stroke="#232C3F" stroke-dasharray="2" strokeWidth="0.5" x1="0" x2="100" y1="50" y2="50"></line>
<line stroke="#232C3F" stroke-dasharray="2" strokeWidth="0.5" x1="0" x2="100" y1="75" y2="75"></line>
{/* Loss Line */}
<path className="opacity-80" d="M0,20 Q10,25 20,40 T40,65 T60,75 L80,78 L100,78" fill="none" stroke="#7c3aed" strokeWidth="2"></path>
{/* Validation Loss */}
<path className="opacity-60" d="M0,25 Q10,35 20,50 T40,70 T60,80 L80,82 L100,82" fill="none" stroke="#F59E0B" stroke-dasharray="4" strokeWidth="1.5"></path>
</svg>
{/* Current Epoch Marker */}
<div className="absolute top-0 bottom-0 border-l border-primary opacity-50" style={{ left: "28%" }}></div>
<div className="absolute w-2 h-2 rounded-full bg-primary" style={{ left: "calc(28% - 4px)", top: "62%" }}></div>
</div>
</div>
</div>
{/* Bottom Right: Version Control Panel */}
<div className="col-span-8 row-span-1 glass-panel rounded-lg flex flex-col overflow-hidden">
<div className="p-3 border-b border-border-subtle bg-surface flex justify-between items-center">
<h3 className="text-title-sm font-title-sm text-text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">history</span> LoRA 버전 관리 </h3>
<div className="text-mono-data font-mono-data text-text-muted"> Active Base: <span className="text-on-surface">ewVLM-Base-v2</span>
</div>
</div>
<div className="flex-1 p-2 overflow-x-auto flex items-center gap-2">
{/* Version Card 1 (Active) */}
<div className="w-64 shrink-0 h-full bg-surface-container border border-primary rounded p-3 flex flex-col justify-between relative overflow-hidden">
<div className="absolute top-0 right-0 w-16 h-16 bg-primary opacity-10 rounded-bl-full"></div>
<div className="flex justify-between items-start">
<span className="text-label-caps font-label-caps text-primary">v4.1 (Deployed)</span>
<span className="status-dot active mt-1"></span>
</div>
<div className="mt-2 text-mono-data font-mono-data text-text-muted space-y-1">
<p>FP Reduction: 18.4%</p>
<p>Trained: 2d ago</p>
</div>
<div className="mt-3 flex gap-2">
<button className="flex-1 bg-surface-variant text-text-muted text-[10px] font-bold py-1.5 rounded opacity-50 cursor-not-allowed">롤백</button>
<button className="flex-1 border border-border-subtle text-on-surface text-[10px] font-bold py-1.5 rounded hover:bg-surface-container-high">상세 정보</button>
</div>
</div>
{/* Version Card 2 */}
<div className="w-64 shrink-0 h-full bg-surface-container-low border border-border-subtle rounded p-3 flex flex-col justify-between hover:border-outline-variant transition-colors">
<div className="flex justify-between items-start">
<span className="text-label-caps font-label-caps text-on-surface-variant">v4.0 (Stable)</span>
</div>
<div className="mt-2 text-mono-data font-mono-data text-text-muted space-y-1">
<p>FP Reduction: 12.1%</p>
<p>Trained: 1w ago</p>
</div>
<div className="mt-3 flex gap-2">
<button className="flex-1 bg-surface-variant text-on-surface text-[10px] font-bold py-1.5 rounded hover:bg-warning hover:text-black transition-colors">롤백</button>
</div>
</div>
{/* Version Card 3 */}
<div className="w-64 shrink-0 h-full bg-surface-container-low border border-border-subtle rounded p-3 flex flex-col justify-between hover:border-outline-variant transition-colors opacity-70">
<div className="flex justify-between items-start">
<span className="text-label-caps font-label-caps text-on-surface-variant">v3.8 (Archived)</span>
</div>
<div className="mt-2 text-mono-data font-mono-data text-text-muted space-y-1">
<p>FP Reduction: 9.5%</p>
<p>Trained: 3w ago</p>
</div>
<div className="mt-3 flex gap-2">
<button className="flex-1 bg-surface-container text-text-muted text-[10px] font-bold py-1.5 rounded border border-border-subtle hover:bg-surface-variant">VIEW LOGS</button>
</div>
</div>
</div>
</div>
</div>
</main> </> );
};

import React from 'react'; export const RealtimeBiDashboard: React.FC = () => { return ( <>
<main className="p-container-padding h-[calc(100vh-56px)] overflow-y-auto">
<div className="grid grid-cols-2 gap-4 h-full">
{/* Row 1 Left: Area Crowd Density Heatmap */}
<div className="bg-surface border border-border-subtle rounded-lg flex flex-col overflow-hidden relative">
<div className="p-4 border-b border-border-subtle bg-surface-dim flex justify-between items-center z-10 relative">
<h2 className="text-[15px] font-title-sm font-semibold whitespace-nowrap truncate">지역 인파 밀집도 히트맵</h2>
<div className="flex gap-3 text-mono-data font-mono-data text-text-muted">
<div className="flex items-center gap-1 whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-danger"></div> 높음 (위험)</div>
<div className="flex items-center gap-1 whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-warning"></div> 경고 (주의)</div>
<div className="flex items-center gap-1 whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-tertiary"></div> 안전</div>
</div>
</div>
<div className="flex-1 relative bg-surface-container-lowest" data-alt="Top-down thermal and optical view of a modern urban plaza at dusk, deep dark industrial aesthetic. Overlaid with glowing vibrant red, yellow, and green heatmap spots indicating crowd density. High contrast, mission-critical UI styling." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB88HhFHD6XbdD3hSvXaE0drmNQNZedMJn_loKhmmWtUhgq48o9-0nYmxFOFJY9EPGnqK0dn4FH77Hj6WpI0wq_8l_T6qK3pq3gTehqanaeIF3Yfq4T2_Vopuxrj3ZHWbW4GR57xAU50aopvj0VszqBbCICjP5wnsxD2j5qcru8zahudjx7s6xAXPSaHZBBs4REPKAgOOUqQlyciCumZNRXNRcR7sgFDdBzgfLIdOyDbRgJAe3kEtNpfg')" }}>
{/* Faux heatmap spots for UI context */}
<div className="absolute top-[30%] left-[40%] w-32 h-32 bg-danger/40 rounded-full blur-2xl"></div>
<div className="absolute top-[60%] left-[20%] w-24 h-24 bg-warning/30 rounded-full blur-xl"></div>
<div className="absolute top-[20%] right-[30%] w-40 h-40 bg-tertiary/20 rounded-full blur-2xl"></div>
<div className="absolute bottom-4 left-4 bg-surface/90 border border-border-subtle p-2 rounded backdrop-blur-sm text-[11px] font-mono-data whitespace-nowrap"> 서쪽 운동장 - 실시간 피드 활성 </div>
</div>
</div>
{/* Row 1 Right: Incident Alert Trend */}
<div className="bg-surface border border-border-subtle rounded-lg flex flex-col">
<div className="p-4 border-b border-border-subtle bg-surface-dim">
<h2 className="text-[15px] font-title-sm font-semibold whitespace-nowrap truncate">사건 경고 추이</h2>
</div>
<div className="flex-1 p-6 flex flex-col">
<div className="flex-1 border-b border-l border-border-subtle relative flex items-end justify-between px-4 pb-2 pt-8 gap-2">
{/* Simulated Chart Grid */}
<div className="absolute top-1/4 left-0 w-full border-t border-border-subtle/50 border-dashed"></div>
<div className="absolute top-2/4 left-0 w-full border-t border-border-subtle/50 border-dashed"></div>
<div className="absolute top-3/4 left-0 w-full border-t border-border-subtle/50 border-dashed"></div>
{/* Simulated Bars */}
<div className="w-full bg-tertiary/20 border border-tertiary/50 h-[30%] relative group cursor-pointer hover:bg-tertiary/40 transition-colors rounded-t-sm"></div>
<div className="w-full bg-tertiary/20 border border-tertiary/50 h-[45%] relative group cursor-pointer hover:bg-tertiary/40 transition-colors rounded-t-sm"></div>
<div className="w-full bg-warning/30 border border-warning/50 h-[60%] relative group cursor-pointer hover:bg-warning/50 transition-colors rounded-t-sm"></div>
<div className="w-full bg-danger/40 border border-danger/60 h-[85%] relative group cursor-pointer hover:bg-danger/60 transition-colors rounded-t-sm">
{/* Alert Marker */}
<div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-danger text-white text-[10px] px-2 py-1 rounded whitespace-nowrap hidden group-hover:block z-10 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-danger"> 추락 감지 (15:00) </div>
</div>
<div className="w-full bg-tertiary/20 border border-tertiary/50 h-[50%] relative group cursor-pointer hover:bg-tertiary/40 transition-colors rounded-t-sm"></div>
<div className="w-full bg-tertiary/20 border border-tertiary/50 h-[35%] relative group cursor-pointer hover:bg-tertiary/40 transition-colors rounded-t-sm"></div>
</div>
<div className="flex justify-between mt-2 text-[11px] font-mono-data text-text-muted px-4">
<span>10:00</span>
<span>12:00</span>
<span>14:00</span>
<span className="text-danger font-bold">15:00</span>
<span>16:00</span>
<span>18:00</span>
</div>
<div className="flex justify-center gap-6 mt-4 text-[11px] font-mono-data whitespace-nowrap">
<div className="flex items-center gap-2"><div className="w-3 h-3 bg-danger/60 border border-danger rounded-sm"></div> 추락</div>
<div className="flex items-center gap-2"><div className="w-3 h-3 bg-warning/50 border border-warning rounded-sm"></div> 침입</div>
<div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary/50 border border-primary rounded-sm"></div> 화재</div>
</div>
</div>
</div>
{/* Row 2 Left: Object Counting Data */}
<div className="bg-surface border border-border-subtle rounded-lg flex flex-col">
<div className="p-4 border-b border-border-subtle bg-surface-dim">
<h2 className="text-[15px] font-title-sm font-semibold whitespace-nowrap truncate">객체 계수 데이터 (누적)</h2>
</div>
<div className="flex-1 p-4 grid grid-cols-1 gap-4">
<div className="bg-surface-container-high border border-border-subtle rounded-lg p-6 flex justify-between items-center hover:border-primary/50 transition-colors">
<div>
<div className="text-text-muted text-[11px] font-label-caps mb-1 whitespace-nowrap truncate">사람</div>
<div className="text-display-lg font-display-lg text-on-surface">45,820</div>
</div>
<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
<span className="material-symbols-outlined text-primary text-3xl">directions_walk</span>
</div>
</div>
<div className="bg-surface-container-high border border-border-subtle rounded-lg p-6 flex justify-between items-center hover:border-secondary/50 transition-colors">
<div>
<div className="text-text-muted text-[11px] font-label-caps mb-1 whitespace-nowrap truncate">차량</div>
<div className="text-display-lg font-display-lg text-on-surface">12,430</div>
</div>
<div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20">
<span className="material-symbols-outlined text-secondary text-3xl">directions_car</span>
</div>
</div>
<div className="bg-surface-container-high border border-danger/30 rounded-lg p-6 flex justify-between items-center hover:border-danger transition-colors relative overflow-hidden">
<div className="absolute left-0 top-0 bottom-0 w-1 bg-danger"></div>
<div>
<div className="text-danger text-[11px] font-label-caps mb-1 whitespace-nowrap truncate">고위험 오토바이</div>
<div className="text-display-lg font-display-lg text-danger">145</div>
</div>
<div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center border border-danger/20">
<span className="material-symbols-outlined text-danger text-3xl">two_wheeler</span>
</div>
</div>
</div>
</div>
{/* Row 2 Right: Dwell Time Analytics */}
<div className="bg-surface border border-border-subtle rounded-lg flex flex-col">
<div className="p-4 border-b border-border-subtle bg-surface-dim">
<h2 className="text-[15px] font-title-sm font-semibold whitespace-nowrap truncate">체류 시간 분석 (평균 대기 시간)</h2>
</div>
<div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
<div className="space-y-2">
<div className="flex justify-between items-end">
<div className="text-[13px] font-body-base font-medium whitespace-nowrap truncate pr-2">A-3 지하철 출구</div>
<div className="text-mono-data font-mono-data text-primary">1m 24s</div>
</div>
<div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
<div className="bg-primary h-full rounded-full" style={{ width: "25%" }}></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between items-end">
<div className="text-[13px] font-body-base font-medium whitespace-nowrap truncate pr-2">C-1 버스 정류장</div>
<div className="text-mono-data font-mono-data text-danger">8m 45s</div>
</div>
<div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
<div className="bg-danger h-full rounded-full" style={{ width: "85%" }}></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between items-end">
<div className="text-[13px] font-body-base font-medium whitespace-nowrap truncate pr-2">중앙 로비 대기열</div>
<div className="text-mono-data font-mono-data text-warning">4m 12s</div>
</div>
<div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
<div className="bg-warning h-full rounded-full" style={{ width: "50%" }}></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between items-end">
<div className="text-[13px] font-body-base font-medium whitespace-nowrap truncate pr-2">북문 출입 관리소</div>
<div className="text-mono-data font-mono-data text-tertiary">0m 45s</div>
</div>
<div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
<div className="bg-tertiary h-full rounded-full" style={{ width: "15%" }}></div>
</div>
</div>
</div>
</div>
</div>
</main> </> );
};

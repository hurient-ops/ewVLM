import React from 'react'; export const VssSemanticSearch: React.FC = () => { return ( <>
<main className="flex-1 flex flex-col min-w-0 bg-surface-dim">
<div className="flex-1 p-gutter relative flex flex-col">
<div className="flex-1 rounded-sm border-[2px] border-primary/40 relative overflow-hidden bg-black shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
<div className="absolute inset-0 bg-cover bg-center" data-alt="A high-resolution, gritty security camera playback view of an industrial loading dock at night. The scene is illuminated by harsh, artificial spotlights casting long, dramatic shadows across concrete surfaces. A large shipping container is visible in the background. In the foreground, a highly precise, neon-red bounding box overlays a figure near a stack of pallets, indicating an AI-detected anomaly. The overall aesthetic is strictly technical and mission-critical, maintaining a dark-mode palette optimized for extended professional monitoring, with deep blacks and stark contrast." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD4SEbi8Lygn02Z88X6mtD1HAHuf_3NcNxHPgYmsRd9n_y-fDSnhjKsiq8xViD6-jfibHOHCgN02lyOmP-Wq6YzdKyDg4G2OX42HWg8Tbb_zA7sWdVfFQmwZ4BL8_gntjC_vt0ol7wK_8NyTuCruZ8l0jvAJYVitOx0c9f6sWMHncQc52XQ0CdsyTB0rC2EI1g3iwPKFqJBl7HRKVLVhgnSxsFklkKEuTOi3wAE9YCWVLGIFF1rXBIv0A')" }}></div>
<div className="absolute top-osd-margin left-osd-margin flex flex-col gap-1 z-10">
<div className="bg-surface-container-lowest/80 backdrop-blur-sm border border-border-subtle px-2 py-1 rounded-sm flex items-center gap-2 w-fit">
<span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
<span className="text-osd-label font-osd-label text-on-surface uppercase">재생</span>
</div>
<div className="bg-surface-container-lowest/80 backdrop-blur-sm border border-border-subtle px-2 py-1 rounded-sm w-fit mt-1">
<span className="text-osd-label font-osd-label text-on-surface">CH-03 하역장 • 4K • H.265</span>
</div>
</div>
<div className="absolute top-osd-margin right-osd-margin z-10 bg-surface-container-lowest/80 backdrop-blur-sm border border-border-subtle px-3 py-1.5 rounded-sm">
<span className="text-mono-data font-mono-data text-on-surface text-[14px]">2024-10-24 14:32:45.102</span>
</div>
<div className="absolute inset-0 pointer-events-none">
<div className="absolute top-[40%] left-[60%] w-[120px] h-[200px] border-[1.5px] border-danger bg-danger/5">
<div className="absolute -top-[18px] left-[-1.5px] bg-danger text-on-error px-1 text-[10px] font-mono-data flex items-center gap-1 h-[18px]">
<span className="material-symbols-outlined text-[10px]">warning</span> 경고: 쓰러짐 감지 (98.7%) </div>
</div>
<div className="absolute top-[20%] left-[10%] w-[80px] h-[150px] border-[1.5px] border-primary bg-primary/5">
<div className="absolute -top-[18px] left-[-1.5px] bg-primary text-on-primary px-1 text-[10px] font-mono-data h-[18px]"> 사람 (92%) </div>
</div>
</div>
</div>
<div className="h-14 bg-surface border border-border-subtle mt-gutter flex items-center px-4 justify-between shrink-0">
<div className="flex items-center gap-2">
<button className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface hover:bg-surface-container-highest rounded transition-colors" title="-10s">
<span className="material-symbols-outlined text-[20px]">replay_10</span>
</button>
<button className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface hover:bg-surface-container-highest rounded transition-colors" title="Previous Frame">
<span className="material-symbols-outlined text-[20px]">skip_previous</span>
</button>
<button className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary rounded shadow-sm hover:bg-inverse-primary transition-colors mx-2">
<span className="material-symbols-outlined symbol-filled text-[24px]">pause</span>
</button>
<button className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface hover:bg-surface-container-highest rounded transition-colors" title="Next Frame">
<span className="material-symbols-outlined text-[20px]">skip_next</span>
</button>
<button className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface hover:bg-surface-container-highest rounded transition-colors" title="+10s">
<span className="material-symbols-outlined text-[20px]">forward_10</span>
</button>
</div>
<div className="flex items-center bg-surface-container-lowest border border-border-subtle rounded p-1">
<button className="px-2 py-1 text-mono-data font-mono-data text-text-muted hover:text-on-surface rounded text-[11px]">-8x</button>
<button className="px-2 py-1 text-mono-data font-mono-data text-text-muted hover:text-on-surface rounded text-[11px]">-4x</button>
<button className="px-2 py-1 text-mono-data font-mono-data text-text-muted hover:text-on-surface rounded text-[11px]">-2x</button>
<div className="w-[1px] h-4 bg-border-subtle mx-1"></div>
<button className="px-3 py-1 bg-surface-container-highest text-primary font-bold text-mono-data font-mono-data rounded shadow-sm text-[11px]">1x</button>
<div className="w-[1px] h-4 bg-border-subtle mx-1"></div>
<button className="px-2 py-1 text-mono-data font-mono-data text-text-muted hover:text-on-surface rounded text-[11px]">2x</button>
<button className="px-2 py-1 text-mono-data font-mono-data text-text-muted hover:text-on-surface rounded text-[11px]">4x</button>
<button className="px-2 py-1 text-mono-data font-mono-data text-text-muted hover:text-on-surface rounded text-[11px]">8x</button>
</div>
<div className="flex items-center gap-3 text-mono-data font-mono-data">
<span className="text-text-primary">14:32:45</span>
<span className="text-text-muted">/</span>
<span className="text-text-muted">23:59:59</span>
<button className="ml-2 w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface rounded border border-border-subtle hover:bg-surface-container-highest"><span className="material-symbols-outlined text-[18px]">fullscreen</span></button>
</div>
</div>
</div>
<div className="h-40 bg-surface border-t border-border-subtle flex flex-col shrink-0">
<div className="flex justify-between items-center px-4 py-2 border-b border-border-subtle bg-surface-container-lowest">
<span className="text-label-caps font-label-caps text-text-muted flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">timeline</span> 프로그레시브 타임라인</span>
<div className="flex items-center gap-4">
<div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-danger"></span><span className="text-mono-data font-mono-data text-text-muted text-[10px]">위험</span></div>
<div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-neon-gold"></span><span className="text-mono-data font-mono-data text-text-muted text-[10px]">경고</span></div>
<div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"></span><span className="text-mono-data font-mono-data text-text-muted text-[10px]">정보</span></div>
</div>
</div>
<div className="flex-1 flex flex-col p-4 gap-4 bg-surface-dim overflow-hidden">
<div className="relative h-6 w-full flex items-end">
<div className="absolute inset-0 bg-surface-container border border-border-subtle rounded-sm overflow-hidden flex">
<div className="w-1/4 h-full border-r border-border-subtle/50 bg-grid-pattern opacity-30"></div>
<div className="w-1/2 h-full border-r border-border-subtle/50 timeline-gradient-active relative">
<div className="absolute top-0 bottom-0 left-[20%] w-0.5 bg-neon-gold shadow-[0_0_4px_#F59E0B]"></div>
<div className="absolute top-0 bottom-0 left-[65%] w-0.5 bg-danger shadow-[0_0_4px_#EF4444]"></div>
<div className="absolute top-0 bottom-0 left-[60%] right-[30%] bg-white/10 border-x border-white/30 cursor-ew-resize hover:bg-white/20 transition-colors group">
<div className="absolute -top-6 left-1/2 -translate-x-1/2 text-mono-data font-mono-data text-text-primary text-[10px] bg-surface-container-highest px-1.5 py-0.5 rounded border border-border-subtle opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">창 확대</div>
</div>
</div>
<div className="w-1/4 h-full bg-grid-pattern opacity-30"></div>
</div>
<div className="absolute -bottom-5 w-full flex justify-between text-mono-data font-mono-data text-text-muted text-[10px]">
<span>00:00</span>
<span>06:00</span>
<span>12:00</span>
<span>18:00</span>
<span>24:00</span>
</div>
</div>
<div className="relative flex-1 mt-4">
<div className="absolute inset-0 bg-surface border border-border-subtle rounded-sm flex flex-col">
<div className="absolute top-0 bottom-0 left-[45%] w-[2px] bg-primary z-20 shadow-[0_0_8px_#7c3aed]">
<div className="absolute -top-3 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary"></div>
</div>
<div className="flex-1 relative overflow-hidden bg-grid-pattern">
<div className="absolute inset-y-0 left-[15%] w-[40px] bg-primary/10 border-x border-primary/20 hover:bg-primary/20 cursor-pointer flex items-center justify-center group">
<span className="material-symbols-outlined text-primary text-[16px] opacity-50 group-hover:opacity-100">person</span>
</div>
<div className="absolute inset-y-0 left-[44.5%] w-[20px] bg-danger/20 border-x border-danger/40 hover:bg-danger/30 cursor-pointer flex items-center justify-center group shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]">
<span className="material-symbols-outlined symbol-filled text-danger text-[14px] drop-shadow-[0_0_4px_rgba(239,68,68,0.8)]">emergency</span>
</div>
<div className="absolute inset-y-0 left-[80%] w-[60px] bg-neon-gold/10 border-x border-neon-gold/20 hover:bg-neon-gold/20 cursor-pointer flex items-center justify-center group">
<span className="material-symbols-outlined text-neon-gold text-[16px] opacity-50 group-hover:opacity-100">local_shipping</span>
</div>
</div>
<div className="h-5 border-t border-border-subtle bg-surface-container flex items-center justify-between px-2">
<span className="text-mono-data font-mono-data text-text-muted text-[10px]">14:30:00</span>
<div className="flex-1 flex justify-evenly text-mono-data font-mono-data text-outline-variant text-[9px]">
<span>:31</span><span>:32</span><span>:33</span><span>:34</span>
</div>
<span className="text-mono-data font-mono-data text-text-muted text-[10px]">14:35:00</span>
</div>
</div>
</div>
</div>
</div>
<div className="h-56 bg-surface-container-low border-t border-border-subtle flex flex-col shrink-0">
<div className="p-4 border-b border-border-subtle flex items-start gap-4 bg-surface">
<div className="w-10 h-10 rounded-full bg-primary-container/20 border border-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary">search_spark</span>
</div>
<div className="flex-1 flex flex-col gap-2">
<div className="relative">
<input className="w-full bg-surface-container-lowest border border-border-subtle rounded p-3 pl-4 pr-24 text-body-base font-body-base text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline-variant shadow-inner" type="text" value="서쪽 계단 근처에서 쓰러진 사람 찾기."/>
<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
<span className="text-mono-data font-mono-data text-text-muted text-[10px] bg-surface px-1.5 py-0.5 rounded border border-border-subtle">입력 ↵</span>
<button className="bg-primary text-on-primary p-1.5 rounded hover:bg-inverse-primary transition-colors flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">arrow_forward</span></button>
</div>
</div>
<div className="flex items-center gap-2">
<span className="text-label-caps font-label-caps text-text-muted">필터:</span>
<span className="bg-surface-container px-2 py-1 rounded border border-border-subtle text-mono-data font-mono-data text-on-surface-variant text-[10px] flex items-center gap-1 cursor-pointer hover:border-outline"><span className="material-symbols-outlined text-[12px]">schedule</span> 최근 24시간</span>
<span className="bg-surface-container px-2 py-1 rounded border border-border-subtle text-mono-data font-mono-data text-on-surface-variant text-[10px] flex items-center gap-1 cursor-pointer hover:border-outline"><span className="material-symbols-outlined text-[12px]">videocam</span> CH-03</span>
<span className="bg-primary-container/20 text-primary border-primary/50 px-2 py-1 rounded border text-mono-data font-mono-data text-[10px] flex items-center gap-1 cursor-pointer hover:bg-primary-container/30"><span className="material-symbols-outlined text-[12px]">add</span> 필터 추가</span>
</div>
</div>
</div>
<div className="flex-1 p-4 overflow-x-auto flex gap-4 bg-surface-dim items-center">
<div className="w-64 h-full bg-surface border border-danger/40 rounded flex flex-col overflow-hidden shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.1)] relative group">
<div className="absolute top-0 right-0 bg-danger text-on-error px-2 py-0.5 text-mono-data font-mono-data text-[10px] font-bold rounded-bl z-10 flex items-center gap-1">
<span className="material-symbols-outlined text-[10px]">local_fire_department</span> 98.7% 일치 </div>
<div className="h-24 w-full relative border-b border-border-subtle">
<div className="absolute inset-0 bg-cover bg-center" data-alt="A cropped, zoomed-in security camera frame showing a blurry figure on the ground near concrete steps, highlighted by a red AI bounding box. Technical, low light, critical incident aesthetic." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDzprRcN0kVBjqgQh1nrGL47mB-f6WTZt3tEoi_TXul2a4qM6cHbekMl96pddySz-R0qOyRnsRLmexo-eIgWihud4psi3dppJkcvAKmfS1AdLQcnvsVOvm25VX9PSMDnFhX4BKNeCvBkr8kLO60xKdjRIFCMK8onjRqRRV2w-HL1X8h_PuwyHvlnf_wf9IynmncXXqXR2R6oBxVtsz3Wx1GrO1NA98QTMJ_qIOrAftqkU_59BJe7ze2JA')" }}></div>
<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]">
<span className="material-symbols-outlined symbol-filled text-white text-[32px] drop-shadow-md">play_circle</span>
</div>
</div>
<div className="flex-1 p-2 flex flex-col justify-between bg-surface-container-lowest">
<div>
<h3 className="text-body-sm font-body-sm text-text-primary font-semibold truncate">대상자 쓰러짐 감지</h3>
<p className="text-mono-data font-mono-data text-text-muted text-[10px] mt-0.5">CH-03 • 14:32:45</p>
</div>
<button className="w-full bg-surface-container hover:bg-surface-container-highest border border-border-subtle text-on-surface text-label-caps font-label-caps py-1.5 rounded transition-colors flex items-center justify-center gap-1 mt-2"> 이벤트로 이동 <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
</button>
</div>
</div>
<div className="w-64 h-full bg-surface border border-border-subtle rounded flex flex-col overflow-hidden shrink-0 group hover:border-outline-variant transition-colors">
<div className="absolute top-0 right-0 bg-surface-container-highest text-on-surface px-2 py-0.5 text-mono-data font-mono-data text-[10px] rounded-bl z-10"> 74.2% 일치 </div>
<div className="h-24 w-full relative border-b border-border-subtle">
<div className="absolute inset-0 bg-cover bg-center grayscale opacity-80" data-alt="A security camera frame showing a person walking near stairs, but not falling. A green AI bounding box tracks their movement. Technical, neutral monitoring aesthetic." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDvCj8hFmy08bTRCQcjGW0sepR2Qet--U6c0V8O2-qgiTJf-pmJDTYy-rLvj_YGtDK8ENLfFooc7Nx2mZUAOhBqFI3bkXWb1uYePd13vuMCY8miAq0GPJuWWpVpvFB3oZAN8qDv02-O8QZqPIXSgiZusqYvMZaVXxaZ-e-llzHdoasrW2MogLa3bD3Kxhu-HT5j4PCq_D-1fo6ZX7SJ7mUeLgZTc9lGNk6JYZuct4OZxgYdxbK9iQUN2A')" }}></div>
<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]">
<span className="material-symbols-outlined symbol-filled text-white text-[32px] drop-shadow-md">play_circle</span>
</div>
</div>
<div className="flex-1 p-2 flex flex-col justify-between bg-surface-container-lowest">
<div>
<h3 className="text-body-sm font-body-sm text-text-primary font-semibold truncate text-on-surface-variant">빠른 움직임</h3>
<p className="text-mono-data font-mono-data text-text-muted text-[10px] mt-0.5">CH-03 • 14:31:12</p>
</div>
<button className="w-full bg-surface-container hover:bg-surface-container-highest border border-border-subtle text-text-muted hover:text-on-surface text-label-caps font-label-caps py-1.5 rounded transition-colors flex items-center justify-center gap-1 mt-2"> 보기 <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
</button>
</div>
</div>
<div className="h-full border border-dashed border-border-subtle rounded w-32 shrink-0 flex flex-col items-center justify-center text-text-muted hover:bg-surface-container-low transition-colors cursor-pointer gap-2">
<span className="material-symbols-outlined text-[24px]">more_horiz</span>
<span className="text-label-caps font-label-caps text-[10px] text-center px-2">결과<br/>더보기</span>
</div>
</div>
</div>
</main> </> );
};

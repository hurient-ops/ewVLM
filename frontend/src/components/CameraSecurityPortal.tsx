import React from 'react'; export const CameraSecurityPortal: React.FC = () => { return ( <>
<main className="flex-1 min-w-0 h-screen w-full flex flex-col bg-surface-container-lowest">
{/* Canvas Header */}
<div className="px-container-padding py-4 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-border-subtle bg-surface/50 backdrop-blur-md sticky top-0 z-30">
<div>
<h1 className="font-display-lg text-on-surface flex items-center gap-3 text-headline-md">
<span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>encrypted</span> 단말 카메라 하드웨어 사이버 보안 &amp; 인증서 관리자 포탈 </h1>
<p className="text-text-muted text-body-base font-body-base mt-1">엔드포인트 수명 주기 관리 및 원격 키 주입 제어</p>
</div>
<div className="flex gap-2 mt-4 sm:mt-0">
<button className="bg-surface border border-border-subtle text-on-surface text-body-sm font-body-sm px-4 py-2 rounded hover:bg-surface-container-high transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">sync</span> 강제 로테이션 </button>
<button className="bg-primary-container text-white text-body-sm font-body-sm px-4 py-2 rounded font-semibold hover:bg-inverse-primary transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(124,58,237,0.4)]">
<span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>key</span> 마스터 키 주입 </button>
</div>
</div>
{/* Scrollable Content */}
<div className="flex-1 overflow-y-auto p-container-padding flex flex-col gap-4">
{/* Top Metrics Bento */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
<div className="bg-surface border border-border-subtle p-4 rounded flex flex-col justify-between h-32 relative overflow-hidden group">
<div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
<div className="flex justify-between items-start relative z-10">
<span className="text-label-caps font-label-caps text-text-muted">전체 관리 장치</span>
<span className="material-symbols-outlined text-primary text-[20px]">router</span>
</div>
<div className="text-headline-md font-headline-md text-on-surface relative z-10">1,248</div>
</div>
<div className="bg-surface border border-border-subtle p-4 rounded flex flex-col justify-between h-32 relative overflow-hidden group">
<div className="flex justify-between items-start relative z-10">
<span className="text-label-caps font-label-caps text-text-muted">활성 TLS 인증서</span>
<span className="material-symbols-outlined text-tertiary text-[20px]">verified_user</span>
</div>
<div className="flex items-end gap-2 relative z-10">
<div className="text-headline-md font-headline-md text-on-surface">1,240</div>
<div className="text-body-sm font-body-sm text-tertiary mb-1">99.3% Health</div>
</div>
<div className="w-full bg-surface-container-high h-1 mt-2 rounded-full overflow-hidden relative z-10">
<div className="bg-tertiary h-full w-[99.3%]"></div>
</div>
</div>
<div className="bg-surface border border-danger/30 p-4 rounded flex flex-col justify-between h-32 relative overflow-hidden group">
<div className="absolute inset-0 bg-danger/5 animate-pulse"></div>
<div className="flex justify-between items-start relative z-10">
<span className="text-label-caps font-label-caps text-danger">만료 예정</span>
<span className="material-symbols-outlined text-danger text-[20px]">warning</span>
</div>
<div className="text-headline-md font-headline-md text-danger relative z-10">8</div>
<p className="text-mono-data font-mono-data text-danger/70 text-[10px] mt-1 relative z-10">Auto-rotation failed</p>
</div>
<div className="bg-surface border border-border-subtle p-4 rounded flex flex-col justify-between h-32 relative overflow-hidden group">
<div className="flex justify-between items-start relative z-10">
<span className="text-label-caps font-label-caps text-text-muted">KMS 동기화 상태</span>
<span className="material-symbols-outlined text-tertiary text-[20px]">cloud_sync</span>
</div>
<div className="flex flex-col gap-1 relative z-10">
<div className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(78,222,163,0.8)]"></div> Synchronized </div>
<div className="text-mono-data font-mono-data text-text-muted">Last sync: 2m ago</div>
</div>
</div>
</div>
{/* Main Data Table & Detail Panel */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter flex-1 min-h-[500px]">
{/* Device List Table */}
<div className="lg:col-span-2 bg-surface border border-border-subtle rounded flex flex-col overflow-hidden">
<div className="p-3 border-b border-border-subtle flex justify-between items-center bg-surface-dim">
<h3 className="text-title-sm font-title-sm text-on-surface">엔드포인트 보안 매트릭스</h3>
<div className="flex gap-2">
<div className="relative">
<span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">search</span>
<input className="bg-surface-container-highest border-none text-body-sm font-body-sm text-on-surface py-1 pl-8 pr-3 rounded w-48 focus:ring-1 focus:ring-primary outline-none placeholder:text-text-muted" placeholder="Filter devices..." type="text" />
</div>
<button className="bg-surface-container-highest p-1 rounded hover:bg-surface-variant transition-colors text-text-muted">
<span className="material-symbols-outlined text-[18px]">filter_list</span>
</button>
</div>
</div>
<div className="flex-1 overflow-auto">
<table className="w-full text-left border-collapse">
<thead className="sticky top-0 bg-surface z-10 border-b border-border-subtle">
<tr>
<th className="px-4 py-2 text-label-caps font-label-caps text-text-muted font-normal">장치 ID</th>
<th className="px-4 py-2 text-label-caps font-label-caps text-text-muted font-normal">IP 주소</th>
<th className="px-4 py-2 text-label-caps font-label-caps text-text-muted font-normal">암호 모듈</th>
<th className="px-4 py-2 text-label-caps font-label-caps text-text-muted font-normal">인증서 유효</th>
<th className="px-4 py-2 text-label-caps font-label-caps text-text-muted font-normal text-right">작업</th>
</tr>
</thead>
<tbody className="text-mono-data font-mono-data">
{/* Row 1: Healthy */}
<tr className="border-b border-border-subtle hover:bg-surface-container-highest transition-colors cursor-pointer group">
<td className="px-4 py-3 flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-tertiary">videocam</span>
<span className="text-on-surface">CAM-NTH-01</span>
</td>
<td className="px-4 py-3 text-text-muted">192.168.10.45</td>
<td className="px-4 py-3">
<span className="bg-tertiary/10 text-tertiary border border-tertiary/20 px-2 py-0.5 rounded text-[10px]">VERIFIED</span>
</td>
<td className="px-4 py-3 text-text-muted">142 Days</td>
<td className="px-4 py-3 text-right">
<button className="text-primary hover:text-inverse-primary opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-[18px]">key</span></button>
</td>
</tr>
{/* Row 2: Warning */}
<tr className="border-b border-border-subtle hover:bg-surface-container-highest transition-colors cursor-pointer group bg-warning/5">
<td className="px-4 py-3 flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-warning">sensors</span>
<span className="text-on-surface">RAD-EST-12</span>
</td>
<td className="px-4 py-3 text-text-muted">10.0.4.112</td>
<td className="px-4 py-3">
<span className="bg-warning/10 text-warning border border-warning/20 px-2 py-0.5 rounded text-[10px]">UPDATE REQ</span>
</td>
<td className="px-4 py-3 text-warning">5 Days</td>
<td className="px-4 py-3 text-right flex justify-end gap-2">
<button className="bg-warning/20 text-warning px-2 py-1 rounded text-[10px] font-bold hover:bg-warning/30 transition-colors">ROTATE</button>
</td>
</tr>
{/* Row 3: Healthy */}
<tr className="border-b border-border-subtle hover:bg-surface-container-highest transition-colors cursor-pointer group">
<td className="px-4 py-3 flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-tertiary">videocam</span>
<span className="text-on-surface">CAM-STH-04</span>
</td>
<td className="px-4 py-3 text-text-muted">192.168.10.88</td>
<td className="px-4 py-3">
<span className="bg-tertiary/10 text-tertiary border border-tertiary/20 px-2 py-0.5 rounded text-[10px]">VERIFIED</span>
</td>
<td className="px-4 py-3 text-text-muted">210 Days</td>
<td className="px-4 py-3 text-right">
<button className="text-primary hover:text-inverse-primary opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-[18px]">key</span></button>
</td>
</tr>
{/* Row 4: Danger */}
<tr className="border-b border-border-subtle hover:bg-surface-container-highest transition-colors cursor-pointer group bg-danger/5 border-l-2 border-l-danger">
<td className="px-4 py-3 flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-danger">videocam</span>
<span className="text-on-surface font-bold">CAM-WST-09</span>
</td>
<td className="px-4 py-3 text-text-muted">192.168.11.02</td>
<td className="px-4 py-3">
<span className="bg-danger/10 text-danger border border-danger/20 px-2 py-0.5 rounded text-[10px] animate-pulse">COMPROMISED</span>
</td>
<td className="px-4 py-3 text-danger">EXPIRED</td>
<td className="px-4 py-3 text-right">
<button className="bg-danger text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-danger/80 transition-colors shadow-[0_0_8px_rgba(239,68,68,0.5)]">INJECT TLS</button>
</td>
</tr>
{/* Dummy rows to fill space */}
<tr className="border-b border-border-subtle hover:bg-surface-container-highest transition-colors cursor-pointer group">
<td className="px-4 py-3 flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-text-muted">router</span>
<span className="text-text-muted">RTR-CORE-1</span>
</td>
<td className="px-4 py-3 text-text-muted/50">10.0.0.1</td>
<td className="px-4 py-3">
<span className="text-text-muted/50 text-[10px]">N/A</span>
</td>
<td className="px-4 py-3 text-text-muted/50">-</td>
<td className="px-4 py-3 text-right"></td>
</tr>
</tbody>
</table>
</div>
</div>
{/* Action & Detail Panel (Focused State) */}
<div className="bg-surface border border-primary/30 rounded flex flex-col overflow-hidden relative">
{/* Tech overlay effect */}
<div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
<div className="p-4 border-b border-border-subtle bg-surface-dim flex justify-between items-center relative z-10">
<h3 className="text-title-sm font-title-sm text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]">target</span> Target: CAM-WST-09 </h3>
<span className="bg-danger/20 text-danger px-2 py-0.5 rounded text-[10px] font-mono-data font-bold border border-danger/30">ALERT</span>
</div>
<div className="p-4 flex-1 flex flex-col gap-4 relative z-10 overflow-y-auto">
{/* Key injection terminal UI */}
<div className="bg-surface-container-lowest border border-border-subtle rounded p-3 font-mono-data text-mono-data">
<div className="text-text-muted mb-2 text-[10px] border-b border-border-subtle pb-1">KMS 주입 로그</div>
<div className="text-text-muted flex gap-2"><span className="text-primary">&gt;</span> Initiating handshake...</div>
<div className="text-text-muted flex gap-2"><span className="text-primary">&gt;</span> Validating hardware root of trust...</div>
<div className="text-danger flex gap-2"><span className="text-danger">!</span> ERROR: TLS Cert Expired. Key rotation halted.</div>
<div className="text-text-muted flex gap-2 mt-2"><span className="text-primary animate-pulse">_</span></div>
</div>
<div className="space-y-3 mt-2">
<div className="flex flex-col gap-1">
<label className="text-label-caps font-label-caps text-text-muted">Target IP</label>
<div className="bg-surface-container-highest p-2 rounded text-body-sm font-body-sm text-on-surface border border-border-subtle">192.168.11.02:443</div>
</div>
<div className="flex flex-col gap-1">
<label className="text-label-caps font-label-caps text-text-muted">Key Policy</label>
<select className="bg-surface-container-highest border border-border-subtle text-body-sm font-body-sm text-on-surface p-2 rounded focus:ring-1 focus:ring-primary outline-none w-full appearance-none">
<option>AES-256-GCM (High Security)</option>
<option>AES-128-CBC (Legacy)</option>
</select>
</div>
</div>
<div className="mt-auto pt-4 flex flex-col gap-2">
<button className="w-full bg-surface border border-primary text-primary hover:bg-primary/10 transition-colors py-2 rounded text-body-sm font-body-sm font-semibold flex justify-center items-center gap-2">
<span className="material-symbols-outlined text-[18px]">autorenew</span> 비밀번호 강제 변경 </button>
<button className="w-full bg-primary-container text-white hover:bg-inverse-primary transition-colors py-2 rounded text-body-sm font-body-sm font-bold flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(124,58,237,0.5)]">
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>security_update_good</span> 인증서 주입 및 로테이션 </button>
</div>
</div>
</div>
</div>
</div>
</main> </> );
};

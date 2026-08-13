import React from 'react'; export const SystemAuditLogPortal: React.FC = () => { return ( <>
<main className="flex-1 flex flex-col overflow-hidden bg-background p-container-padding gap-4">
{/* Page Header */}
<div className="flex justify-between items-end border-b border-border-subtle pb-4">
<div>
<h2 className="text-display-lg font-display-lg text-on-surface mb-1">암호학적 시스템 로그 위변조 방지 감사 이력 포탈</h2>
<p className="text-body-base font-body-base text-text-muted">VSS 쿼리 및 접속 기록을 위한 불변 원장. SHA-256 실링으로 보호됨.</p>
</div>
<div className="flex gap-2">
<div className="bg-surface border border-border-subtle rounded-DEFAULT px-3 py-1.5 flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_4px_rgba(78,222,163,0.8)]"></span>
<span className="text-mono-data font-mono-data text-on-surface">노드: 동기화됨</span>
</div>
<button className="bg-surface border border-border-subtle rounded-DEFAULT px-3 py-1.5 flex items-center gap-2 text-mono-data font-mono-data text-on-surface hover:border-primary transition-colors">
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>download</span> 로그 내보내기 </button>
</div>
</div>
{/* Bento Grid Layout */}
<div className="flex-1 grid grid-cols-12 grid-rows-6 gap-4 overflow-hidden">
{/* System Status Panel */}
<div className="col-span-12 lg:col-span-3 row-span-2 bg-surface border border-border-subtle rounded-lg p-4 flex flex-col justify-between">
<div className="flex items-center gap-2 mb-2">
<span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
<h3 className="text-title-sm font-title-sm text-on-surface">원장 상태</h3>
</div>
<div className="space-y-4">
<div>
<p className="text-label-caps font-label-caps text-text-muted mb-1">최신 블록</p>
<p className="text-mono-data font-mono-data text-on-surface text-lg">#8,942,105</p>
</div>
<div>
<p className="text-label-caps font-label-caps text-text-muted mb-1">네트워크 해시 레이트</p>
<p className="text-mono-data font-mono-data text-primary">45.2 TH/s</p>
</div>
<div>
<p className="text-label-caps font-label-caps text-text-muted mb-1">최종 실링</p>
<p className="text-mono-data font-mono-data text-on-surface">12초 전</p>
</div>
</div>
</div>
{/* Query Verification Card */}
<div className="col-span-12 lg:col-span-9 row-span-2 bg-surface border border-border-subtle rounded-lg p-4 flex flex-col relative overflow-hidden">
{/* Subtle background texture */}
<div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#7c3aed 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>
<div className="relative z-10 flex justify-between items-start mb-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
<h3 className="text-title-sm font-title-sm text-on-surface">실시간 쿼리 검증</h3>
</div>
<span className="text-osd-label font-osd-label bg-surface-container px-2 py-1 rounded-DEFAULT border border-border-subtle text-text-muted">SHA-256</span>
</div>
<div className="relative z-10 flex-1 flex flex-col justify-center gap-3">
<div className="bg-surface-container-lowest p-3 rounded-DEFAULT border border-border-subtle flex flex-col gap-1">
<span className="text-label-caps font-label-caps text-text-muted">자연어 쿼리</span>
<code className="text-mono-data font-mono-data text-on-surface">"Show me all red sedans passing Sector 4 between 22:00 and 23:00 yesterday."</code>
</div>
<div className="flex items-center gap-2 pl-4">
<span className="material-symbols-outlined text-text-muted text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_downward</span>
</div>
<div className="bg-surface-container-lowest p-3 rounded-DEFAULT border border-primary/30 flex flex-col gap-1 relative overflow-hidden group">
{/* Animated scanning effect line */}
<div className="absolute left-0 top-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
<span className="text-label-caps font-label-caps text-primary flex items-center gap-2"> 해시 서명 <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
</span>
<code className="text-mono-data font-mono-data text-on-surface break-all text-xs opacity-80">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code>
</div>
</div>
</div>
{/* Audit History Grid */}
<div className="col-span-12 row-span-4 bg-surface border border-border-subtle rounded-lg flex flex-col overflow-hidden">
<div className="p-3 border-b border-border-subtle flex justify-between items-center bg-surface-container-low">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>list_alt</span>
<h3 className="text-title-sm font-title-sm text-on-surface">불변 감사 로그</h3>
</div>
<div className="flex gap-2">
<input className="bg-background border border-border-subtle rounded-DEFAULT px-2 py-1 text-mono-data font-mono-data text-on-surface text-xs focus:border-primary focus:outline-none w-48" placeholder="사용자 또는 TxID로 필터링..." type="text"/>
</div>
</div>
<div className="flex-1 overflow-auto">
<table className="w-full text-left border-collapse">
<thead className="sticky top-0 bg-surface-container-lowest border-b border-border-subtle z-10">
<tr>
<th className="p-2 text-label-caps font-label-caps text-text-muted">타임스탬프</th>
<th className="p-2 text-label-caps font-label-caps text-text-muted">사용자 / ID</th>
<th className="p-2 text-label-caps font-label-caps text-text-muted">작업 유형</th>
<th className="p-2 text-label-caps font-label-caps text-text-muted">리소스 / 쿼리</th>
<th className="p-2 text-label-caps font-label-caps text-text-muted">TX 해시</th>
<th className="p-2 text-label-caps font-label-caps text-text-muted">상태</th>
</tr>
</thead>
<tbody className="text-mono-data font-mono-data text-on-surface">
{/* Row 1 */}
<tr className="border-b border-border-subtle hover:bg-surface-container-highest transition-colors">
<td className="p-2 whitespace-nowrap text-text-muted">2023-10-27 14:32:01</td>
<td className="p-2">OP-892 (Admin)</td>
<td className="p-2"><span className="bg-surface-container px-1.5 py-0.5 rounded-DEFAULT border border-border-subtle text-primary">VSS_SEARCH</span></td>
<td className="p-2 truncate max-w-[200px]" title="Find anomalies in Zone B">"Find anomalies in Zone B"</td>
<td className="p-2 truncate max-w-[150px] text-text-muted font-mono" title="0x7a2...f9e1">0x7a2...f9e1</td>
<td className="p-2">
<div className="flex items-center gap-1 text-tertiary">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 실링됨 </div>
</td>
</tr>
{/* Row 2 */}
<tr className="border-b border-border-subtle hover:bg-surface-container-highest transition-colors">
<td className="p-2 whitespace-nowrap text-text-muted">2023-10-27 14:28:45</td>
<td className="p-2">SYS-AUTO</td>
<td className="p-2"><span className="bg-surface-container px-1.5 py-0.5 rounded-DEFAULT border border-border-subtle text-warning">EXPORT_DATA</span></td>
<td className="p-2 truncate max-w-[200px]" title="Daily Log Archive [S4]">Daily Log Archive [S4]</td>
<td className="p-2 truncate max-w-[150px] text-text-muted font-mono" title="0x3b1...a4c2">0x3b1...a4c2</td>
<td className="p-2">
<div className="flex items-center gap-1 text-tertiary">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 실링됨 </div>
</td>
</tr>
{/* Row 3 */}
<tr className="border-b border-border-subtle hover:bg-surface-container-highest transition-colors">
<td className="p-2 whitespace-nowrap text-text-muted">2023-10-27 14:15:10</td>
<td className="p-2">OP-411 (User)</td>
<td className="p-2"><span className="bg-surface-container px-1.5 py-0.5 rounded-DEFAULT border border-border-subtle text-on-surface">LOGIN</span></td>
<td className="p-2 truncate max-w-[200px] text-text-muted">Session Auth</td>
<td className="p-2 truncate max-w-[150px] text-text-muted font-mono" title="0x9f4...d2e8">0x9f4...d2e8</td>
<td className="p-2">
<div className="flex items-center gap-1 text-tertiary">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 실링됨 </div>
</td>
</tr>
{/* Row 4 (Pending/Error example for realism) */}
<tr className="border-b border-border-subtle hover:bg-surface-container-highest transition-colors bg-surface-container-lowest">
<td className="p-2 whitespace-nowrap text-text-muted">2023-10-27 14:35:22</td>
<td className="p-2">OP-892 (Admin)</td>
<td className="p-2"><span className="bg-surface-container px-1.5 py-0.5 rounded-DEFAULT border border-danger/50 text-danger">CONFIG_MOD</span></td>
<td className="p-2 truncate max-w-[200px]">Update AI Thresholds</td>
<td className="p-2 truncate max-w-[150px] text-text-muted font-mono">Pending...</td>
<td className="p-2">
<div className="flex items-center gap-1 text-warning animate-pulse">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span> 메모리풀 </div>
</td>
</tr>
{/* Fill remaining rows to demonstrate density */}
<tr className="border-b border-border-subtle hover:bg-surface-container-highest transition-colors">
<td className="p-2 whitespace-nowrap text-text-muted">2023-10-27 13:50:05</td>
<td className="p-2">OP-205 (User)</td>
<td className="p-2"><span className="bg-surface-container px-1.5 py-0.5 rounded-DEFAULT border border-border-subtle text-primary">VSS_SEARCH</span></td>
<td className="p-2 truncate max-w-[200px]">"Track person in blue jacket"</td>
<td className="p-2 truncate max-w-[150px] text-text-muted font-mono">0xc82...1a5f</td>
<td className="p-2">
<div className="flex items-center gap-1 text-tertiary">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 실링됨 </div>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</main> </> );
};

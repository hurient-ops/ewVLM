import React from 'react'; export const MassDeviceConfigClone: React.FC = () => { return ( <>
<main className="flex-1 flex flex-col h-full bg-[#070A13] overflow-hidden relative">
{/* Header Area */}
<div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-surface shrink-0">
<div>
<h1 className="text-headline-md font-headline-md text-text-primary">대규모 장비 일괄 설정 및 프로파일 클론 콘솔</h1>
<p className="text-body-sm font-body-sm text-text-muted mt-1">선택한 장비 그룹에 마스터 정책을 동시에 적용합니다.</p>
</div>
<div className="flex gap-3">
<button className="px-4 py-2 border border-border-subtle text-text-primary rounded text-sm hover:bg-surface-container-high transition-colors font-semibold">변경 취소</button>
<button className="px-4 py-2 bg-primary-container text-white rounded text-sm hover:bg-inverse-primary transition-colors font-semibold flex items-center gap-2 shadow-lg shadow-primary-container/20">
<span className="material-symbols-outlined text-sm">rocket_launch</span> 일괄 배포 실행 </button>
</div>
</div>
{/* Content Area (3-Column Layout) */}
<div className="flex-1 flex overflow-hidden p-container-padding gap-4">
{/* Col 1: Target Selection Tree */}
<div className="w-1/4 bg-surface rounded-xl border border-border-subtle flex flex-col overflow-hidden shadow-sm">
<div className="p-3 border-b border-border-subtle bg-surface-container flex justify-between items-center">
<h3 className="text-label-caps font-label-caps text-on-surface">대상 그룹</h3>
<span className="text-mono-data font-mono-data text-primary px-2 py-0.5 bg-primary/10 rounded">142개 선택됨</span>
</div>
<div className="p-2 border-b border-border-subtle">
<div className="relative">
<span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-sm">filter_alt</span>
<input className="w-full bg-surface-container-lowest border border-border-subtle rounded px-3 py-1.5 pl-8 text-sm focus:outline-none focus:border-primary-container text-on-surface" placeholder="장비 필터링..." type="text"/>
</div>
</div>
<div className="flex-1 overflow-y-auto p-2">
{/* Tree View Mockup */}
<ul className="space-y-1 text-sm font-mono-data text-on-surface-variant">
<li>
<div className="flex items-center gap-2 p-1 hover:bg-surface-container-high rounded cursor-pointer">
<span className="material-symbols-outlined text-sm text-text-muted">keyboard_arrow_down</span>
<input defaultChecked="" className="rounded border-border-subtle bg-surface text-primary-container focus:ring-primary-container focus:ring-offset-surface" type="checkbox"/>
<span className="material-symbols-outlined text-sm text-secondary">domain</span>
<span>Sector Alpha (120)</span>
</div>
<ul className="pl-6 space-y-1 mt-1 border-l border-border-subtle ml-3">
<li className="flex items-center gap-2 p-1 hover:bg-surface-container-high rounded cursor-pointer bg-primary/5 border border-primary/20">
<input defaultChecked="" className="rounded border-border-subtle bg-surface text-primary-container focus:ring-primary-container focus:ring-offset-surface" type="checkbox"/>
<span className="material-symbols-outlined text-sm text-tertiary">videocam</span>
<span>Perimeter P-01 to P-50</span>
</li>
<li className="flex items-center gap-2 p-1 hover:bg-surface-container-high rounded cursor-pointer">
<input defaultChecked="" className="rounded border-border-subtle bg-surface text-primary-container focus:ring-primary-container focus:ring-offset-surface" type="checkbox"/>
<span className="material-symbols-outlined text-sm text-tertiary">videocam</span>
<span>Gate G-01 to G-20</span>
</li>
</ul>
</li>
</ul>
</div>
</div>
{/* Col 2: Policy Configuration (Bento Grid Style) */}
<div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 pb-20"> {/* pb-20 to clear fixed bottom bar */}
{/* Policy Source */}
<div className="col-span-2 bg-surface rounded-xl border border-border-subtle p-4 shadow-sm flex items-center justify-between">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded bg-surface-container-high border border-border-subtle flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-xl">content_copy</span>
</div>
<div>
<h3 className="text-title-sm font-title-sm text-on-surface">마스터 정책 소스</h3>
<p className="text-body-sm font-body-sm text-text-muted">템플릿 또는 기존 장비에서 설정을 복제합니다.</p>
</div>
</div>
<select className="bg-surface-container border border-border-subtle rounded px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container w-64">
<option>템플릿: 24/7 높은 보안</option>
<option>템플릿: 대역폭 절약</option>
<option>장비: Cam-Alpha-01 (마스터)</option>
</select>
</div>
{/* Security Settings */}
<div className="bg-surface rounded-xl border border-border-subtle p-4 shadow-sm">
<div className="flex items-center justify-between mb-4 pb-2 border-b border-border-subtle">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-warning text-sm">lock</span>
<h3 className="text-label-caps font-label-caps text-on-surface">보안 자격 인증</h3>
</div>
<label className="flex items-center gap-2 text-sm">
<input defaultChecked="" className="rounded border-border-subtle bg-surface text-primary-container focus:ring-primary-container" type="checkbox"/>
<span className="text-text-muted">재정의</span>
</label>
</div>
<div className="space-y-3">
<div>
<label className="block text-mono-data text-text-muted mb-1">관리자 비밀번호</label>
<input className="w-full bg-surface-container-lowest border border-border-subtle rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary-container text-on-surface font-mono" type="password" value="********"/>
</div>
<div>
<label className="block text-mono-data text-text-muted mb-1">802.1x 인증</label>
<select className="w-full bg-surface-container-lowest border border-border-subtle rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary-container text-on-surface">
<option>활성화 (EAP-TLS)</option>
<option>비활성화</option>
</select>
</div>
</div>
</div>
{/* Stream Profile */}
<div className="bg-surface rounded-xl border border-border-subtle p-4 shadow-sm relative overflow-hidden">
<div className="absolute top-0 right-0 w-16 h-16 bg-primary-container/10 blur-xl rounded-bl-full"></div>
<div className="flex items-center justify-between mb-4 pb-2 border-b border-border-subtle relative z-10">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-sm">movie</span>
<h3 className="text-label-caps font-label-caps text-on-surface">스트림 및 압축</h3>
</div>
<label className="flex items-center gap-2 text-sm">
<input defaultChecked="" className="rounded border-border-subtle bg-surface text-primary-container focus:ring-primary-container" type="checkbox"/>
<span className="text-text-muted">재정의</span>
</label>
</div>
<div className="space-y-3 relative z-10">
<div className="flex items-center justify-between bg-surface-container p-2 rounded border border-border-subtle">
<span className="text-sm font-medium">WiseStream III (AI)</span>
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked="" className="sr-only peer" type="checkbox" value=""/>
<div className="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div>
</label>
</div>
<div className="grid grid-cols-2 gap-2">
<div>
<label className="block text-mono-data text-text-muted mb-1">코덱</label>
<select className="w-full bg-surface-container-lowest border border-border-subtle rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary-container text-on-surface font-mono">
<option>H.265</option>
<option>H.264</option>
</select>
</div>
<div>
<label className="block text-mono-data text-text-muted mb-1">비트레이트 제어</label>
<select className="w-full bg-surface-container-lowest border border-border-subtle rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary-container text-on-surface font-mono">
<option>VBR (Target 4Mbps)</option>
<option>CBR</option>
</select>
</div>
</div>
</div>
</div>
</div>
</div>
{/* Fixed Bottom Deployment Status Bar */}
<div className="absolute bottom-0 left-0 w-full bg-surface-container-high border-t border-border-subtle p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.3)] z-20">
<div className="flex items-center justify-between mb-2">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary-container animate-pulse">sync</span>
<div>
<div className="text-sm font-semibold text-on-surface">배포 준비 상태</div>
<div className="text-mono-data text-text-muted">142개 장비 구성 푸시 대기 중. 예상 소요 시간: ~3분 45초</div>
</div>
</div>
<div className="text-right">
<div className="text-sm font-bold text-primary">0%</div>
</div>
</div>
<div className="w-full bg-surface-container-lowest rounded-full h-1.5 border border-border-subtle overflow-hidden">
<div className="bg-primary-container h-1.5 rounded-full" style={{ width: "0%" }}></div>
</div>
</div>
</main> </> );
};

import React from 'react'; export const CameraSetupConfig: React.FC = () => { return ( <>
<main className="flex-1 min-w-0 flex flex-col min-h-screen">
{/* Page Header */}
<div className="px-6 py-5 border-b border-border-subtle bg-surface flex justify-between items-end">
<div>
<div className="text-label-caps font-label-caps text-primary mb-1 flex items-center gap-2">
<span className="material-symbols-outlined text-xs">build</span> 설정 및 구성 </div>
<h1 className="text-[22px] font-headline-md text-on-surface whitespace-nowrap">카메라 자산 및 환경설정 관리 (Setup &amp; Config)</h1>
<p className="text-text-muted mt-1 text-body-sm font-body-sm">물리적 자산, 스트리밍 정책 및 AI 엣지 매개변수를 구성합니다.</p>
</div>
<div className="text-right">
<div className="text-mono-data font-mono-data text-text-muted">시스템 상태: <span className="text-tertiary">온라인</span></div>
</div>
</div>
{/* Configuration Grid */}
<div className="flex-1 p-6 overflow-y-auto">
<div className=" grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
{/* Security Authentication Section */}
<section className="bg-surface border border-border-subtle rounded-lg overflow-hidden flex flex-col">
<div className="bg-surface-container px-4 py-3 border-b border-border-subtle flex items-center gap-2">
<span className="material-symbols-outlined text-text-muted">admin_panel_settings</span>
<h3 className="text-title-sm font-title-sm text-text-primary">보안 및 인증</h3>
</div>
<div className="p-5 flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
<div className="col-span-1 md:col-span-2">
<label className="block text-label-caps font-label-caps text-text-muted mb-1">카메라 ID (논리적)</label>
<input className="w-full bg-surface-container border border-border-subtle rounded px-3 py-2 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none" type="text" value="CAM-EXT-NORTH-01"/>
</div>
<div>
<label className="block text-label-caps font-label-caps text-text-muted mb-1">IP 주소 (IPv4)</label>
<input className="w-full bg-surface-container border border-border-subtle rounded px-3 py-2 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none" type="text" value="192.168.10.155"/>
</div>
<div>
<label className="block text-label-caps font-label-caps text-text-muted mb-1">MAC 주소</label>
<input className="w-full bg-surface-container border border-border-subtle rounded px-3 py-2 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none" type="text" value="00:1A:2B:3C:4D:5E"/>
</div>
<div className="col-span-1 md:col-span-2 mt-2 pt-4 border-t border-border-subtle">
<h4 className="text-label-caps font-label-caps text-primary mb-3">디바이스 자격 증명</h4>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
<label className="block text-label-caps font-label-caps text-text-muted mb-1">관리자 ID</label>
<input className="w-full bg-surface-container border border-border-subtle rounded px-3 py-2 text-body-sm font-body-sm text-on-surface focus:border-primary-container outline-none" type="text" value="admin_sec"/>
</div>
<div>
<label className="block text-label-caps font-label-caps text-text-muted mb-1">관리자 비밀번호 (SHA-256)</label>
<input className="w-full bg-surface-container border border-border-subtle rounded px-3 py-2 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none" type="password" value="********"/>
</div>
</div>
</div>
</div>
</section>
{/* Streaming Policy Section */}
<section className="bg-surface border border-border-subtle rounded-lg overflow-hidden flex flex-col">
<div className="bg-surface-container px-4 py-3 border-b border-border-subtle flex items-center gap-2">
<span className="material-symbols-outlined text-text-muted">video_settings</span>
<h3 className="text-title-sm font-title-sm text-text-primary">스트리밍 정책</h3>
</div>
<div className="p-5 flex-1 flex flex-col gap-5">
<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
<div className="bg-surface-container-low border border-border-subtle p-3 rounded">
<h4 className="text-label-caps font-label-caps text-on-surface-variant mb-2">메인 스트림 (녹화)</h4>
<div className="space-y-3">
<div>
<label className="block text-mono-data font-mono-data text-text-muted mb-1">해상도</label>
<select className="w-full bg-surface border border-border-subtle rounded px-2 py-1 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none">
<option>4K (3840x2160)</option>
<option>QHD (2560x1440)</option>
<option selected="">FHD (1920x1080)</option>
</select>
</div>
<div>
<label className="block text-mono-data font-mono-data text-text-muted mb-1">프레임 속도</label>
<select className="w-full bg-surface border border-border-subtle rounded px-2 py-1 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none">
<option selected="">30 FPS</option>
<option>15 FPS</option>
</select>
</div>
</div>
</div>
<div className="bg-surface-container-low border border-border-subtle p-3 rounded">
<h4 className="text-label-caps font-label-caps text-on-surface-variant mb-2">서브 스트림 (분석)</h4>
<div className="space-y-3">
<div>
<label className="block text-mono-data font-mono-data text-text-muted mb-1">해상도</label>
<select className="w-full bg-surface border border-border-subtle rounded px-2 py-1 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none">
<option selected="">HD (1280x720)</option>
<option>VGA (640x480)</option>
</select>
</div>
<div>
<label className="block text-mono-data font-mono-data text-text-muted mb-1">프레임 속도</label>
<select className="w-full bg-surface border border-border-subtle rounded px-2 py-1 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none">
<option>30 FPS</option>
<option selected="">15 FPS</option>
<option>5 FPS</option>
</select>
</div>
</div>
</div>
</div>
<div className="flex items-center justify-between border-t border-border-subtle pt-4">
<div>
<h4 className="text-body-sm font-body-sm text-text-primary">WiseStream III 압축</h4>
<p className="text-mono-data font-mono-data text-text-muted">동적 AI 기반 대역폭 감소</p>
</div>
<label className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
<input defaultChecked="" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-surface-variant" id="toggle1" name="toggle" type="checkbox"/>
<label className="toggle-label block overflow-hidden h-5 rounded-full bg-surface-variant cursor-pointer" htmlFor="toggle1"></label>
</label>
</div>
<div className="flex items-center justify-between border-t border-border-subtle pt-4">
<div>
<h4 className="text-body-sm font-body-sm text-text-primary">ONVIF 프로필</h4>
<p className="text-mono-data font-mono-data text-text-muted">상호 운용성 표준</p>
</div>
<select className="bg-surface-container border border-border-subtle rounded px-3 py-1 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none">
<option selected="">Profile S / G / T</option>
<option>Profile S</option>
<option>Disabled</option>
</select>
</div>
</div>
</section>
{/* Peripheral Integration Section */}
<section className="bg-surface border border-border-subtle rounded-lg overflow-hidden flex flex-col">
<div className="bg-surface-container px-4 py-3 border-b border-border-subtle flex items-center gap-2">
<span className="material-symbols-outlined text-text-muted">cable</span>
<h3 className="text-title-sm font-title-sm text-text-primary">주변 장치 통합</h3>
</div>
<div className="p-5 flex-1 space-y-5">
<div>
<h4 className="text-label-caps font-label-caps text-on-surface-variant mb-2 border-b border-border-subtle pb-1">IP 오디오 스피커 바인딩</h4>
<div className="flex gap-2 items-end mt-3">
<div className="flex-1">
<label className="block text-mono-data font-mono-data text-text-muted mb-1">대상 IP / 식별자</label>
<input className="w-full bg-surface-container border border-border-subtle rounded px-3 py-2 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none" placeholder="e.g. 192.168.20.5" type="text" value="SPK-ZONE-A"/>
</div>
<button className="bg-surface-container-high border border-border-subtle px-3 py-2 rounded text-body-sm hover:bg-surface-variant transition-colors">링크 테스트</button>
</div>
<p className="text-mono-data font-mono-data text-text-muted mt-2">이 카메라의 구역에 TTS 및 알람 방송을 바인딩합니다.</p>
</div>
<div>
<h4 className="text-label-caps font-label-caps text-on-surface-variant mb-2 border-b border-border-subtle pb-1">알람 I/O 포트 매핑</h4>
<div className="grid grid-cols-2 gap-4 mt-3">
<div className="bg-surface-container-low border border-border-subtle p-2 rounded">
<label className="block text-mono-data font-mono-data text-text-muted mb-1">입력 1 (센서)</label>
<select className="w-full bg-surface border border-border-subtle rounded px-2 py-1 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none">
<option>도어 접점</option>
<option selected="">PIR 모션</option>
<option>없음</option>
</select>
</div>
<div className="bg-surface-container-low border border-border-subtle p-2 rounded">
<label className="block text-mono-data font-mono-data text-text-muted mb-1">출력 1 (릴레이)</label>
<select className="w-full bg-surface border border-border-subtle rounded px-2 py-1 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none">
<option selected="">스트로브 조명</option>
<option>게이트 열기</option>
<option>없음</option>
</select>
</div>
</div>
</div>
</div>
</section>
{/* AI Rules & Masking Section */}
<section className="bg-surface border border-border-subtle rounded-lg overflow-hidden flex flex-col">
<div className="bg-surface-container px-4 py-3 border-b border-border-subtle flex items-center gap-2">
<span className="material-symbols-outlined text-primary">psychology</span>
<h3 className="text-title-sm font-title-sm text-text-primary">AI 엣지 및 개인정보 보호 규칙</h3>
</div>
<div className="p-5 flex-1 space-y-4">
<div className="border border-border-subtle rounded p-3 bg-surface-container-low relative overflow-hidden">
<div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-surface-container to-transparent opacity-50"></div>
<div className="flex justify-between items-start mb-2">
<div>
<h4 className="text-body-sm font-body-sm text-text-primary">ROI (관심 영역) 마스킹</h4>
<p className="text-mono-data font-mono-data text-text-muted">AI 분석 영역을 제한할 좌표를 정의합니다.</p>
</div>
<button className="text-primary hover:text-primary-fixed flex items-center gap-1 text-mono-data"><span className="material-symbols-outlined text-sm">edit</span> 편집</button>
</div>
<div className="text-mono-data font-mono-data text-tertiary bg-surface p-2 border border-border-subtle rounded font-mono text-xs"> ZONE_01: [450, 120, 890, 600]<br/> ZONE_02: [120, 600, 1920, 1080] </div>
</div>
<div className="flex items-center justify-between border-t border-border-subtle pt-4">
<div>
<h4 className="text-body-sm font-body-sm text-text-primary">동적 프라이버시 블러링</h4>
<p className="text-mono-data font-mono-data text-text-muted">라이브/재생 시 얼굴 및 번호판 자동 난독화.</p>
</div>
<label className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
<input defaultChecked="" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-surface-variant" id="toggle2" name="toggle" type="checkbox"/>
<label className="toggle-label block overflow-hidden h-5 rounded-full bg-surface-variant cursor-pointer" htmlFor="toggle2"></label>
</label>
</div>
<div className="flex items-center justify-between border-t border-border-subtle pt-4">
<div>
<h4 className="text-body-sm font-body-sm text-text-primary">AES-256 비디오 내보내기 암호화</h4>
<p className="text-mono-data font-mono-data text-warning flex items-center gap-1"><span className="material-symbols-outlined text-xs">warning</span> 규정 준수 의무</p>
</div>
<label className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
<input defaultChecked="" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-surface-variant" id="toggle3" name="toggle" type="checkbox"/>
<label className="toggle-label block overflow-hidden h-5 rounded-full bg-surface-variant cursor-pointer" htmlFor="toggle3"></label>
</label>
</div>
</div>
</section>
</div>
</div>
{/* Sticky Footer Action Bar */}
<div className="fixed bottom-0 left-[300px] right-0 bg-surface border-t border-border-subtle p-4 flex justify-between items-center z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.5)]">
<button className="bg-surface-container border border-border-subtle text-text-primary px-4 py-2 rounded text-body-sm font-body-sm hover:bg-surface-container-highest transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-sm">search</span> 일괄 디바이스 검색 </button>
<div className="flex gap-3">
<button className="bg-surface-container border border-border-subtle text-text-primary px-4 py-2 rounded text-body-sm font-body-sm hover:bg-surface-container-highest transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-sm">tv</span> 라이브 뷰로 돌아가기 </button>
<button className="bg-primary-container text-on-primary-container px-6 py-2 rounded text-body-sm font-body-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_8px_rgba(124,58,237,0.4)]">
<span className="material-symbols-outlined text-sm">save</span> 구성 저장 </button>
</div>
</div>
</main> </> );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCameraStore } from '../store/useCameraStore';

export const CameraSetupConfig: React.FC = () => {
  const navigate = useNavigate();
  const { addCamera, groups } = useCameraStore();
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    id: `CAM-REAL-${Math.floor(Date.now() / 1000)}`,
    name: '신규 카메라',
    ipAddress: '192.168.10.155',
    streamProfile: 'profile2',
    macAddress: '00:1A:2B:3C:4D:5E',
    adminId: 'admin_sec',
    adminPassword: 'password123@',
    groupId: 'none',
    vlmEnabled: true,
    onvifProfile: 'Profile S / G / T',
    mainResolution: 'FHD (1920x1080)',
    mainFps: '30 FPS',
    subResolution: 'HD (1280x720)',
    subFps: '15 FPS',
    wiseStreamEnabled: true,
    relayOutput: '스트로브 조명',
    privacyBlurEnabled: true,
    aesEncryptionEnabled: true,
  });

  const generatedRtspUrl = `rtsp://${formData.adminId}:${encodeURIComponent(formData.adminPassword)}@${formData.ipAddress}:554/${formData.streamProfile}`;

  const handleSave = async () => {
    try {
      await addCamera({
        id: formData.id,
        name: formData.name,
        ipAddress: formData.ipAddress,
        rtspUrl: generatedRtspUrl,
        groupId: formData.groupId === 'none' ? null : formData.groupId,
        vlmEnabled: formData.vlmEnabled
      });
      alert('카메라 설정이 저장되었습니다.');
      navigate('/camera-list');
    } catch (e: any) {
      console.error(e);
      alert('저장 실패! 서버 오류 메시지: ' + (e.response?.data?.detail || e.message));
    }
  };

  const handleBatchScan = () => {
    setScanMessage("로컬 네트워크 상의 IP 카메라를 스캔하고 있습니다. 잠시만 기다려주세요...");
    setTimeout(() => {
      setScanMessage(null);
    }, 5000);
  };

  return ( <>
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
<div className=" grid grid-cols-1 xl:grid-cols-2 gap-6 pb-32">
{/* Security Authentication Section */}
<section className="bg-surface border border-border-subtle rounded-lg overflow-hidden flex flex-col">
<div className="bg-surface-container px-4 py-3 border-b border-border-subtle flex items-center gap-2">
<span className="material-symbols-outlined text-text-muted">admin_panel_settings</span>
<h3 className="text-title-sm font-title-sm text-text-primary">보안 및 인증</h3>
</div>
<div className="p-5 flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
<div className="col-span-1 md:col-span-2">
<label className="block text-label-caps font-label-caps text-text-muted mb-1">카메라 ID (논리적)</label>
<input className="w-full bg-surface-container border border-border-subtle rounded px-3 py-2 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none" type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})}/>
</div>
<div className="col-span-1 md:col-span-2">
<label className="block text-label-caps font-label-caps text-text-muted mb-1">카메라 이름</label>
<input className="w-full bg-surface-container border border-border-subtle rounded px-3 py-2 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
</div>
<div>
<label className="block text-label-caps font-label-caps text-text-muted mb-1">IP 주소 (IPv4)</label>
<input className="w-full bg-surface-container border border-border-subtle rounded px-3 py-2 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none" type="text" value={formData.ipAddress} onChange={e => setFormData({...formData, ipAddress: e.target.value})}/>
</div>
<div>
<label className="block text-label-caps font-label-caps text-text-muted mb-1">스트림 프로필</label>
<select className="w-full bg-surface-container border border-border-subtle rounded px-3 py-2 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none" value={formData.streamProfile} onChange={e => setFormData({...formData, streamProfile: e.target.value})}>
<option value="profile1">profile1 (고해상도)</option>
<option value="profile2">profile2 (저해상도)</option>
<option value="stream1">stream1</option>
<option value="stream2">stream2</option>
</select>
</div>
<div>
<label className="block text-label-caps font-label-caps text-text-muted mb-1">MAC 주소</label>
<input className="w-full bg-surface-container border border-border-subtle rounded px-3 py-2 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none" type="text" value={formData.macAddress} onChange={e => setFormData({...formData, macAddress: e.target.value})}/>
</div>
<div className="col-span-1 md:col-span-2 mt-2 pt-4 border-t border-border-subtle">
<h4 className="text-label-caps font-label-caps text-primary mb-3">디바이스 자격 증명</h4>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
<label className="block text-label-caps font-label-caps text-text-muted mb-1">관리자 ID</label>
<input className="w-full bg-surface-container border border-border-subtle rounded px-3 py-2 text-body-sm font-body-sm text-on-surface focus:border-primary-container outline-none" type="text" value={formData.adminId} onChange={e => setFormData({...formData, adminId: e.target.value})}/>
</div>
<div>
<label className="block text-label-caps font-label-caps text-text-muted mb-1">관리자 비밀번호 (SHA-256)</label>
<input className="w-full bg-surface-container border border-border-subtle rounded px-3 py-2 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none" type="password" value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})}/>
</div>
</div>
<div className="mt-4 p-3 bg-surface-container-low border border-border-subtle rounded">
<label className="block text-label-caps font-label-caps text-text-muted mb-1">자동 생성된 RTSP 주소</label>
<div className="text-mono-data text-tertiary break-all">{generatedRtspUrl}</div>
<p className="text-[11px] text-text-muted mt-1">※ 비밀번호의 특수문자는 %인코딩 처리되어 안전하게 적용됩니다.</p>
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
<select value={formData.mainResolution} onChange={e => setFormData({...formData, mainResolution: e.target.value})} className="w-full bg-surface border border-border-subtle rounded px-2 py-1 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none">
<option value="4K (3840x2160)">4K (3840x2160)</option>
<option value="QHD (2560x1440)">QHD (2560x1440)</option>
<option value="FHD (1920x1080)">FHD (1920x1080)</option>
<option value="HD (1280x720)">HD (1280x720)</option>
<option value="SD (704x480)">SD (704x480)</option>
<option value="VGA (640x480)">VGA (640x480)</option>
</select>
</div>
<div>
<label className="block text-mono-data font-mono-data text-text-muted mb-1">프레임 속도</label>
<select value={formData.mainFps} onChange={e => setFormData({...formData, mainFps: e.target.value})} className="w-full bg-surface border border-border-subtle rounded px-2 py-1 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none">
<option value="30 FPS">30 FPS</option>
<option value="15 FPS">15 FPS</option>
</select>
</div>
</div>
</div>
<div className="bg-surface-container-low border border-border-subtle p-3 rounded">
<h4 className="text-label-caps font-label-caps text-on-surface-variant mb-2">서브 스트림 (분석)</h4>
<div className="space-y-3">
<div>
<label className="block text-mono-data font-mono-data text-text-muted mb-1">해상도</label>
<select value={formData.subResolution} onChange={e => setFormData({...formData, subResolution: e.target.value})} className="w-full bg-surface border border-border-subtle rounded px-2 py-1 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none">
<option value="HD (1280x720)">HD (1280x720)</option>
<option value="SD (704x480)">SD (704x480)</option>
<option value="VGA (640x480)">VGA (640x480)</option>
</select>
</div>
<div>
<label className="block text-mono-data font-mono-data text-text-muted mb-1">프레임 속도</label>
<select value={formData.subFps} onChange={e => setFormData({...formData, subFps: e.target.value})} className="w-full bg-surface border border-border-subtle rounded px-2 py-1 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none">
<option value="30 FPS">30 FPS</option>
<option value="15 FPS">15 FPS</option>
<option value="5 FPS">5 FPS</option>
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
<button type="button" onClick={() => setFormData({...formData, wiseStreamEnabled: !formData.wiseStreamEnabled})} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.wiseStreamEnabled ? 'bg-primary' : 'bg-surface-variant'}`}>
<span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.wiseStreamEnabled ? 'translate-x-5' : 'translate-x-0'}`}/>
</button>
</div>
<div className="flex items-center justify-between border-t border-border-subtle pt-4">
<div>
<h4 className="text-body-sm font-body-sm text-text-primary">ONVIF 프로필</h4>
<p className="text-mono-data font-mono-data text-text-muted">상호 운용성 표준</p>
</div>
<select value={formData.onvifProfile} onChange={e => setFormData({...formData, onvifProfile: e.target.value})} className="bg-surface-container border border-border-subtle rounded px-3 py-1 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none">
<option value="Profile S / G / T">Profile S / G / T</option>
<option value="Profile S">Profile S</option>
<option value="Disabled">Disabled</option>
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
<select value={formData.relayOutput} onChange={e => setFormData({...formData, relayOutput: e.target.value})} className="w-full bg-surface border border-border-subtle rounded px-2 py-1 text-mono-data font-mono-data text-on-surface focus:border-primary-container outline-none">
<option value="스트로브 조명">스트로브 조명</option>
<option value="게이트 열기">게이트 열기</option>
<option value="없음">없음</option>
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
<div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-4">
<div>
<h4 className="text-body-sm font-body-sm text-text-primary">VLM 활성 (Edge AI 분석)</h4>
<p className="text-mono-data font-mono-data text-text-muted">실시간 YOLO 파이프라인 및 VLM 이벤트 연동 활성화</p>
</div>
<button type="button" onClick={() => setFormData({...formData, vlmEnabled: !formData.vlmEnabled})} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.vlmEnabled ? 'bg-primary' : 'bg-surface-variant'}`}>
<span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.vlmEnabled ? 'translate-x-5' : 'translate-x-0'}`}/>
</button>
</div>
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
<button type="button" onClick={() => setFormData({...formData, privacyBlurEnabled: !formData.privacyBlurEnabled})} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.privacyBlurEnabled ? 'bg-primary' : 'bg-surface-variant'}`}>
<span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.privacyBlurEnabled ? 'translate-x-5' : 'translate-x-0'}`}/>
</button>
</div>
<div className="flex items-center justify-between border-t border-border-subtle pt-4">
<div>
<h4 className="text-body-sm font-body-sm text-text-primary">AES-256 비디오 내보내기 암호화</h4>
<p className="text-mono-data font-mono-data text-warning flex items-center gap-1"><span className="material-symbols-outlined text-xs">warning</span> 규정 준수 의무</p>
</div>
<button type="button" onClick={() => setFormData({...formData, aesEncryptionEnabled: !formData.aesEncryptionEnabled})} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.aesEncryptionEnabled ? 'bg-primary' : 'bg-surface-variant'}`}>
<span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.aesEncryptionEnabled ? 'translate-x-5' : 'translate-x-0'}`}/>
</button>
</div>
</div>
</section>
</div>
</div>
{/* Sticky Footer Action Bar */}
<div className="fixed bottom-0 left-[300px] right-0 bg-surface border-t border-border-subtle p-4 flex justify-between items-center z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.5)]">
<button onClick={handleBatchScan} className="bg-surface-container border border-border-subtle text-text-primary px-4 py-2 rounded text-body-sm font-body-sm hover:bg-surface-container-highest transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-sm">search</span> 일괄 디바이스 검색 </button>
<div className="flex gap-3">
<button onClick={() => navigate('/monitor-a')} className="bg-surface-container border border-border-subtle text-text-primary px-4 py-2 rounded text-body-sm font-body-sm hover:bg-surface-container-highest transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-sm">tv</span> 라이브 뷰로 돌아가기 </button>
<button onClick={handleSave} className="bg-primary-container text-on-primary-container px-6 py-2 rounded text-body-sm font-body-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_8px_rgba(124,58,237,0.4)]">
<span className="material-symbols-outlined text-sm">save</span> 구성 저장 </button>
</div>
</div>

{scanMessage && (
  <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-surface-container-highest border border-primary text-on-surface px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-3">
    <span className="material-symbols-outlined text-primary animate-spin">sync</span>
    <span className="text-body-sm font-body-sm">{scanMessage}</span>
  </div>
)}

</main> </> );
};

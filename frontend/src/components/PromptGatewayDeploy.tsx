import React, { useState } from 'react';
import { API } from '../api/client';

const PROMPTS = [
  {
    template_id: "vlm_pt_094",
    name: "Perimeter Intrusion (Night)",
    version: "2.4",
    engine: "ewVLM-Turbo-v2",
    system_prompt: "You are a specialized security visual language model operating on a high-latency edge node.",
    user_prompt_template: "Analyze the current frame from {{camera_id}}. Identify human figures traversing fence line {{sector}}. Ignore small wildlife under 20kg. Focus on thermal signatures. Describe direction of movement.",
    parameters: { temperature: 0.1, max_tokens: 128, confidence_threshold: 0.85 },
    action_triggers: [ { type: "webhook", url: "internal://alert/high" }, { type: "ptz_track", target: "detected_entity" } ]
  },
  {
    template_id: "vlm_pt_102",
    name: "Crowd Density Alert",
    version: "1.1",
    engine: "ewVLM-Base-v1",
    system_prompt: "You are an AI for safety and crowd monitoring.",
    user_prompt_template: "Estimate the number of people in the main hall. Alert if density exceeds 4 persons per square meter for over 30 seconds.",
    parameters: { temperature: 0.2, max_tokens: 64, confidence_threshold: 0.80 },
    action_triggers: [ { type: "webhook", url: "internal://alert/crowd" } ]
  },
  {
    template_id: "vlm_pt_105",
    name: "Vehicle Loitering",
    version: "3.0",
    engine: "ewVLM-Turbo-v2",
    system_prompt: "You are a traffic monitoring AI.",
    user_prompt_template: "Detect vehicles stopped in drop-off zone B for more than 5 minutes. Extract license plate if visible.",
    parameters: { temperature: 0.1, max_tokens: 128, confidence_threshold: 0.90 },
    action_triggers: [ { type: "log", level: "warning" } ]
  }
];

export const PromptGatewayDeploy: React.FC = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setToastMessage('⏳ 엣지 노드에 프롬프트를 배포 중입니다...');
    try {
      const res = await API.deployPrompt('all-edges', PROMPTS[selectedPromptIndex]);
      if (res.status === 'SUCCESS') {
        setToastMessage(`✅ 배포 성공: ${res.message}`);
      }
    } catch (err) {
      console.error(err);
      setToastMessage('❌ 배포 중 오류가 발생했습니다.');
    } finally {
      setIsDeploying(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return ( <>
<main className="flex-1 p-container-padding bg-[#070A13] overflow-y-auto relative h-full">
{toastMessage && (
  <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-primary-container border border-primary text-white px-6 py-3 rounded-lg shadow-2xl font-body-base text-body-base animate-pulse">
    {toastMessage}
  </div>
)}
  <div className="flex justify-between items-end mb-6">
  <div>
  <h2 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
  <span className="material-symbols-outlined text-primary">hub</span> 프롬프트 게이트웨이 및 엣지 장치 일괄 배포 콘솔 </h2>
  <p className="text-body-base font-body-base text-text-muted mt-1">VLM 추론 템플릿을 패키징하여 원격 에지 Gen AI 박스에 배포합니다.</p>
  </div>
  <div className="flex gap-2">
  <button className="px-4 py-2 border border-border-subtle text-on-surface rounded hover:bg-surface-container-highest transition-colors font-body-sm text-body-sm flex items-center gap-2">
  <span className="material-symbols-outlined">sync</span> 장치 동기화 </button>
  <button 
    className={`px-4 py-2 rounded text-title-sm font-title-sm flex items-center gap-2 shadow-lg transition-colors ${isDeploying ? 'bg-surface-container border border-border-subtle text-text-muted cursor-not-allowed' : 'bg-primary-container text-on-primary-container hover:bg-inverse-primary glow-active'}`}
    onClick={handleDeploy}
    disabled={isDeploying}
  >
  <span className={`material-symbols-outlined ${isDeploying ? 'animate-bounce' : ''}`}>cloud_upload</span> 
  {isDeploying ? '배포 중...' : '배포 실행'} 
  </button>
  </div>
  </div>
  {/* Bento Grid Layout */}
<div className="grid grid-cols-12 gap-gutter h-[calc(100vh-140px)]">
{/* Prompt Library (Left) */}
<div className="col-span-4 glass-panel rounded-lg flex flex-col overflow-hidden">
<div className="p-3 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
<h3 className="text-label-caps font-label-caps text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">library_books</span> 프롬프트 라이브러리 </h3>
<button className="text-primary hover:text-inverse-primary"><span className="material-symbols-outlined">add_circle</span></button>
</div>
<div className="p-3 bg-surface-container-lowest">
<input className="w-full bg-surface-container-high border-border-subtle text-text-muted text-body-sm font-body-sm rounded px-3 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary" placeholder="프롬프트 필터링..." type="text"/>
</div>
<div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
{/* Prompt Card 1 */}
<div onClick={() => setSelectedPromptIndex(0)} className={`border ${selectedPromptIndex === 0 ? 'border-primary bg-surface-container-high glow-active' : 'border-border-subtle bg-surface-container hover:border-outline-variant transition-colors'} rounded p-3 cursor-pointer relative`}>
<div className="absolute top-3 right-3 flex items-center gap-1">
<span className={`w-2 h-2 rounded-full ${selectedPromptIndex === 0 ? 'bg-tertiary' : 'bg-text-muted'}`}></span>
<span className={`text-mono-data font-mono-data ${selectedPromptIndex === 0 ? 'text-tertiary' : 'text-text-muted'} text-[10px]`}>v2.4</span>
</div>
<h4 className="text-title-sm font-title-sm text-on-surface mb-1">외곽 침입 (야간)</h4>
<p className="text-body-sm font-body-sm text-text-muted line-clamp-2 mb-2">섹터 4 펜스 라인을 가로지르는 인물을 식별합니다. 20kg 미만의 소형 야생 동물은 무시합니다. 열화상 신호에 집중합니다.</p>
<div className="flex gap-2">
<span className="px-2 py-0.5 bg-surface-container-lowest border border-border-subtle rounded text-mono-data font-mono-data text-text-muted text-[10px]">보안</span>
<span className="px-2 py-0.5 bg-surface-container-lowest border border-border-subtle rounded text-mono-data font-mono-data text-text-muted text-[10px]">열화상</span>
</div>
</div>
{/* Prompt Card 2 */}
<div onClick={() => setSelectedPromptIndex(1)} className={`border ${selectedPromptIndex === 1 ? 'border-primary bg-surface-container-high glow-active' : 'border-border-subtle bg-surface-container hover:border-outline-variant transition-colors'} rounded p-3 cursor-pointer relative`}>
<div className="absolute top-3 right-3 flex items-center gap-1">
<span className={`w-2 h-2 rounded-full ${selectedPromptIndex === 1 ? 'bg-tertiary' : 'bg-text-muted'}`}></span>
<span className={`text-mono-data font-mono-data ${selectedPromptIndex === 1 ? 'text-tertiary' : 'text-text-muted'} text-[10px]`}>v1.1</span>
</div>
<h4 className="text-title-sm font-title-sm text-on-surface mb-1">군중 밀집 알림</h4>
<p className="text-body-sm font-body-sm text-text-muted line-clamp-2 mb-2">메인 홀의 대략적인 인원수를 계산합니다. 30초 이상 제곱미터당 4명을 초과할 경우 알림을 발생시킵니다.</p>
<div className="flex gap-2">
<span className="px-2 py-0.5 bg-surface-container-lowest border border-border-subtle rounded text-mono-data font-mono-data text-text-muted text-[10px]">안전</span>
</div>
</div>
{/* Prompt Card 3 */}
<div onClick={() => setSelectedPromptIndex(2)} className={`border ${selectedPromptIndex === 2 ? 'border-primary bg-surface-container-high glow-active' : 'border-border-subtle bg-surface-container hover:border-outline-variant transition-colors'} rounded p-3 cursor-pointer relative`}>
<div className="absolute top-3 right-3 flex items-center gap-1">
<span className={`w-2 h-2 rounded-full ${selectedPromptIndex === 2 ? 'bg-tertiary' : 'bg-text-muted'}`}></span>
<span className={`text-mono-data font-mono-data ${selectedPromptIndex === 2 ? 'text-tertiary' : 'text-text-muted'} text-[10px]`}>v3.0</span>
</div>
<h4 className="text-title-sm font-title-sm text-on-surface mb-1">차량 배회</h4>
<p className="text-body-sm font-body-sm text-text-muted line-clamp-2 mb-2">하차 구역 B에서 5분 이상 정차 중인 차량을 감지합니다. 번호판이 보이는 경우 추출합니다.</p>
<div className="flex gap-2">
<span className="px-2 py-0.5 bg-surface-container-lowest border border-border-subtle rounded text-mono-data font-mono-data text-text-muted text-[10px]">교통</span>
</div>
</div>
</div>
</div>
{/* Center/Right Columns */}
<div className="col-span-8 flex flex-col gap-gutter">
{/* Editor & Config (Top Right) */}
<div className="glass-panel rounded-lg flex-1 flex flex-col overflow-hidden relative">
<div className="p-3 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
<h3 className="text-label-caps font-label-caps text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">code_blocks</span> 페이로드 설정 </h3>
<div className="flex gap-2">
<span className="px-2 py-1 bg-surface-container-highest border border-border-subtle rounded text-mono-data font-mono-data text-text-muted">JSON</span>
</div>
</div>
<div className="p-4 flex-1 bg-surface-container-lowest overflow-y-auto">
<div className="bg-surface-dim p-4 rounded border border-border-subtle font-mono-data text-mono-data text-text-primary leading-relaxed h-full overflow-y-auto">
<pre><code>{JSON.stringify(PROMPTS[selectedPromptIndex], null, 2)}</code></pre>
</div>
</div>
</div>
{/* Target Devices & Deployment Status (Bottom Right) */}
<div className="h-64 flex gap-gutter">
{/* Devices */}
<div className="w-1/2 glass-panel rounded-lg flex flex-col overflow-hidden">
<div className="p-3 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
<h3 className="text-label-caps font-label-caps text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">router</span> 에지 Gen AI 박스 </h3>
<span className="text-mono-data font-mono-data text-text-muted">3개 선택됨</span>
</div>
<div className="flex-1 overflow-y-auto">
<table className="w-full text-left border-collapse">
<thead className="bg-surface-container-lowest text-mono-data font-mono-data text-text-muted sticky top-0">
<tr>
<th className="p-2 border-b border-border-subtle w-8"><input defaultChecked className="rounded border-border-subtle bg-surface-container text-primary focus:ring-primary focus:ring-offset-surface" type="checkbox"/></th>
<th className="p-2 border-b border-border-subtle">노드 ID</th>
<th className="p-2 border-b border-border-subtle">위치</th>
<th className="p-2 border-b border-border-subtle">상태</th>
</tr>
</thead>
<tbody className="text-body-sm font-body-sm">
<tr className="hover:bg-surface-container-highest transition-colors border-b border-border-subtle bg-surface-container-high">
<td className="p-2"><input defaultChecked className="rounded border-border-subtle bg-surface-container text-primary focus:ring-primary focus:ring-offset-surface" type="checkbox"/></td>
<td className="p-2 font-mono-data text-mono-data text-primary">EDGE-NRT-01</td>
<td className="p-2 text-text-muted">북쪽 펜스</td>
<td className="p-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary led-active"></span> <span className="text-mono-data font-mono-data">온라인</span></td>
</tr>
<tr className="hover:bg-surface-container-highest transition-colors border-b border-border-subtle bg-surface-container-high">
<td className="p-2"><input defaultChecked className="rounded border-border-subtle bg-surface-container text-primary focus:ring-primary focus:ring-offset-surface" type="checkbox"/></td>
<td className="p-2 font-mono-data text-mono-data text-primary">EDGE-NRT-02</td>
<td className="p-2 text-text-muted">동쪽 게이트</td>
<td className="p-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary led-active"></span> <span className="text-mono-data font-mono-data">온라인</span></td>
</tr>
<tr className="hover:bg-surface-container-highest transition-colors border-b border-border-subtle">
<td className="p-2"><input className="rounded border-border-subtle bg-surface-container text-primary focus:ring-primary focus:ring-offset-surface" type="checkbox"/></td>
<td className="p-2 font-mono-data text-mono-data text-text-muted">EDGE-STH-01</td>
<td className="p-2 text-text-muted">남쪽 도크</td>
<td className="p-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning"></span> <span className="text-mono-data font-mono-data text-text-muted">동기화 중</span></td>
</tr>
<tr className="hover:bg-surface-container-highest transition-colors">
<td className="p-2"><input defaultChecked className="rounded border-border-subtle bg-surface-container text-primary focus:ring-primary focus:ring-offset-surface" type="checkbox"/></td>
<td className="p-2 font-mono-data text-mono-data text-primary">EDGE-WST-05</td>
<td className="p-2 text-text-muted">서쪽 경계</td>
<td className="p-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary led-active"></span> <span className="text-mono-data font-mono-data">온라인</span></td>
</tr>
</tbody>
</table>
</div>
</div>
{/* Simulation / Status */}
<div className="w-1/2 glass-panel rounded-lg flex flex-col overflow-hidden">
<div className="p-3 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
<h3 className="text-label-caps font-label-caps text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">terminal</span> 배포 터미널 </h3>
<span className="text-mono-data font-mono-data text-tertiary flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">check_circle</span> 준비 완료</span>
</div>
<div className="flex-1 bg-[#0b0e17] p-3 font-mono-data text-mono-data overflow-y-auto flex flex-col gap-1">
<div className="text-text-muted">[14:32:01] 페이로드 발송을 위한 시스템 준비 완료.</div>
<div className="text-text-muted">[14:32:05] 프롬프트 템플릿 'vlm_pt_094' (v2.4) 검증 중...</div>
<div className="text-tertiary">[14:32:06] 검증 성공. 구문 이상 없음.</div>
<div className="text-text-muted">[14:32:06] 선택한 에지 노드와의 보안 연결 설정 중...</div>
<div className="text-primary">[14:32:07] 배포 실행을 위한 사용자 확인 대기 중.</div>
<div className="mt-auto flex items-center gap-2 pt-2 border-t border-border-subtle">
<span className="text-primary animate-pulse">&gt;</span>
<span className="text-text-muted">_</span>
</div>
</div>
</div>
</div>
</div>
</div>
</main> </> );
};

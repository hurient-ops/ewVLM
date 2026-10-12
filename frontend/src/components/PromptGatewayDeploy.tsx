import React, { useState, useMemo } from 'react';
import { API } from '../api/client';

export interface VlmPromptTemplate {
  template_id: string;
  name: string;
  korean_title: string;
  category: '보안' | '안전' | '방재' | '교통' | '산업안전';
  version: string;
  engine: string;
  tags: string[];
  description: string;
  system_prompt: string;
  user_prompt_template: string;
  parameters: { temperature: number; max_tokens: number; confidence_threshold: number };
  action_triggers: Array<{ type: string; url?: string; target?: string; zone?: string; level?: string }>;
}

const PROMPTS: VlmPromptTemplate[] = [
  {
    template_id: "vlm_pt_094",
    name: "Perimeter Intrusion (Night)",
    korean_title: "외곽 침입 및 월담 감지 (야간 보안)",
    category: "보안",
    version: "2.4",
    engine: "ewVLM-Turbo-v2 / Qwen2-VL",
    tags: ["보안", "야간 경계", "월담", "침입"],
    description: "섹터 4 펜스 라인을 가로지르는 인물을 식별합니다. 20kg 미만의 소형 야생 동물은 무시하고 열화상 신호 및 이동 궤적을 추적합니다.",
    system_prompt: "You are a specialized security visual language model operating on a high-latency edge node.",
    user_prompt_template: "Analyze the current frame from {{camera_id}}. Check if any human is genuinely climbing, scaling, or jumping over the fence line {{sector}}. If the person is simply walking normally on the road or sidewalk without physically scaling the fence, you MUST classify as 'safe'.",
    parameters: { temperature: 0.1, max_tokens: 128, confidence_threshold: 0.85 },
    action_triggers: [ { type: "webhook", url: "internal://alert/high" }, { type: "ptz_track", target: "detected_entity" } ]
  },
  {
    template_id: "vlm_pt_102",
    name: "Crowd Density Alert",
    korean_title: "군중 과밀집 및 병목 압사 위험 경보",
    category: "안전",
    version: "1.2",
    engine: "ewVLM-Base-v1 / Qwen2-VL",
    tags: ["안전", "인파 관리", "밀집", "공공안전"],
    description: "메인 광장 및 역사 통로의 단위 면적당 인원 밀도를 산출합니다. 30초 이상 1㎡당 4명 초과 시 위험 알림 및 대피 경로를 안내합니다.",
    system_prompt: "You are an AI for safety and crowd monitoring in high-density urban and transit facilities.",
    user_prompt_template: "Estimate the density and movement flow of people in {{camera_id}} {{sector}}. Alert if congestion exceeds 4 persons per square meter or if abnormal stampede/bottleneck flow is observed for over 30 seconds.",
    parameters: { temperature: 0.15, max_tokens: 128, confidence_threshold: 0.80 },
    action_triggers: [ { type: "webhook", url: "internal://alert/crowd" }, { type: "broadcast", zone: "{{sector}}" } ]
  },
  {
    template_id: "vlm_pt_105",
    name: "Vehicle Loitering",
    korean_title: "차량 장기 배회 및 비상구역 불법 주정차",
    category: "교통",
    version: "3.0",
    engine: "ewVLM-Turbo-v2 / Qwen2-VL",
    tags: ["교통", "시설 관리", "불법 주차", "배회"],
    description: "소방 비상 진출입로 및 통제 구역에 5분 이상 장기 정차 중인 차량을 감지하고 번호판 및 차종 특징을 식별합니다.",
    system_prompt: "You are a traffic and facility security monitoring AI specialized in restricted zone regulation.",
    user_prompt_template: "Detect vehicles stopped in restricted/drop-off zone {{sector}} on {{camera_id}} for prolonged duration. Check if hazardous vehicle loitering or blocking emergency exit lanes occurs.",
    parameters: { temperature: 0.1, max_tokens: 128, confidence_threshold: 0.90 },
    action_triggers: [ { type: "log", level: "warning" }, { type: "ptz_track", target: "vehicle" } ]
  },
  {
    template_id: "vlm_pt_110",
    name: "Worker Fall & Incapacitation",
    korean_title: "작업자 실신 및 급작 낙상(쓰러짐) 감지",
    category: "산업안전",
    version: "2.0",
    engine: "ewVLM-Turbo-v2 / Qwen2-VL",
    tags: ["산업안전", "응급 구호", "낙상", "골든타임"],
    description: "작업자가 쓰러져 30초 이상 움직임이 없는 응급 상황을 실시간 식별합니다. 단순 휴식과 의식 상실을 구분하여 의료진을 비상 호출합니다.",
    system_prompt: "You are an emergency industrial safety AI specialized in detecting human falls, collapse, and incapacitation.",
    user_prompt_template: "Examine {{camera_id}} {{sector}}. Detect whether any person has fallen, collapsed, or remained motionless on the ground. Distinguish between intentional resting/working posture versus medical emergency or accidental fall.",
    parameters: { temperature: 0.1, max_tokens: 128, confidence_threshold: 0.88 },
    action_triggers: [ { type: "webhook", url: "internal://alert/emergency" }, { type: "sms", target: "medical_team" } ]
  },
  {
    template_id: "vlm_pt_115",
    name: "Early Fire & Smoke Detection",
    korean_title: "화재 초기 전조 및 연기·불꽃 감지",
    category: "방재",
    version: "2.1",
    engine: "ewVLM-Turbo-v2 / Qwen2-VL",
    tags: ["방재", "화재 안전", "연기 감지", "불꽃"],
    description: "상승하는 연기 기류와 미세한 불꽃 반사광을 조기 포착합니다. 분진이나 수증기 오탐을 배제하고 즉시 소방 알림 및 환기 차단 조치를 권고합니다.",
    system_prompt: "You are an advanced thermal and visual fire safety AI specialized in early smoke inception and open flame detection.",
    user_prompt_template: "Inspect {{camera_id}} {{sector}} for visible smoke plumes, upward convection currents, glowing embers, or active flame reflection. Reject dust clouds, steam, or fog.",
    parameters: { temperature: 0.05, max_tokens: 128, confidence_threshold: 0.92 },
    action_triggers: [ { type: "webhook", url: "internal://alert/fire" }, { type: "broadcast", zone: "facility_all" } ]
  },
  {
    template_id: "vlm_pt_120",
    name: "PPE Compliance Violation",
    korean_title: "산업 안전보호구(안전모·조끼) 미착용 식별",
    category: "산업안전",
    version: "1.5",
    engine: "ewVLM-Base-v1 / Qwen2-VL",
    tags: ["산업안전", "중대재해", "안전모", "보호구"],
    description: "위험 작업 구역 진입 인원의 안전모(헬멧) 및 고시인성 안전조끼 미착용을 적발하여 안전관리자 통보 및 현장 음성 경고 방송을 송출합니다.",
    system_prompt: "You are a regulatory compliance AI enforcing Personal Protective Equipment (PPE) standards in high-risk zones.",
    user_prompt_template: "Verify if workers in {{camera_id}} {{sector}} are properly wearing required safety gear: hard hat (helmet) and high-visibility safety vest. Identify unauthorized entry without protective equipment.",
    parameters: { temperature: 0.15, max_tokens: 128, confidence_threshold: 0.85 },
    action_triggers: [ { type: "log", level: "warning" }, { type: "audio_warning", target: "PPE_REQUIRED" } ]
  },
  {
    template_id: "vlm_pt_125",
    name: "Hazard Zone Proximity Breach",
    korean_title: "중장비·크레인 위험 작업 반경 무단 접근",
    category: "산업안전",
    version: "2.2",
    engine: "ewVLM-Turbo-v2 / Qwen2-VL",
    tags: ["산업안전", "협착 방지", "중장비", "위험구역"],
    description: "지게차, 크레인, 고위험 자동화 설비 회전 반경(3m) 내 보행자 진입 시 협착 및 충돌 위험을 즉각 판단하고 긴급 장비 감속 신호를 연동합니다.",
    system_prompt: "You are a factory automation and heavy machinery safety AI specialized in collision and entrapment prevention.",
    user_prompt_template: "Monitor active industrial equipment (forklifts, cranes, robotic arms) on {{camera_id}} {{sector}}. Detect pedestrians approaching within the 3-meter hazardous operational radius to prevent entrapment or collision.",
    parameters: { temperature: 0.1, max_tokens: 128, confidence_threshold: 0.89 },
    action_triggers: [ { type: "webhook", url: "internal://alert/proximity" }, { type: "machinery_slowdown", zone: "{{sector}}" } ]
  },
  {
    template_id: "vlm_pt_130",
    name: "Violent Altercation & Assault",
    korean_title: "이상 물리적 충돌 및 폭력·난동 행위 감지",
    category: "보안",
    version: "1.8",
    engine: "ewVLM-Turbo-v2 / Qwen2-VL",
    tags: ["보안", "공공 치안", "폭력", "범죄 예방"],
    description: "보행자 간 격투, 밀침, 흉기 소지 등 비정상적 신체 공격 패턴을 감지하여 현장 PTZ 카메라를 자동 조향하고 관제 센터 팝업을 발생시킵니다.",
    system_prompt: "You are a public safety and urban surveillance AI trained to recognize aggressive behavior and physical violence.",
    user_prompt_template: "Analyze human interactions on {{camera_id}} {{sector}}. Identify physical brawls, aggressive grappling, brandishing of dangerous objects, or assault. Disregard friendly greetings or regular sport activities.",
    parameters: { temperature: 0.1, max_tokens: 128, confidence_threshold: 0.88 },
    action_triggers: [ { type: "webhook", url: "internal://alert/police_dispatch" }, { type: "ptz_track", target: "altercation" } ]
  }
];

export const PromptGatewayDeploy: React.FC = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  const categories = ['전체', '보안', '안전', '산업안전', '방재', '교통'];

  const filteredPrompts = useMemo(() => {
    return PROMPTS.filter((p) => {
      const matchCategory = selectedCategory === '전체' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.korean_title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchFilter.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchFilter]);

  const activePrompt = PROMPTS[selectedPromptIndex] || PROMPTS[0];

  const handleDeploy = async () => {
    setIsDeploying(true);
    setToastMessage(`⏳ [${activePrompt.korean_title}] 엣지 노드에 배포 중입니다...`);
    try {
      const res = await API.deployPrompt('all-edges', activePrompt);
      if (res.status === 'SUCCESS') {
        setToastMessage(`✅ 배포 성공: ${res.message || '활성 VLM 추론 시나리오로 즉시 적용되었습니다.'}`);
      }
    } catch (err) {
      console.error(err);
      setToastMessage('❌ 배포 중 오류가 발생했습니다.');
    } finally {
      setIsDeploying(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  return (
    <>
      <main className="flex-1 p-container-padding bg-[#070A13] overflow-y-auto relative h-full">
        {toastMessage && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-primary-container border border-primary text-white px-6 py-3 rounded-lg shadow-2xl font-body-base text-body-base animate-pulse">
            {toastMessage}
          </div>
        )}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">hub</span> 프롬프트 게이트웨이 및 엣지 장치 일괄 배포 콘솔
            </h2>
            <p className="text-body-base font-body-base text-text-muted mt-1">
              관제 목적에 최적화된 8대 VLM 시나리오 추론 템플릿을 선택하여 온프레미스 / 에지 AI 노드에 핫 리로드(Hot-Reload) 배포합니다.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setToastMessage('🔄 엣지 노드 설정 동기화가 완료되었습니다.');
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className="px-4 py-2 border border-border-subtle text-on-surface rounded hover:bg-surface-container-highest transition-colors font-body-sm text-body-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined">sync</span> 장치 동기화
            </button>
            <button
              className={`px-4 py-2 rounded text-title-sm font-title-sm flex items-center gap-2 shadow-lg transition-colors ${
                isDeploying
                  ? 'bg-surface-container border border-border-subtle text-text-muted cursor-not-allowed'
                  : 'bg-primary-container text-on-primary-container hover:bg-inverse-primary glow-active'
              }`}
              onClick={handleDeploy}
              disabled={isDeploying}
            >
              <span className={`material-symbols-outlined ${isDeploying ? 'animate-bounce' : ''}`}>cloud_upload</span>
              {isDeploying ? '배포 중...' : `[${activePrompt.name}] 배포 실행`}
            </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-gutter h-[calc(100vh-140px)]">
          {/* Prompt Library (Left) */}
          <div className="col-span-4 glass-panel rounded-lg flex flex-col overflow-hidden">
            <div className="p-3 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
              <h3 className="text-label-caps font-label-caps text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">library_books</span> 관제 시나리오 라이브러리 ({filteredPrompts.length})
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-primary/20 text-primary font-mono-data">Qwen2-VL Ready</span>
            </div>

            {/* Category Filter Tabs */}
            <div className="p-2 border-b border-border-subtle bg-surface-container-lowest flex gap-1 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary text-black'
                      : 'bg-surface-container text-text-muted hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="p-2 bg-surface-container-lowest border-b border-border-subtle">
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-surface-container-high border-border-subtle text-white text-body-sm font-body-sm rounded px-3 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary placeholder-text-muted"
                placeholder="시나리오명, 키워드, 태그 검색..."
                type="text"
              />
            </div>

            {/* Prompt List */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
              {filteredPrompts.map((prompt) => {
                const originalIndex = PROMPTS.findIndex((p) => p.template_id === prompt.template_id);
                const isSelected = selectedPromptIndex === originalIndex;
                return (
                  <div
                    key={prompt.template_id}
                    onClick={() => setSelectedPromptIndex(originalIndex)}
                    className={`border ${
                      isSelected
                        ? 'border-primary bg-surface-container-high glow-active shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                        : 'border-border-subtle bg-surface-container hover:border-outline-variant transition-colors'
                    } rounded p-3 cursor-pointer relative`}
                  >
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-tertiary animate-ping' : 'bg-text-muted'}`}></span>
                      <span className={`text-mono-data font-mono-data ${isSelected ? 'text-tertiary font-bold' : 'text-text-muted'} text-[10px]`}>
                        {prompt.version}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-lowest text-primary font-bold border border-primary/30">
                        {prompt.category}
                      </span>
                      <h4 className="text-title-sm font-title-sm text-on-surface font-bold truncate">
                        {prompt.korean_title}
                      </h4>
                    </div>
                    <p className="text-body-sm font-body-sm text-text-muted line-clamp-2 mb-2">
                      {prompt.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {prompt.tags.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 bg-surface-container-lowest border border-border-subtle rounded text-mono-data font-mono-data text-text-muted text-[10px]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center/Right Columns */}
          <div className="col-span-8 flex flex-col gap-gutter">
            {/* Editor & Config (Top Right) */}
            <div className="glass-panel rounded-lg flex-1 flex flex-col overflow-hidden relative">
              <div className="p-3 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">terminal</span>
                  <h3 className="text-label-caps font-label-caps text-on-surface">
                    배포 페이로드 상세 명세: <span className="text-primary font-bold">{activePrompt.korean_title}</span>
                  </h3>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="px-2 py-0.5 bg-primary/10 border border-primary/30 rounded text-mono-data text-primary text-[11px]">
                    ID: {activePrompt.template_id}
                  </span>
                  <span className="px-2 py-0.5 bg-surface-container-highest border border-border-subtle rounded text-mono-data text-text-muted text-[11px]">
                    JSON Schema (Structured)
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 bg-surface-container-lowest overflow-y-auto">
                <div className="bg-surface-dim p-4 rounded border border-border-subtle font-mono-data text-mono-data text-text-primary leading-relaxed h-full overflow-y-auto">
                  <pre><code>{JSON.stringify(activePrompt, null, 2)}</code></pre>
                </div>
              </div>
            </div>

            {/* Target Devices & Deployment Status (Bottom Right) */}
            <div className="h-64 flex gap-gutter">
              {/* Devices */}
              <div className="w-1/2 glass-panel rounded-lg flex flex-col overflow-hidden">
                <div className="p-3 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
                  <h3 className="text-label-caps font-label-caps text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">router</span> 대상 에지 Gen AI 노드
                  </h3>
                  <span className="text-mono-data font-mono-data text-tertiary text-xs">전체 노드 동기화 바인딩</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-lowest text-mono-data font-mono-data text-text-muted sticky top-0">
                      <tr>
                        <th className="p-2 border-b border-border-subtle w-8">
                          <input defaultChecked className="rounded border-border-subtle bg-surface-container text-primary focus:ring-primary" type="checkbox" />
                        </th>
                        <th className="p-2 border-b border-border-subtle">노드 ID</th>
                        <th className="p-2 border-b border-border-subtle">위치 / 구역</th>
                        <th className="p-2 border-b border-border-subtle">엔진 상태</th>
                      </tr>
                    </thead>
                    <tbody className="text-body-sm font-body-sm">
                      <tr className="hover:bg-surface-container-highest transition-colors border-b border-border-subtle bg-surface-container-high">
                        <td className="p-2"><input defaultChecked className="rounded border-border-subtle bg-surface-container text-primary" type="checkbox" /></td>
                        <td className="p-2 font-mono-data text-mono-data text-primary">EDGE-NRT-01</td>
                        <td className="p-2 text-text-muted">북쪽 펜스 (Sector-1)</td>
                        <td className="p-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary"></span> <span className="text-mono-data font-mono-data">Qwen2-VL 대기</span></td>
                      </tr>
                      <tr className="hover:bg-surface-container-highest transition-colors border-b border-border-subtle bg-surface-container-high">
                        <td className="p-2"><input defaultChecked className="rounded border-border-subtle bg-surface-container text-primary" type="checkbox" /></td>
                        <td className="p-2 font-mono-data text-mono-data text-primary">EDGE-NRT-02</td>
                        <td className="p-2 text-text-muted">동쪽 게이트 (Sector-2)</td>
                        <td className="p-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary"></span> <span className="text-mono-data font-mono-data">온라인</span></td>
                      </tr>
                      <tr className="hover:bg-surface-container-highest transition-colors border-b border-border-subtle">
                        <td className="p-2"><input defaultChecked className="rounded border-border-subtle bg-surface-container text-primary" type="checkbox" /></td>
                        <td className="p-2 font-mono-data text-mono-data text-primary">EDGE-STH-01</td>
                        <td className="p-2 text-text-muted">남쪽 하역장 (Sector-3)</td>
                        <td className="p-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary"></span> <span className="text-mono-data font-mono-data">온라인</span></td>
                      </tr>
                      <tr className="hover:bg-surface-container-highest transition-colors">
                        <td className="p-2"><input defaultChecked className="rounded border-border-subtle bg-surface-container text-primary" type="checkbox" /></td>
                        <td className="p-2 font-mono-data text-mono-data text-primary">EDGE-WST-05</td>
                        <td className="p-2 text-text-muted">서쪽 시설물 (Sector-4)</td>
                        <td className="p-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary"></span> <span className="text-mono-data font-mono-data">온라인</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Simulation / Status */}
              <div className="w-1/2 glass-panel rounded-lg flex flex-col overflow-hidden">
                <div className="p-3 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
                  <h3 className="text-label-caps font-label-caps text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">terminal</span> 실시간 배포 터미널
                  </h3>
                  <span className="text-mono-data font-mono-data text-tertiary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span> 준비 완료
                  </span>
                </div>
                <div className="flex-1 bg-[#0b0e17] p-3 font-mono-data text-mono-data overflow-y-auto flex flex-col gap-1 text-xs">
                  <div className="text-text-muted">[SYSTEM] VLM Gateway API 연결 활성화 (http://localhost:8000)</div>
                  <div className="text-text-muted">[VALIDATE] 선택된 시나리오: '{activePrompt.korean_title}' ({activePrompt.template_id})</div>
                  <div className="text-tertiary">[TARGET_ENGINE] {activePrompt.engine} (Confidence Thresh: {activePrompt.parameters.confidence_threshold})</div>
                  <div className="text-text-muted">[PARSER] Structured JSON Contract 확인: threat_level, summary, action</div>
                  <div className="text-primary font-bold">[READY] 배포 실행 클릭 시 모든 활성 카메라 및 Slow Loop에 즉각 주입됩니다.</div>
                  <div className="mt-auto flex items-center gap-2 pt-2 border-t border-border-subtle">
                    <span className="text-primary animate-pulse">&gt;</span>
                    <span className="text-text-muted">Ready for deployment dispatch.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};


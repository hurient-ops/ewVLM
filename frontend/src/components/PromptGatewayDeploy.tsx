import React, { useState, useMemo, useEffect } from 'react';
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
  action_triggers: Array<{ type: string; url?: string; target?: string; zone?: string; level?: string; text?: string }>;
}

const DEFAULT_PROMPTS: VlmPromptTemplate[] = [
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
    parameters: { temperature: 0.1, max_tokens: 128, confidence_threshold: 0.85 },
    action_triggers: [ { type: "log", level: "warning" }, { type: "broadcast", zone: "{{sector}}" } ]
  },
  {
    template_id: "vlm_pt_125",
    name: "Tunnel Stopped Vehicle & Reverse",
    korean_title: "지하차도 및 터널 내 역주행·돌발 정지",
    category: "교통",
    version: "1.8",
    engine: "ewVLM-Turbo-v2 / Qwen2-VL",
    tags: ["교통", "터널 안전", "역주행", "돌발 정지"],
    description: "터널 또는 고속화도로 내 비정상 감속, 차량 정지, 역주행 차량을 즉각 검출하여 진입 차단 신호등을 연동합니다.",
    system_prompt: "You are a high-speed traffic incident visual AI for expressways and tunnels.",
    user_prompt_template: "Examine {{camera_id}} {{sector}}. Identify vehicles moving in the reverse direction of traffic or stationary vehicles causing hazardous rear-end collision risks.",
    parameters: { temperature: 0.08, max_tokens: 128, confidence_threshold: 0.90 },
    action_triggers: [ { type: "webhook", url: "internal://alert/tunnel_stop" }, { type: "vms_message", text: "터널 내 정지 차량 발생 서행" } ]
  },
  {
    template_id: "vlm_pt_130",
    name: "Water Level Rise & Submersion",
    korean_title: "하천 수위 급상승 및 지하 침수 위험",
    category: "방재",
    version: "2.3",
    engine: "ewVLM-Base-v1 / Qwen2-VL",
    tags: ["방재", "침수", "수위 감시", "재난 대비"],
    description: "하천 범람 수위 눈금 및 둔치 차량 침수 위험을 포착하여 차수벽 가동 및 침수 경고 안내를 지시합니다.",
    system_prompt: "You are a flood management and environmental disaster prediction vision model.",
    user_prompt_template: "Monitor watermark scale and flood levels in {{camera_id}} {{sector}}. Detect if water level crosses boundary thresholds or if parking lot/footpath is submerging.",
    parameters: { temperature: 0.05, max_tokens: 128, confidence_threshold: 0.91 },
    action_triggers: [ { type: "webhook", url: "internal://alert/flood" }, { type: "broadcast", zone: "river_all" } ]
  }
];

interface EdgeCameraNode {
  camera_id: string;
  name: string;
  location?: string;
  rtsp_url?: string;
  is_active?: boolean;
  vlm_enabled?: boolean;
}

export const PromptGatewayDeploy: React.FC = () => {
  const [prompts, setPrompts] = useState<VlmPromptTemplate[]>(DEFAULT_PROMPTS);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Prompt Editable State
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');
  const [editablePrompt, setEditablePrompt] = useState<VlmPromptTemplate>(DEFAULT_PROMPTS[0]);

  // Real Edge Cameras fetched from Gateway API
  const [cameraNodes, setCameraNodes] = useState<EdgeCameraNode[]>([]);
  const [selectedCameras, setSelectedCameras] = useState<Set<string>>(new Set());
  const [testTargetCamera, setTestTargetCamera] = useState<string>('');

  // Terminal Real-Time Logging State
  const [terminalLogs, setTerminalLogs] = useState<Array<{ timestamp: string; type: 'info' | 'success' | 'warn' | 'error' | 'ready'; message: string }>>([
    { timestamp: new Date().toLocaleTimeString(), type: 'info', message: '[SYSTEM] VLM Gateway API 연결 활성화 (http://localhost:8000)' },
    { timestamp: new Date().toLocaleTimeString(), type: 'info', message: '[SYSTEM] Fast-Loop 실시간 캡처 엔진 대기 (http://localhost:8001)' },
    { timestamp: new Date().toLocaleTimeString(), type: 'ready', message: '[READY] 관제 시나리오를 선택하고 엣지 노드에 즉시 배포 또는 테스트할 수 있습니다.' }
  ]);

  const addTerminalLog = (type: 'info' | 'success' | 'warn' | 'error' | 'ready', message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [...prev.slice(-40), { timestamp, type, message }]);
  };

  // Fetch real camera list on mount
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const cams = await API.getCameras();
        if (Array.isArray(cams) && cams.length > 0) {
          setCameraNodes(cams);
          setSelectedCameras(new Set(cams.map((c: any) => c.camera_id)));
          setTestTargetCamera(cams[0].camera_id);
          addTerminalLog('success', `[EDGE_DISCOVERY] 활성 카메라 노드 ${cams.length}대 감지 및 등록 완료.`);
        } else {
          // Fallback camera nodes
          const defaultCams: EdgeCameraNode[] = [
            { camera_id: 'cam-01', name: '서쪽 펜스 라인 (Sector-1)', location: '서쪽 펜스', is_active: true, vlm_enabled: true },
            { camera_id: 'cam-02', name: '중앙 역사 광장 (Sector-2)', location: '중앙 광장', is_active: true, vlm_enabled: true },
            { camera_id: 'cam-03', name: '지하 비상 진출입로', location: '지하 1층', is_active: true, vlm_enabled: true },
            { camera_id: 'cam-04', name: '외곽 하역장 진입로', location: '외곽 하역장', is_active: true, vlm_enabled: true }
          ];
          setCameraNodes(defaultCams);
          setSelectedCameras(new Set(defaultCams.map(c => c.camera_id)));
          setTestTargetCamera('cam-01');
        }
      } catch (err) {
        console.error('Failed to fetch camera nodes', err);
        addTerminalLog('warn', '[EDGE_DISCOVERY] 카메라 노드 로드 실패, 기본 로컬 엣지 노드로 대체합니다.');
      }
    };
    fetchCameras();
  }, []);

  const categories = ['전체', '보안', '안전', '산업안전', '방재', '교통'];

  const filteredPrompts = useMemo(() => {
    return prompts.filter((p) => {
      const matchCategory = selectedCategory === '전체' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.korean_title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchFilter.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [prompts, selectedCategory, searchFilter]);

  const handleSelectPrompt = (index: number) => {
    setSelectedPromptIndex(index);
    const selected = prompts[index];
    setEditablePrompt({ ...selected, parameters: { ...selected.parameters } });
    addTerminalLog('info', `[SELECT] 시나리오 선택: '${selected.korean_title}' (${selected.template_id})`);
  };

  const handleToggleCamera = (cameraId: string) => {
    setSelectedCameras(prev => {
      const next = new Set(prev);
      if (next.has(cameraId)) {
        next.delete(cameraId);
      } else {
        next.add(cameraId);
      }
      return next;
    });
  };

  const handleToggleAllCameras = () => {
    if (selectedCameras.size === cameraNodes.length) {
      setSelectedCameras(new Set());
    } else {
      setSelectedCameras(new Set(cameraNodes.map(c => c.camera_id)));
    }
  };

  // Deploy to Edge Nodes
  const handleDeploy = async () => {
    if (selectedCameras.size === 0) {
      setToastMessage('⚠️ 배포할 대상 엣지 카메라 노드를 1개 이상 선택해주세요.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsDeploying(true);
    const targetList = Array.from(selectedCameras);
    addTerminalLog('info', `[DEPLOY_START] 대상 노드 (${targetList.length}대): [${targetList.join(', ')}]`);
    addTerminalLog('info', `[PAYLOAD] 템플릿: '${editablePrompt.korean_title}' (엔진: ${editablePrompt.engine})`);

    try {
      const res = await API.deployPrompt(targetList.join(','), editablePrompt);
      if (res && res.status === 'SUCCESS') {
        addTerminalLog('success', `[DEPLOY_COMPLETE] ✅ 배포 완료: ${res.message || '엣지 AI 노드 핫 리로드 성공'}`);
        setToastMessage(`✅ [${editablePrompt.korean_title}] 엣지 노드 ${targetList.length}대에 즉시 배포되었습니다.`);
        
        // Update prompts list with edited prompt
        setPrompts(prev => {
          const next = [...prev];
          next[selectedPromptIndex] = editablePrompt;
          return next;
        });
      } else {
        addTerminalLog('warn', `[DEPLOY_RESPONSE] ${JSON.stringify(res)}`);
      }
    } catch (err: any) {
      console.error(err);
      addTerminalLog('error', `[DEPLOY_FAILED] 배포 중 통신 에러 발생: ${err.message || err}`);
      setToastMessage('❌ 엣지 노드 배포 중 오류가 발생했습니다.');
    } finally {
      setIsDeploying(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Sync Device Config
  const handleSyncDevices = async () => {
    setIsSyncing(true);
    addTerminalLog('info', '[SYNC_START] 엣지 장치 설정 및 ONVIF 파라미터 일괄 동기화 시작...');
    try {
      const res = await API.syncDeviceConfig('all');
      addTerminalLog('success', `[SYNC_DONE] ✅ ${res?.message || '모든 엣지 노드 동기화 완료'}`);
      setToastMessage('🔄 엣지 노드 설정 및 영상 채널 동기화가 완료되었습니다.');
    } catch (err: any) {
      addTerminalLog('error', `[SYNC_FAILED] 동기화 실패: ${err.message || err}`);
      setToastMessage('❌ 장치 동기화 중 오류가 발생했습니다.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Test Inference Preview with Selected Camera Real Frame
  const handleTestInference = async () => {
    const targetCam = testTargetCamera || (cameraNodes[0]?.camera_id || 'cam-01');
    setIsTesting(true);
    addTerminalLog('info', `[TEST_RUN] 카메라 '${targetCam}' 실시간 스냅샷 캡처 및 VLM 인퍼런스 테스트 시작...`);
    
    try {
      const testQuestion = `[시나리오 검증: ${editablePrompt.korean_title}] ${editablePrompt.user_prompt_template.replace('{{camera_id}}', targetCam).replace('{{sector}}', '관제구역')}`;
      const res = await API.sendVlmChat(testQuestion, targetCam);
      
      if (res && res.reply) {
        addTerminalLog('success', `[TEST_RESULT] AI 추론 결과:\n"${res.reply}"`);
        if (res.snapshot_base64) {
          addTerminalLog('info', `[TEST_FRAME] 실시간 스냅샷 프레임 정상 획득 완료 (Base64 크기: ${res.snapshot_base64.length.toLocaleString()} bytes)`);
        }
        setToastMessage(`🎯 [${targetCam}] 실시간 프롬프트 테스트 완료`);
      } else {
        addTerminalLog('warn', '[TEST_WARN] 모델 응답이 비어있습니다.');
      }
    } catch (err: any) {
      addTerminalLog('error', `[TEST_ERROR] 테스트 실패: ${err.message || err}`);
      setToastMessage('⚠️ 실시간 테스트 중 오류가 발생했습니다.');
    } finally {
      setIsTesting(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  return (
    <>
      <main className="flex-1 p-container-padding bg-[#070A13] overflow-y-auto relative h-full">
        {toastMessage && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-[#121829] border border-primary text-white px-6 py-3 rounded-lg shadow-2xl font-body-base text-body-base flex items-center gap-2 animate-bounce">
            <span className="material-symbols-outlined text-primary text-[20px]">notifications_active</span>
            {toastMessage}
          </div>
        )}

        {/* Top Header */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">hub</span> 프롬프트 게이트웨이 및 엣지 장치 일괄 배포 콘솔
            </h2>
            <p className="text-body-base font-body-base text-text-muted mt-1">
              관제 목적별 8대 VLM 시나리오 추론 템플릿을 선택·튜닝하고, 실제 활성 카메라 엣지 노드에 핫 리로드(Hot-Reload) 배포합니다.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSyncDevices}
              disabled={isSyncing}
              className="px-4 py-2 border border-border-subtle bg-surface-container text-on-surface rounded hover:bg-surface-container-highest transition-colors font-body-sm text-body-sm flex items-center gap-2"
            >
              <span className={`material-symbols-outlined ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
              {isSyncing ? '동기화 중...' : '장치 동기화'}
            </button>
            <button
              className={`px-5 py-2 rounded text-title-sm font-title-sm flex items-center gap-2 shadow-lg transition-all ${
                isDeploying
                  ? 'bg-surface-container border border-border-subtle text-text-muted cursor-not-allowed'
                  : 'bg-primary-container text-on-primary-container hover:bg-inverse-primary glow-active cursor-pointer'
              }`}
              onClick={handleDeploy}
              disabled={isDeploying}
            >
              <span className={`material-symbols-outlined ${isDeploying ? 'animate-bounce' : ''}`}>cloud_upload</span>
              {isDeploying ? '엣지 배포 중...' : `[${editablePrompt.korean_title}] 엣지 배포 실행 (${selectedCameras.size}대)`}
            </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-gutter h-[calc(100vh-140px)]">
          {/* Prompt Library (Left - 4 cols) */}
          <div className="col-span-4 glass-panel rounded-lg flex flex-col overflow-hidden">
            <div className="p-3 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
              <h3 className="text-label-caps font-label-caps text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">library_books</span> 관제 시나리오 라이브러리 ({filteredPrompts.length})
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-primary/20 text-primary font-mono-data border border-primary/30">
                Qwen2-VL Ready
              </span>
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
                className="w-full bg-surface-container-high border-border-subtle text-white text-body-sm font-body-sm rounded px-3 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary placeholder-text-muted outline-none"
                placeholder="시나리오명, 키워드, 태그 검색..."
                type="text"
              />
            </div>

            {/* Prompt List */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
              {filteredPrompts.map((prompt) => {
                const originalIndex = prompts.findIndex((p) => p.template_id === prompt.template_id);
                const isSelected = selectedPromptIndex === originalIndex;
                return (
                  <div
                    key={prompt.template_id}
                    onClick={() => handleSelectPrompt(originalIndex)}
                    className={`border ${
                      isSelected
                        ? 'border-primary bg-surface-container-high glow-active shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                        : 'border-border-subtle bg-surface-container hover:border-outline-variant transition-colors'
                    } rounded p-3 cursor-pointer relative`}
                  >
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-tertiary animate-ping' : 'bg-text-muted'}`}></span>
                      <span className={`text-mono-data font-mono-data ${isSelected ? 'text-tertiary font-bold' : 'text-text-muted'} text-[10px]`}>
                        v{prompt.version}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1 pr-12">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-lowest text-primary font-bold border border-primary/30">
                        {prompt.category}
                      </span>
                      <h4 className="text-title-sm font-title-sm text-on-surface font-bold truncate">
                        {prompt.korean_title}
                      </h4>
                    </div>
                    <p className="text-body-sm font-body-sm text-text-muted line-clamp-2 mb-2 text-xs">
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

          {/* Center/Right Columns (8 cols) */}
          <div className="col-span-8 flex flex-col gap-gutter">
            {/* Editor & Config (Top Right) */}
            <div className="glass-panel rounded-lg flex-1 flex flex-col overflow-hidden relative">
              <div className="p-3 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">edit_note</span>
                  <h3 className="text-label-caps font-label-caps text-on-surface">
                    프롬프트 파이프라인 튜닝: <span className="text-primary font-bold">{editablePrompt.korean_title}</span>
                  </h3>
                </div>

                <div className="flex gap-2 items-center">
                  {/* Mode Tabs */}
                  <div className="flex bg-surface-container-lowest rounded p-0.5 border border-border-subtle">
                    <button
                      onClick={() => setActiveTab('form')}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                        activeTab === 'form' ? 'bg-primary text-black' : 'text-text-muted hover:text-white'
                      }`}
                    >
                      상세 튜닝 폼
                    </button>
                    <button
                      onClick={() => setActiveTab('json')}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                        activeTab === 'json' ? 'bg-primary text-black' : 'text-text-muted hover:text-white'
                      }`}
                    >
                      JSON 명세
                    </button>
                  </div>

                  <span className="px-2 py-0.5 bg-primary/10 border border-primary/30 rounded text-mono-data text-primary text-[11px]">
                    ID: {editablePrompt.template_id}
                  </span>
                </div>
              </div>

              {/* Editor Body */}
              <div className="p-4 flex-1 bg-surface-container-lowest overflow-y-auto">
                {activeTab === 'form' ? (
                  <div className="flex flex-col gap-3 h-full">
                    {/* System Prompt */}
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">psychology</span>
                        시스템 프롬프트 (System Role Directive)
                      </label>
                      <textarea
                        value={editablePrompt.system_prompt}
                        onChange={(e) => setEditablePrompt({ ...editablePrompt, system_prompt: e.target.value })}
                        className="w-full h-16 bg-[#0b0e17] border border-border-subtle rounded p-2 text-xs font-mono text-gray-200 focus:border-primary outline-none resize-none"
                      />
                    </div>

                    {/* User Prompt Template */}
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        실시간 영상 질의 템플릿 (User Prompt Template)
                      </label>
                      <textarea
                        value={editablePrompt.user_prompt_template}
                        onChange={(e) => setEditablePrompt({ ...editablePrompt, user_prompt_template: e.target.value })}
                        className="w-full h-24 bg-[#0b0e17] border border-border-subtle rounded p-2 text-xs font-mono text-gray-200 focus:border-primary outline-none resize-none leading-relaxed"
                      />
                    </div>

                    {/* Hyperparameters Slider Controls */}
                    <div className="grid grid-cols-3 gap-3 p-3 bg-surface-container rounded border border-border-subtle">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-muted font-bold">Temperature</span>
                          <span className="text-primary font-mono">{editablePrompt.parameters.temperature}</span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="1.0"
                          step="0.05"
                          value={editablePrompt.parameters.temperature}
                          onChange={(e) => setEditablePrompt({
                            ...editablePrompt,
                            parameters: { ...editablePrompt.parameters, temperature: parseFloat(e.target.value) }
                          })}
                          className="w-full accent-primary"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-muted font-bold">신뢰도 임계치 (Confidence)</span>
                          <span className="text-tertiary font-mono">{editablePrompt.parameters.confidence_threshold}</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="0.99"
                          step="0.01"
                          value={editablePrompt.parameters.confidence_threshold}
                          onChange={(e) => setEditablePrompt({
                            ...editablePrompt,
                            parameters: { ...editablePrompt.parameters, confidence_threshold: parseFloat(e.target.value) }
                          })}
                          className="w-full accent-tertiary"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-muted font-bold">최대 토큰 (Max Tokens)</span>
                          <span className="text-blue-400 font-mono">{editablePrompt.parameters.max_tokens}</span>
                        </div>
                        <input
                          type="range"
                          min="64"
                          max="512"
                          step="32"
                          value={editablePrompt.parameters.max_tokens}
                          onChange={(e) => setEditablePrompt({
                            ...editablePrompt,
                            parameters: { ...editablePrompt.parameters, max_tokens: parseInt(e.target.value) }
                          })}
                          className="w-full accent-blue-400"
                        />
                      </div>
                    </div>

                    {/* One-click Live Test Bar */}
                    <div className="mt-auto flex items-center justify-between p-2.5 bg-primary/10 border border-primary/30 rounded">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">videocam</span>
                        <span className="text-xs text-on-surface font-bold">실시간 카메라 즉시 인퍼런스 테스트:</span>
                        <select
                          value={testTargetCamera}
                          onChange={(e) => setTestTargetCamera(e.target.value)}
                          className="bg-[#0b0e17] text-white border border-border-subtle rounded px-2 py-1 text-xs outline-none focus:border-primary"
                        >
                          {cameraNodes.map((c) => (
                            <option key={c.camera_id} value={c.camera_id}>
                              {c.name} ({c.camera_id})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={handleTestInference}
                        disabled={isTesting}
                        className="px-3 py-1.5 bg-primary text-black font-bold text-xs rounded hover:bg-opacity-90 transition-all flex items-center gap-1.5 shadow"
                      >
                        <span className={`material-symbols-outlined text-[16px] ${isTesting ? 'animate-spin' : ''}`}>
                          {isTesting ? 'sync' : 'play_arrow'}
                        </span>
                        {isTesting ? 'VLM 분석 중...' : '1프레임 즉시 테스트'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0b0e17] p-4 rounded border border-border-subtle font-mono text-xs text-gray-200 leading-relaxed h-full overflow-y-auto">
                    <pre><code>{JSON.stringify(editablePrompt, null, 2)}</code></pre>
                  </div>
                )}
              </div>
            </div>

            {/* Target Devices & Terminal Status (Bottom Right - 2 cols split) */}
            <div className="h-64 flex gap-gutter">
              {/* Target Devices Table */}
              <div className="w-1/2 glass-panel rounded-lg flex flex-col overflow-hidden">
                <div className="p-3 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
                  <h3 className="text-label-caps font-label-caps text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">router</span> 배포 대상 엣지 카메라 ({selectedCameras.size}/{cameraNodes.length})
                  </h3>
                  <button
                    onClick={handleToggleAllCameras}
                    className="text-mono-data font-mono-data text-primary text-[11px] hover:underline"
                  >
                    {selectedCameras.size === cameraNodes.length ? '전체 해제' : '전체 선택'}
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-lowest text-mono-data font-mono-data text-text-muted sticky top-0 text-xs">
                      <tr>
                        <th className="p-2 border-b border-border-subtle w-8">
                          <input
                            type="checkbox"
                            checked={selectedCameras.size > 0 && selectedCameras.size === cameraNodes.length}
                            onChange={handleToggleAllCameras}
                            className="rounded border-border-subtle bg-surface-container text-primary focus:ring-primary cursor-pointer"
                          />
                        </th>
                        <th className="p-2 border-b border-border-subtle">카메라 ID</th>
                        <th className="p-2 border-b border-border-subtle">명칭 / 위치</th>
                        <th className="p-2 border-b border-border-subtle">상태</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {cameraNodes.map((cam) => {
                        const isChecked = selectedCameras.has(cam.camera_id);
                        return (
                          <tr
                            key={cam.camera_id}
                            onClick={() => handleToggleCamera(cam.camera_id)}
                            className={`border-b border-border-subtle cursor-pointer transition-colors ${
                              isChecked ? 'bg-surface-container-high' : 'hover:bg-surface-container'
                            }`}
                          >
                            <td className="p-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleCamera(cam.camera_id)}
                                className="rounded border-border-subtle bg-surface-container text-primary cursor-pointer"
                              />
                            </td>
                            <td className="p-2 font-mono text-primary font-bold">{cam.camera_id}</td>
                            <td className="p-2 text-text-muted truncate max-w-[140px]">{cam.name}</td>
                            <td className="p-2">
                              <span className="flex items-center gap-1 text-[11px] text-tertiary">
                                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                                {cam.vlm_enabled !== false ? 'VLM 활성' : '대기'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Terminal / Real-Time Status */}
              <div className="w-1/2 glass-panel rounded-lg flex flex-col overflow-hidden">
                <div className="p-3 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
                  <h3 className="text-label-caps font-label-caps text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">terminal</span> 실시간 배포 및 인퍼런스 터미널
                  </h3>
                  <button
                    onClick={() => setTerminalLogs([])}
                    className="text-[11px] text-text-muted hover:text-white transition-colors"
                  >
                    로그 지우기
                  </button>
                </div>
                <div className="flex-1 bg-[#0b0e17] p-3 font-mono text-[11px] overflow-y-auto flex flex-col gap-1 leading-relaxed">
                  {terminalLogs.map((log, i) => {
                    let colorClass = 'text-gray-300';
                    if (log.type === 'success') colorClass = 'text-green-400 font-bold';
                    if (log.type === 'warn') colorClass = 'text-yellow-400';
                    if (log.type === 'error') colorClass = 'text-red-400 font-bold';
                    if (log.type === 'ready') colorClass = 'text-primary font-bold';

                    return (
                      <div key={i} className={colorClass}>
                        <span className="text-gray-500 mr-1.5">[{log.timestamp}]</span>
                        {log.message}
                      </div>
                    );
                  })}
                  <div className="mt-auto flex items-center gap-1.5 pt-2 border-t border-border-subtle text-text-muted">
                    <span className="text-primary animate-pulse">&gt;</span>
                    <span>Ready for dispatch or live inference test.</span>
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

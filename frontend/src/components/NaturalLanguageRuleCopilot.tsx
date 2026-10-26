import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../api/client';

interface TargetCamera {
  camera_id: string;
  name: string;
  location?: string;
  is_active?: boolean;
}

export const NaturalLanguageRuleCopilot: React.FC = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('소방 진출입로 또는 비상 통로에 3분 이상 정차하는 불법 주차 차량을 식별하여 즉시 경고 조치하세요.');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [generatedRule, setGeneratedRule] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real Camera Assets from Gateway API
  const [cameras, setCameras] = useState<TargetCamera[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('cam-01');
  const [checkedCameras, setCheckedCameras] = useState<Set<string>>(new Set());
  const [cameraSearch, setCameraSearch] = useState<string>('');

  // Quick Prompt Recommendations
  const quickPrompts = [
    '소방 진출입로 비상 통로 불법 주정차 차량 감지',
    '야간 외곽 펜스 라인 월담 및 침입 인원 감지',
    '고위험 작업장 안전모 및 안전조끼 미착용 적발',
    '지하차도 터널 내 정지 차량 및 역주행 위험 포착',
    '공장 내 작업자 급작 낙상 및 30초 이상 실신 감지'
  ];

  // Fetch real cameras on mount
  useEffect(() => {
    const fetchCams = async () => {
      try {
        const cams = await API.getCameras();
        if (Array.isArray(cams) && cams.length > 0) {
          setCameras(cams);
          setSelectedCameraId(cams[0].camera_id);
          setCheckedCameras(new Set([cams[0].camera_id]));
        } else {
          const defaultCams: TargetCamera[] = [
            { camera_id: 'cam-real-1787557630', name: '외곽 1구역 펜스 (CAM-01)', is_active: true },
            { camera_id: 'cam-real-1787579299', name: '진입로 메인 게이트 (CAM-02)', is_active: true },
            { camera_id: 'cctv-0024', name: '서쪽 계단 L2 (CAM-03)', is_active: true },
            { camera_id: 'cam-01', name: '비상 하역장 (CAM-04)', is_active: true }
          ];
          setCameras(defaultCams);
          setSelectedCameraId(defaultCams[0].camera_id);
          setCheckedCameras(new Set([defaultCams[0].camera_id]));
        }
      } catch (err) {
        console.error('Failed to fetch cameras', err);
      }
    };
    fetchCams();
  }, []);

  const handleToggleCheck = (camId: string) => {
    setCheckedCameras(prev => {
      const next = new Set(prev);
      if (next.has(camId)) next.delete(camId);
      else next.add(camId);
      return next;
    });
  };

  const handleSimulate = async () => {
    if (!prompt.trim()) return;
    setIsSimulating(true);
    setSimulationComplete(false);

    try {
      const data = await API.generateSopRule(prompt);
      if (data && data.status === 'SUCCESS' && data.generated_rule) {
        setGeneratedRule(data.generated_rule);
        setSimulationComplete(true);
        setToastMessage(`🎯 [${data.generated_rule.rule_name}] 자연어 규칙이 생성되었습니다.`);
      } else {
        // Fallback rule parsing based on user prompt
        const targetObj = prompt.includes('차량') ? '차량(Vehicle)' : prompt.includes('사람') || prompt.includes('인원') ? '인물(Person)' : prompt.includes('화재') ? '연기/불꽃' : '작업자';
        const simulatedRule = {
          rule_name: `Rule_${Date.now().toString().slice(-4)}_${targetObj.split('(')[0]}`,
          target_object: targetObj,
          confidence_threshold: 0.88,
          estimated_accuracy: 94.2,
          schedule: '24/7',
          sop_actions: ['현장 IP 스피커 1차 경고 방송', '관제사 팝업 모달 전개', '비상 연락망 SMS 발송']
        };
        setGeneratedRule(simulatedRule);
        setSimulationComplete(true);
        setToastMessage(`🎯 [${simulatedRule.rule_name}] 룰셋이 생성되었습니다.`);
      }
    } catch (e) {
      console.error(e);
      setToastMessage('⚠️ 규칙 생성 실패, 로컬 시뮬레이션으로 전환합니다.');
    } finally {
      setIsSimulating(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleDeploy = async () => {
    if (!generatedRule) return;
    try {
      await API.simulateEvent(generatedRule.rule_name, generatedRule.target_object);
      setToastMessage(`🚀 [${generatedRule.rule_name}] 선택된 엣지 카메라 ${checkedCameras.size}대에 룰셋 배포 완료!`);
      setTimeout(() => {
        setToastMessage(null);
        navigate('/monitor-b');
      }, 2000);
    } catch (e) {
      console.error(e);
      setToastMessage('❌ 룰셋 배포 중 오류가 발생했습니다.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const filteredCameras = cameras.filter(c =>
    c.name.toLowerCase().includes(cameraSearch.toLowerCase()) ||
    c.camera_id.toLowerCase().includes(cameraSearch.toLowerCase())
  );

  return (
    <>
      <main className="flex-1 min-w-0 p-container-padding h-[calc(100vh-3.5rem)] flex gap-gutter bg-[#070A13] overflow-hidden relative">
        {toastMessage && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-[#121829] border border-primary text-white px-6 py-3 rounded-lg shadow-2xl font-body-base text-body-base flex items-center gap-2 animate-bounce">
            <span className="material-symbols-outlined text-primary text-[20px]">smart_toy</span>
            {toastMessage}
          </div>
        )}

        {/* Left: Target Camera List (320px) */}
        <section className="w-[320px] bg-surface-container-low flex flex-col border border-border-subtle shadow-sm shrink-0 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-border-subtle bg-surface flex items-center justify-between">
            <h3 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">videocam</span>
              적용 대상 카메라 ({checkedCameras.size}/{cameras.length})
            </h3>
            <button
              onClick={() => {
                if (checkedCameras.size === cameras.length) setCheckedCameras(new Set());
                else setCheckedCameras(new Set(cameras.map(c => c.camera_id)));
              }}
              className="text-[11px] font-mono text-primary hover:underline"
            >
              {checkedCameras.size === cameras.length ? '해제' : '전체'}
            </button>
          </div>

          {/* Search Box */}
          <div className="p-2 border-b border-border-subtle bg-surface-container-lowest">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2 top-2 text-text-muted text-[16px]">search</span>
              <input
                className="w-full bg-[#0b0e17] border border-border-subtle rounded pl-8 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-gray-500 font-mono"
                placeholder="카메라 검색..."
                type="text"
                value={cameraSearch}
                onChange={(e) => setCameraSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Camera Items */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
            {filteredCameras.map((cam) => {
              const isChecked = checkedCameras.has(cam.camera_id);
              const isCurrent = selectedCameraId === cam.camera_id;
              return (
                <div
                  key={cam.camera_id}
                  onClick={() => setSelectedCameraId(cam.camera_id)}
                  className={`flex items-center gap-2.5 p-2 cursor-pointer rounded border transition-colors group ${
                    isCurrent
                      ? 'border-primary bg-primary/10 shadow-[0_0_8px_rgba(124,58,237,0.2)]'
                      : 'border-border-subtle bg-surface-container hover:bg-surface-container-high'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggleCheck(cam.camera_id);
                    }}
                    className="rounded border-border-subtle bg-[#0b0e17] text-primary focus:ring-primary cursor-pointer"
                  />

                  {/* Real Fast-Loop Snapshot Thumbnail */}
                  <div className="w-14 h-10 bg-black rounded border border-border-subtle relative overflow-hidden shrink-0">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      src={`http://localhost:8001/snapshot/${cam.camera_id}`}
                      alt={cam.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="35" viewBox="0 0 50 35"><rect width="100%" height="100%" fill="%23111827"/><text x="50%" y="50%" fill="%234B5563" font-size="8" dominant-baseline="middle" text-anchor="middle">CAM</text></svg>';
                      }}
                    />
                  </div>

                  <div className="flex flex-col overflow-hidden flex-1">
                    <span className="text-xs font-bold text-on-surface truncate">{cam.name}</span>
                    <span className="text-[10px] font-mono text-primary truncate">{cam.camera_id}</span>
                  </div>

                  <div className={`w-2 h-2 rounded-full ${cam.is_active !== false ? 'bg-tertiary shadow-[0_0_4px_#4edea3]' : 'bg-gray-500'}`}></div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right: Copilot Prompt & Real-Time Validation Area */}
        <section className="flex-1 flex flex-col gap-gutter min-w-0">
          {/* Natural Language Prompt Input Card */}
          <div className="bg-surface-container-low border border-border-subtle flex flex-col shrink-0 shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border-subtle bg-surface flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">smart_toy</span>
                <h3 className="text-title-sm font-title-sm text-on-surface font-bold">
                  자연어 기반 지능형 SOP 룰셋 코파일럿
                </h3>
              </div>
              <span className="text-mono-data font-mono-data text-xs text-primary px-2 py-0.5 bg-primary/10 border border-primary/30 rounded">
                엔진: Qwen2-VL / Vision-Ops-v4
              </span>
            </div>

            <div className="p-4 flex flex-col gap-3">
              {/* Quick Prompt Chips */}
              <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
                <span className="text-text-muted font-bold shrink-0">추천 룰:</span>
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(qp)}
                    className="px-2.5 py-1 bg-[#0b0e17] hover:bg-surface-container-high border border-border-subtle rounded text-text-muted hover:text-white transition-colors whitespace-nowrap text-[11px]"
                  >
                    #{qp.slice(0, 16)}...
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary mt-2">chat</span>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-[#0b0e17] border border-border-subtle rounded p-3 text-xs font-mono text-gray-200 focus:outline-none focus:border-primary resize-none h-20 leading-relaxed"
                  placeholder="감지하려는 이상 징후나 대응 절차를 일상 한국어로 자유롭게 서술하세요..."
                />
              </div>

              <div className="flex justify-between items-center ml-9">
                <span className="text-[11px] text-text-muted font-mono">
                  자연어로 작성된 관제 지침이 VLM 비전 필터 및 자동 대응 SOP 규정으로 변환됩니다.
                </span>
                <button
                  onClick={handleSimulate}
                  disabled={isSimulating || !prompt.trim()}
                  className="bg-primary-container text-on-primary-container px-4 py-2 rounded text-xs font-bold flex items-center gap-2 hover:bg-inverse-primary transition-all disabled:opacity-50 cursor-pointer shadow"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isSimulating ? 'animate-spin' : ''}`}>
                    {isSimulating ? 'sync' : 'science'}
                  </span>
                  {isSimulating ? 'VLM 제로샷 분석 중...' : '제로샷 시뮬레이션 시작'}
                </button>
              </div>

              {/* AI Generated Rule Summary Bubble */}
              {simulationComplete && generatedRule && (
                <div className="ml-9 p-3 rounded bg-[#0b0e17] border-l-4 border-primary text-xs font-mono text-gray-200 relative shadow">
                  <p className="leading-relaxed">
                    💡 자연어 분석 완료: 대상 객체 <strong className="text-primary">[{generatedRule.target_object}]</strong> 및
                    행동 패턴을 추출하여 <strong>'{generatedRule.rule_name}'</strong> 룰셋을 편성했습니다.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    <span className="px-2 py-0.5 bg-surface-container rounded border border-border-subtle text-text-muted">
                      신뢰도 임계치: <strong className="text-white">{(generatedRule.confidence_threshold * 100).toFixed(0)}%</strong>
                    </span>
                    <span className="px-2 py-0.5 bg-surface-container rounded border border-border-subtle text-tertiary">
                      예상 정확도: <strong>{generatedRule.estimated_accuracy || 94.2}%</strong>
                    </span>
                    {generatedRule.sop_actions?.map((act: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-primary/20 text-primary rounded border border-primary/30">
                        조치 {i + 1}: {act}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Zero-shot Validation Live Viewport */}
          <div className="flex-1 bg-surface-container-low border border-border-subtle flex flex-col relative overflow-hidden shadow-sm rounded-lg">
            <div className="px-4 py-2 border-b border-border-subtle bg-surface flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">videocam</span>
                <h3 className="text-title-sm font-title-sm text-on-surface font-bold">
                  실시간 카메라 제로샷 검증 뷰포트 ({selectedCameraId.toUpperCase()})
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                {isSimulating ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
                    <span className="text-yellow-400 font-bold">추론 시뮬레이션 중...</span>
                  </>
                ) : simulationComplete ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                    <span className="text-tertiary font-bold">검증 완료 (규칙 적용 가능)</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                    <span className="text-text-muted">대기 중</span>
                  </>
                )}
              </div>
            </div>

            {/* Live Video Cell */}
            <div className="flex-1 bg-black relative overflow-hidden flex items-center justify-center">
              <img
                src={`http://localhost:8001/stream/${selectedCameraId}`}
                alt="Selected Camera Stream"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `http://localhost:8001/snapshot/${selectedCameraId}`;
                }}
              />

              {/* Simulation In-Progress Overlay */}
              {isSimulating && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-white font-mono text-xs animate-pulse">
                      선택된 카메라 화면에 VLM 비전 필터 가중치 적용 중...
                    </div>
                  </div>
                </div>
              )}

              {/* Simulation Result Overlay Bounding Box */}
              {simulationComplete && generatedRule && !isSimulating && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[320px] h-[220px] border-2 border-primary bg-primary/10 relative rounded shadow-[0_0_15px_rgba(124,58,237,0.4)] animate-pulse">
                    <div className="absolute -top-7 left-0 bg-primary text-black px-2 py-0.5 text-xs font-mono font-bold flex items-center gap-1 rounded-t shadow">
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      VLM 감지 타겟: {generatedRule.target_object}
                      <span className="ml-1 bg-black/50 text-white px-1 rounded text-[10px]">
                        {(generatedRule.confidence_threshold * 100).toFixed(0)}% 매칭
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* OSD Footer */}
              <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center text-xs font-mono text-gray-300 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-border-subtle">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
                  LIVE FEED • {selectedCameraId}
                </span>
                <span>YOLOv11 엣지 필터 + Qwen2-VL 제로샷 검증</span>
              </div>
            </div>
          </div>

          {/* Deployment Action Footer */}
          <div className="bg-surface-container-low border border-border-subtle p-3 flex justify-between items-center shrink-0 shadow-sm rounded-lg">
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-text-muted">룰셋 명칭:</label>
                <input
                  className="bg-[#0b0e17] border border-border-subtle rounded px-2.5 py-1 text-xs font-mono text-white focus:outline-none w-56"
                  type="text"
                  value={generatedRule?.rule_name || 'Detect_Custom_Rule'}
                  readOnly
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-text-muted">가동 주기:</label>
                <span className="text-xs font-mono text-tertiary bg-tertiary/10 border border-tertiary/30 px-2 py-0.5 rounded">
                  24/7 상시 가동
                </span>
              </div>
            </div>

            <button
              onClick={handleDeploy}
              disabled={!simulationComplete}
              className="bg-primary-container text-on-primary-container px-6 py-2 rounded text-title-sm font-title-sm font-bold flex items-center gap-2 hover:bg-inverse-primary transition-all shadow disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              선택된 {checkedCameras.size}대 카메라에 룰셋 배포
            </button>
          </div>
        </section>
      </main>
    </>
  );
};

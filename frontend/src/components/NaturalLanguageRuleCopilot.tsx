import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { API } from '../api/client';
export const NaturalLanguageRuleCopilot: React.FC = () => { 
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('입구 진입로에서 차량 흐름에 방해되는 차량을 식별하십시오. 특히 트럭이나 밴을 찾으시면 됩니다.');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [generatedRule, setGeneratedRule] = useState<any>(null);

  const handleSimulate = async () => {
    if (!prompt.trim()) return;
    setIsSimulating(true);
    setSimulationComplete(false);
    
    try {
      const data = await API.generateSopRule(prompt);
      if (data.status === 'SUCCESS') {
        setGeneratedRule(data.generated_rule);
        setSimulationComplete(true);
      }
    } catch (e) {
      console.error(e);
      alert("시뮬레이션에 실패했습니다.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDeploy = async () => {
    if (!generatedRule) return;
    try {
      await API.simulateEvent(generatedRule.rule_name, generatedRule.target_object);
      alert(`✅ [AI엣지 배포 완료]\n- 룰셋: ${generatedRule.rule_name}\n- 대상: ${generatedRule.target_object}\n\n모의 이벤트가 발생하여 관제 대시보드로 이동합니다.`);
      navigate('/events');
    } catch (e) {
      console.error(e);
      alert("배포에 실패했습니다.");
    }
  };

  return ( <>
<main className="flex-1 min-w-0 p-container-padding h-[calc(100vh-3.5rem)] flex gap-gutter bg-background overflow-hidden">
{/* Left: Target Camera List */}
<section className="w-[320px] bg-surface flex flex-col border border-border-subtle shadow-sm flex-shrink-0">
<div className="p-3 border-b border-border-subtle bg-surface-container-low flex items-center justify-between">
<h3 className="text-title-sm font-title-sm text-text-primary">대상 자산</h3>
<span className="material-symbols-outlined text-text-muted text-[18px]">filter_list</span>
</div>
<div className="p-2 border-b border-border-subtle">
<div className="relative">
<span className="material-symbols-outlined absolute left-2 top-1.5 text-text-muted text-[16px]">search</span>
<input className="w-full bg-background border border-border-subtle rounded px-8 py-1 text-body-sm text-text-primary focus:outline-none focus:border-primary" placeholder="카메라 검색..." type="text"/>
</div>
</div>
<div className="flex-1 overflow-y-auto p-1 flex flex-col gap-1">
{/* List Item */}
<label className="flex items-center gap-3 p-2 hover:bg-surface-variant cursor-pointer rounded border border-transparent hover:border-border-subtle transition-colors group">
<input defaultChecked="" className="form-checkbox bg-background border-border-subtle text-primary rounded-sm w-4 h-4 focus:ring-primary focus:ring-offset-0 focus:ring-offset-background" type="checkbox"/>
<div className="w-12 h-8 bg-surface-container-highest rounded border border-border-subtle relative overflow-hidden flex-shrink-0">
<img className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" data-alt="A low-resolution, monochrome thumbnail of an industrial gate security camera feed. The image shows a chain-link fence and a dark asphalt road under harsh artificial lighting. High contrast, gritty texture." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8w9P4q1VNKji2GLqwenU91ZxleVJDIpYLwl4GS6SgYyJnOVZSESD0WDwECkdcBtHnvda-cwraRav0zhTfIWUiwkOODrkIj-XFt0ZYdRwN9gx2ddWSwo9-SoD_gc0b58lI9KnC9wzt9i5xfwS3O_UlAQHlx0jAHNh7GcQRw-WFcnqM4dQ-ToJzw7rzAaiI9KaTgrdO2FI2uvN9LLJeakxJmiA3bNNk9WYOLW2SufgCEfzhH1mlKE4AJA"/>
</div>
<div className="flex flex-col overflow-hidden">
<span className="text-body-sm font-body-sm text-text-primary truncate">섹터 4 - 정문</span>
<span className="text-mono-data font-mono-data text-text-muted truncate">CAM-1042-EXT</span>
</div>
<div className="ml-auto w-2 h-2 rounded-full bg-tertiary shadow-[0_0_4px_#4edea3]"></div>
</label>
{/* List Item */}
<label className="flex items-center gap-3 p-2 hover:bg-surface-variant cursor-pointer rounded border border-transparent hover:border-border-subtle transition-colors group">
<input className="form-checkbox bg-background border-border-subtle text-primary rounded-sm w-4 h-4 focus:ring-primary focus:ring-offset-0 focus:ring-offset-background" type="checkbox"/>
<div className="w-12 h-8 bg-surface-container-highest rounded border border-border-subtle relative overflow-hidden flex-shrink-0">
<img className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" data-alt="A dark, grainy security camera thumbnail showing a deserted loading dock at night. Faint shadows of shipping containers are visible. Industrial, low-light ambiance." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwD0iaY-8htVz7RCjUIXlEW9IveKZz1YK8HS5j1L8a-8qHSig8bn6zGDmMs-BWhYhCyEZ7xd804T8ek-sfHH5UmUWNTxdZZ4clHLYGXS7imZFEtwrxBBM-Y6NSWlKJI88IdW2Axuz7xYHCz-yndPphYrxtjXGoIktNUxlVtMr_-P7DEfgwVGv10pqyNAamMX7mbSCNaSEet8NnUqWSaBN3SGV_TZ6Kf-J1kQAOpxWFb8A4tUZfUmYhyg"/>
</div>
<div className="flex flex-col overflow-hidden">
<span className="text-body-sm font-body-sm text-text-primary truncate">로딩 베이 B</span>
<span className="text-mono-data font-mono-data text-text-muted truncate">CAM-2091-INT</span>
</div>
<div className="ml-auto w-2 h-2 rounded-full bg-text-muted"></div>
</label>
</div>
</section>
{/* Right: Config Area */}
<section className="flex-1 flex flex-col gap-gutter min-w-0">
{/* VLA Prompt Input */}
<div className="bg-surface border border-border-subtle flex flex-col flex-shrink-0 shadow-sm">
<div className="px-4 py-2 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">smart_toy</span>
<h3 className="text-title-sm font-title-sm text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">자연어 관제 룰셋 코파일럿 콘솔</h3>
</div>
<span className="text-mono-data font-mono-data text-text-muted px-2 py-0.5 bg-background border border-border-subtle rounded">모델: Vision-Ops-v4</span>
</div>
<div className="p-4 flex flex-col gap-3">
<div className="flex gap-3">
<span className="material-symbols-outlined text-text-muted mt-1">account_circle</span>
<textarea 
  value={prompt}
  onChange={(e) => setPrompt(e.target.value)}
  className="w-full bg-background border border-border-subtle rounded p-3 text-body-base font-body-base text-text-primary focus:outline-none focus:border-primary resize-none h-24" 
  placeholder="감지하려는 동작이나 이상 징후를 설명하세요 (예: '사람이 울타리 근처에 30초 이상 머무르면 알림')..."
/>
</div>
<div className="flex justify-end ml-9">
  <button 
    onClick={handleSimulate}
    disabled={isSimulating || !prompt.trim()}
    className="bg-primary/20 text-primary border border-primary px-4 py-1.5 rounded text-sm font-bold flex items-center gap-2 hover:bg-primary/30 transition-colors disabled:opacity-50"
  >
    {isSimulating ? <span className="material-symbols-outlined animate-spin text-[16px]">sync</span> : <span className="material-symbols-outlined text-[16px]">science</span>}
    {isSimulating ? '검증 모델 구동 중...' : '제로샷 시뮬레이션 시작'}
  </button>
</div>
{/* AI Chat Bubble */}
{simulationComplete && generatedRule && (
  <div className="ml-9 p-3 rounded bg-background border-l-2 border-primary-container text-body-base font-body-base text-text-primary relative shadow-sm">
  <div className="absolute -left-3 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-primary-container border-b-[6px] border-b-transparent"></div>
  <p>알겠습니다. 대상 구역에서 클래스 및 동작 패턴을 필터링하여 <strong>{generatedRule.target_object}</strong> 감지를 위한 룰셋을 구성했습니다. 과거 데이터 기반의 제로샷 시뮬레이션 결과를 우측 뷰포트에 렌더링합니다.</p>
  <div className="mt-2 flex gap-2">
  <span className="px-2 py-1 bg-surface-variant border border-border-subtle rounded text-mono-data text-text-muted">신뢰도 임계값: {generatedRule.confidence_threshold * 100}%</span>
  <span className="px-2 py-1 bg-surface-variant border border-border-subtle rounded text-mono-data text-text-muted">예상 정확도: {generatedRule.estimated_accuracy}%</span>
  </div>
  </div>
)}
</div>
</div>
{/* Zero-shot Validation Viewport */}
<div className="flex-1 bg-surface border border-border-subtle flex flex-col relative overflow-hidden shadow-sm">
<div className="px-4 py-2 border-b border-border-subtle bg-surface-container-low flex justify-between items-center z-10">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-text-muted text-[18px]">history</span>
<h3 className="text-title-sm font-title-sm text-text-primary">제로샷 검증 뷰포트</h3>
</div>
<div className="flex items-center gap-2">
{isSimulating ? (
  <>
  <span className="w-2 h-2 rounded-full bg-warning shadow-[0_0_4px_#F59E0B] animate-pulse"></span>
  <span className="text-mono-data font-mono-data text-warning">시뮬레이션 중...</span>
  </>
) : simulationComplete ? (
  <>
  <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_4px_#7c3aed]"></span>
  <span className="text-mono-data font-mono-data text-primary">시뮬레이션 완료</span>
  </>
) : (
  <>
  <span className="w-2 h-2 rounded-full bg-text-muted"></span>
  <span className="text-mono-data font-mono-data text-text-muted">대기 중</span>
  </>
)}
</div>
</div>
{/* Video Cell */}
<div className="flex-1 bg-background relative overflow-hidden p-unit flex items-center justify-center">
<div className="w-full h-full relative border-2 border-primary shadow-[0_4px_12px_rgba(0,0,0,0.5)] bg-surface-dim overflow-hidden">
{/* Simulated Video Feed */}
<div className="w-full h-full bg-cover bg-center absolute inset-0 opacity-80" data-alt="A simulated security camera view of an industrial access road at dusk. The scene is slightly desaturated, emphasizing the stark lighting from overhead streetlamps. Several large trucks are visible on the road, with one appearing to face the wrong direction. The aesthetic is gritty and highly technical." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAud5shVbwuCqlsry2nHOGgr30rRVLcPfBZqFsQ_Avo4q2N3z7J251TTZxoPh9r2lejkT-nvFNYjpFm_cb8LnPUSyFSrMxrpUJdEbLZUv7OUJBVgAs2W6Z_ADHWyJkjSmFaqCQfpeRpS1VLBHxgcPPeIDt1CtKflW6i7bBKUCkAxHlltbSIkDvZlW_DL5mZCG40KVpiKE2yHAIEspT2aU5U8Z5HJhRhb-hwdfVXYtWcquIUHP9fZ9K9eg')" }}></div>
{/* OSD Overlays */}
{isSimulating ? (
<div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
  <div className="flex flex-col items-center gap-4">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    <div className="text-white font-mono-data animate-pulse">Vision-Ops 모델 가중치 적용 중...</div>
  </div>
</div>
) : simulationComplete ? (
<div className="absolute inset-0 pointer-events-none">
{/* ROI Box */}
<div className="absolute top-[20%] left-[10%] w-[80%] h-[60%] border border-dashed border-text-muted opacity-50"></div>
<span className="absolute top-[20%] left-[10%] bg-surface-dim/80 text-text-muted text-osd-label font-osd-label px-1 border border-text-muted">대상 구역: {prompt.includes('진입로') ? '진입로' : '전체 화면'}</span>
{/* AI Detection Box */}
<div className="absolute top-[45%] left-[60%] w-[15%] h-[20%] border-[1.5px] border-primary shadow-[0_0_8px_rgba(124,58,237,0.5)] flex flex-col justify-end animate-[pulse_2s_ease-in-out_infinite] group">
  <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
  <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
  <div className="bg-primary/20 backdrop-blur-sm p-1 border-t border-primary mt-auto transform transition-all duration-300">
    <div className="text-osd-label font-osd-label text-primary flex items-center gap-1">
      <span className="material-symbols-outlined text-[12px]">visibility</span>
      VLM: {generatedRule.target_object} 감지
    </div>
    <div className="text-mono-data font-mono-data text-white flex items-center justify-between">
      <span>매칭 스코어</span>
      <span className="text-primary font-bold">{(generatedRule.confidence_threshold * 100).toFixed(0)}%</span>
    </div>
  </div>
</div>
</div>
) : null}
{/* Video Controls Overlay */}
<div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-4 text-text-muted">
<span className="material-symbols-outlined hover:text-white cursor-pointer">play_arrow</span>
<div className="flex-1 h-1 bg-surface-variant rounded-full relative">
<div className="absolute top-0 left-0 h-full bg-primary w-[65%] rounded-full"></div>
<div className="absolute top-1/2 left-[65%] -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow cursor-pointer"></div>
</div>
<span className="text-mono-data font-mono-data">14:22:01 / -24H</span>
</div>
</div>
</div>
</div>
{/* Deployment Area */}
<div className="bg-surface border border-border-subtle p-4 flex justify-between items-end flex-shrink-0 shadow-sm">
<div className="flex gap-6 w-2/3">
<div className="flex flex-col gap-1 w-1/2">
<label className="text-label-caps font-label-caps text-text-muted">룰셋 배포 이름</label>
<input className="w-full bg-background border border-border-subtle rounded px-3 py-1.5 text-body-sm font-body-sm text-text-primary focus:outline-none focus:border-primary" type="text" value={generatedRule?.rule_name || "Detect_Custom_Rule_1"} readOnly/>
</div>
<div className="flex flex-col gap-1 w-1/2">
<label className="text-label-caps font-label-caps text-text-muted">활성 일정</label>
<select className="w-full bg-background border border-border-subtle rounded px-3 py-1.5 text-body-sm font-body-sm text-text-primary focus:outline-none focus:border-primary appearance-none" value={generatedRule?.schedule || "24/7"} readOnly>
<option value="24/7">항상 켜짐 (24/7)</option>
<option value="night">야간 (22:00 - 06:00)</option>
</select>
</div>
</div>
<button 
  onClick={handleDeploy}
  disabled={!simulationComplete}
  className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded text-title-sm font-title-sm font-bold flex items-center gap-2 hover:bg-primary-fixed transition-colors shadow-sm disabled:opacity-50"
>
<span className="material-symbols-outlined fill-icon text-[20px]">rocket_launch</span> 라이브 자산에 배포 </button>
</div>
</section>
</main> </> );
};

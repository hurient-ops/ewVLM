import React, { useState, useRef, useEffect } from 'react';
import { useEventLogStore, EventLog } from '../store/useEventLogStore';
import { useSopStore } from '../store/useSopStore';
import { API, syncDbEvents } from '../api/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
  cameraId?: string;
  snapshotBase64?: string;
}

export const MonitorBVlmAnalysis: React.FC = () => { 
  const { logs } = useEventLogStore();
  const { ruleTitle, actions, isSopActive, toggleAction } = useSopStore();
  
  // Camera selection & available list
  const [cameras, setCameras] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('cam-01');
  
  // VSS Chat state
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSnapshotModal, setSelectedSnapshotModal] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'ai',
      text: 'ewVLM 실시간 시맨틱 챗 준비 완료. 질문할 카메라를 선택하고 현장 상황을 자연어로 질의하십시오.',
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }).substring(0, 5)
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Selected incident report state (dynamic binding)
  const [selectedEvent, setSelectedEvent] = useState<EventLog | null>(null);

  // Fetch camera list and sync DB events on mount
  useEffect(() => {
    syncDbEvents();

    const fetchCameras = async () => {
      try {
        const res = await API.getCameras();
        if ((res.status === 'SUCCESS' || res.status === 'success') && Array.isArray(res.cameras) && res.cameras.length > 0) {
          const list = res.cameras.map((c: any) => ({
            id: c.camera_id || c.id,
            name: c.name || c.camera_id
          }));
          setCameras(list);
          setSelectedCameraId(list[0].id);
        } else {
          setCameras([
            { id: 'cam-01', name: '외곽 북측 펜스 (CAM-01)' },
            { id: 'cam-02', name: '중앙 로비 게이트 (CAM-02)' },
            { id: 'cam-03', name: '화물 하역장 (CAM-03)' },
            { id: 'cam-04', name: '서쪽 비상계단 (CAM-04)' }
          ]);
        }
      } catch (err) {
        console.warn('Failed to load cameras, fallback to defaults:', err);
        setCameras([
          { id: 'cam-01', name: '외곽 북측 펜스 (CAM-01)' },
          { id: 'cam-02', name: '중앙 로비 게이트 (CAM-02)' },
          { id: 'cam-03', name: '화물 하역장 (CAM-03)' },
          { id: 'cam-04', name: '서쪽 비상계단 (CAM-04)' }
        ]);
      }
    };
    fetchCameras();
  }, []);

  // When logs arrive or update, auto-select latest event if none or first
  useEffect(() => {
    if (logs.length > 0) {
      if (!selectedEvent || !logs.some(l => l.id === selectedEvent.id)) {
        setSelectedEvent(logs[0]);
      }
    }
  }, [logs, selectedEvent]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const currentTimestamp = new Date().toLocaleTimeString('ko-KR', { hour12: false }).substring(0, 5);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: queryText,
      timestamp: currentTimestamp,
      cameraId: selectedCameraId
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const res = await API.sendVlmChat(queryText, selectedCameraId);
      const aiReplyText = res.reply || '현장 영상 분석을 완료했습니다.';
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }).substring(0, 5),
        cameraId: selectedCameraId,
        snapshotBase64: res.snapshot_base64
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Failed to send VLM chat:', error);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'ai',
        text: 'VLM 분석 서버와 통신 중 오류가 발생했습니다. (백엔드 및 LM Studio 상태를 확인하세요)',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }).substring(0, 5),
        cameraId: selectedCameraId
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(chatInput);
  };

  const quickPrompts = [
    '현재 화면의 사람 및 차량 수 확인해 줘',
    '이상 행동이나 침입 정황이 있는지 요약해 줘',
    '바닥에 쓰러진 사람이나 위험 요소가 보여?'
  ];

  return (
    <>
      <main className="flex-1 p-container-padding flex gap-gutter h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Left Column (Cognitive Analytics) */}
        <section className="flex-1 flex flex-col gap-gutter min-w-0">
          {/* VLM Real-time Event Feed */}
          <div className="flex-[3] bg-surface rounded-DEFAULT border border-border-subtle flex flex-col overflow-hidden">
            <div className="px-3 py-2 bg-surface-container-low border-b border-border-subtle flex justify-between items-center">
              <h2 className="text-[14px] font-title-sm text-on-surface uppercase tracking-wider flex items-center whitespace-nowrap">
                <span className="material-symbols-outlined mr-2 text-primary" data-icon="timeline">timeline</span> VLM 실시간 이벤트 피드
              </h2>
              <span className="text-label-caps font-label-caps text-text-muted whitespace-nowrap ml-2">클릭 시 보고서 연동</span>
            </div>
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-2">
              {logs.map((log) => {
                const isSelected = selectedEvent?.id === log.id;
                if (log.level === 'critical') {
                  return (
                    <div 
                      key={log.id} 
                      onClick={() => setSelectedEvent(log)}
                      className={`bg-surface-container border ${isSelected ? 'border-primary ring-1 ring-primary shadow-lg' : 'border-danger'} rounded p-3 relative overflow-hidden group cursor-pointer transition-all duration-200 hover:scale-[1.01]`}
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-danger animate-pulse"></div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-mono-data font-mono-data text-danger font-bold flex items-center">
                          <span className="material-symbols-outlined text-sm mr-1 animate-pulse" data-icon="warning">warning</span> {log.timestamp} [{log.cameraId}]
                        </span>
                        <span className="text-label-caps font-label-caps bg-danger/20 text-danger px-2 py-0.5 rounded font-bold">심각</span>
                      </div>
                      <p className="text-body-base font-body-base text-on-surface">{log.message}</p>
                      <div className="mt-2 flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); window.location.href = '/event-review'; }}
                          className="bg-surface-container-highest hover:bg-surface-variant border border-border-subtle text-body-sm font-body-sm px-2 py-1 rounded transition-colors flex items-center"
                        >
                          <span className="material-symbols-outlined text-sm mr-1" data-icon="play_circle">play_circle</span> 재생
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedCameraId(log.cameraId); }}
                          className="bg-surface-container-highest hover:bg-surface-variant border border-border-subtle text-body-sm font-body-sm px-2 py-1 rounded transition-colors flex items-center text-primary"
                        >
                          <span className="material-symbols-outlined text-sm mr-1" data-icon="forum">forum</span> VSS 질의
                        </button>
                      </div>
                    </div>
                  );
                } else {
                  const borderColorClass = log.level === 'warning' ? 'border-l-warning' : 'border-l-secondary-container';
                  const textColorClass = log.level === 'warning' ? 'text-warning' : 'text-secondary-container';
                  const label = log.level === 'warning' ? '경고' : '정보';
                  
                  return (
                    <div 
                      key={log.id} 
                      onClick={() => setSelectedEvent(log)}
                      className={`bg-surface-container border ${isSelected ? 'border-primary ring-1 ring-primary' : 'border-border-subtle'} rounded p-2 border-l-2 ${borderColorClass} cursor-pointer hover:bg-surface-variant transition-colors`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-mono-data font-mono-data text-text-muted">{log.timestamp} [{log.cameraId}]</span>
                        <span className={`text-label-caps font-label-caps ${textColorClass}`}>{label}</span>
                      </div>
                      <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">{log.message}</p>
                    </div>
                  );
                }
              })}
            </div>
          </div>

          {/* SOP Compliance Guide */}
          <div className="flex-[2] bg-surface rounded-DEFAULT border border-border-subtle flex flex-col overflow-hidden">
            <div className="px-3 py-2 bg-surface-container-low border-b border-border-subtle">
              <h2 className="text-[14px] font-title-sm text-on-surface uppercase tracking-wider flex items-center whitespace-nowrap">
                <span className="material-symbols-outlined mr-2 text-primary" data-icon="assignment_turned_in">assignment_turned_in</span> SOP 준수 가이드
              </h2>
              <p className="text-body-sm font-body-sm text-text-muted mt-1">활성 프로토콜: {isSopActive ? ruleTitle : '대기 중 (위협 요소 없음)'}</p>
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between">
              <ul className="space-y-3">
                {!isSopActive || actions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-50 py-4">
                    <span className="material-symbols-outlined text-4xl mb-2" data-icon="check_circle">check_circle</span>
                    <p className="text-body-sm">진행 중인 대응 절차가 없습니다.</p>
                  </div>
                ) : (
                  actions.map((action, index) => (
                    <li 
                      key={index}
                      onClick={() => toggleAction(index)}
                      className={`flex items-center text-body-base font-body-base p-2 rounded cursor-pointer transition-colors ${action.isCompleted ? '' : 'bg-surface-container-highest border-l-2 border-primary hover:bg-surface-variant'}`}
                    >
                      <span className={`material-symbols-outlined mr-3 ${action.isCompleted ? 'text-tertiary' : 'text-primary animate-pulse'}`} data-icon={action.isCompleted ? "check_box" : "radio_button_checked"}>
                        {action.isCompleted ? "check_box" : "radio_button_checked"}
                      </span>
                      <span className={`text-on-surface ${action.isCompleted ? 'opacity-50 line-through' : 'font-semibold'}`}>
                        {index + 1}. {action.description}
                      </span>
                      {!action.isCompleted && (
                        <span className="ml-auto text-label-caps font-label-caps text-primary bg-primary/10 px-2 py-0.5 rounded">활성</span>
                      )}
                    </li>
                  ))
                )}
              </ul>
              <button className={`mt-4 w-full border font-title-sm text-[14px] py-3 rounded flex items-center justify-center transition-colors group ${isSopActive ? 'bg-danger/10 border-danger text-danger hover:bg-danger hover:text-white' : 'bg-surface-container border-border-subtle hover:bg-surface-variant text-text-muted cursor-not-allowed'}`}>
                <span className="material-symbols-outlined mr-2 transition-colors" data-icon="mic">mic</span> 마이크 방송 유지
              </button>
            </div>
          </div>
        </section>

        {/* Right Column (Intelligence & Reporting) */}
        <section className="flex-1 flex flex-col gap-gutter min-w-0">
          {/* VSS Semantic Chat */}
          <div className="flex-[3] bg-surface rounded-DEFAULT border border-border-subtle flex flex-col overflow-hidden">
            <div className="px-3 py-2 bg-surface-container-low border-b border-border-subtle flex justify-between items-center gap-2">
              <div className="flex items-center">
                <span className="material-symbols-outlined mr-2 text-primary-container" data-icon="forum">forum</span>
                <h2 className="text-[14px] font-title-sm text-on-surface uppercase tracking-wider whitespace-nowrap">
                  VSS 시맨틱 챗
                </h2>
              </div>

              {/* Real Camera Selector */}
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-[11px] text-text-muted font-mono-data hidden sm:inline">대상 카메라:</span>
                <select
                  value={selectedCameraId}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  className="bg-surface-container-highest border border-border-subtle text-primary font-bold text-xs rounded px-2.5 py-1 focus:outline-none focus:border-primary"
                >
                  {cameras.map((c) => (
                    <option key={c.id} value={c.id} className="bg-surface text-on-surface">
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-3 py-1.5 bg-surface-container-lowest border-b border-border-subtle flex gap-1.5 overflow-x-auto">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => sendQuery(qp)}
                  disabled={isTyping}
                  className="text-[11px] px-2.5 py-1 bg-surface-container rounded-full text-text-muted hover:text-white hover:bg-primary/20 border border-border-subtle whitespace-nowrap transition-colors"
                >
                  💬 {qp}
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
              {messages.map((msg) => (
                msg.role === 'user' ? (
                  <div key={msg.id} className="self-end max-w-[85%] bg-surface-container-highest p-3 rounded-l-lg rounded-tr-lg border border-border-subtle animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] text-primary font-bold font-mono">[{msg.cameraId || selectedCameraId}]</span>
                      <span className="text-[10px] text-text-muted">{msg.timestamp}</span>
                    </div>
                    <p className="text-body-sm font-body-sm text-on-surface">{msg.text}</p>
                  </div>
                ) : (
                  <div key={msg.id} className="self-start max-w-[90%] bg-surface-dim p-3 rounded-r-lg rounded-tl-lg border-l-2 border-primary-container animate-in fade-in slide-in-from-left-2">
                    <div className="flex items-center mb-2">
                      <span className="material-symbols-outlined text-primary-container text-sm mr-2" data-icon="smart_toy">smart_toy</span>
                      <span className="text-label-caps font-label-caps text-text-muted">VLM 어시스턴트 (Qwen2-VL)</span>
                      <span className="text-[10px] text-text-muted ml-auto">{msg.timestamp}</span>
                    </div>
                    <p className="text-mono-data font-mono-data text-on-surface-variant leading-relaxed mb-3 whitespace-pre-wrap">
                      {msg.text}
                    </p>
                    
                    {/* Real Captured Snapshot Image Thumbnail */}
                    {msg.snapshotBase64 && (
                      <div 
                        onClick={() => setSelectedSnapshotModal(`data:image/jpeg;base64,${msg.snapshotBase64}`)}
                        className="relative w-52 h-32 border border-border-subtle rounded overflow-hidden group cursor-pointer shadow-md bg-black"
                      >
                        <img 
                          alt="Real-time Live Frame" 
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                          src={`data:image/jpeg;base64,${msg.snapshotBase64}`}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-white text-3xl" data-icon="zoom_in">zoom_in</span>
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 text-[10px] text-primary font-mono-data rounded border border-border-subtle">
                          실시간 분석 프레임
                        </div>
                      </div>
                    )}
                  </div>
                )
              ))}
              
              {isTyping && (
                <div className="self-start bg-surface-dim p-3 rounded-r-lg rounded-tl-lg border-l-2 border-primary-container animate-in fade-in">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-text-muted mr-1">실시간 영상 판독 중...</span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="p-3 border-t border-border-subtle bg-surface-container-low flex items-center gap-2">
              <input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-surface border border-border-subtle rounded px-3 py-2 text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" 
                placeholder={`[${selectedCameraId}] 카메라 영상에 대해 무엇이든 질문하세요...`} 
                type="text"
              />
              <button 
                type="submit" 
                disabled={isTyping || !chatInput.trim()} 
                className="bg-primary-container hover:bg-inverse-primary disabled:opacity-50 text-white px-4 py-2 rounded transition-colors flex items-center justify-center shadow-md"
              >
                <span className="material-symbols-outlined text-sm mr-1" data-icon="send">send</span> 질의
              </button>
            </form>
          </div>

          {/* Incident Report (Auto-draft) - Dynamically Bound */}
          <div className="flex-[2] bg-surface rounded-DEFAULT border border-border-subtle flex flex-col overflow-hidden relative">
            <div className="px-3 py-2 bg-surface-container-low border-b border-border-subtle flex justify-between items-center">
              <h2 className="text-[14px] font-title-sm text-on-surface uppercase tracking-wider flex items-center whitespace-nowrap">
                <span className="material-symbols-outlined mr-2 text-primary" data-icon="description">description</span> 사건 보고서 (실시간 자동 초안)
              </h2>
              <span className="text-label-caps font-label-caps bg-surface-container-highest px-2 py-1 rounded text-primary font-mono border border-border-subtle whitespace-nowrap ml-2">
                ID: {selectedEvent ? (selectedEvent.escalationId || selectedEvent.id) : '대기 중'}
              </span>
            </div>
            <div className="flex-1 p-3 flex flex-col">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <span className="block text-label-caps font-label-caps text-text-muted mb-1">사건 발생 시간</span>
                  <span className="text-mono-data font-mono-data text-on-surface bg-surface-container px-2 py-1 rounded block border border-border-subtle">
                    {selectedEvent ? selectedEvent.timestamp : '현재 활성 이벤트 없음'}
                  </span>
                </div>
                <div>
                  <span className="block text-label-caps font-label-caps text-text-muted mb-1">감지 카메라</span>
                  <span className="text-mono-data font-mono-data text-on-surface bg-surface-container px-2 py-1 rounded block border border-border-subtle truncate">
                    {selectedEvent ? `${selectedEvent.cameraName} (${selectedEvent.cameraId})` : '선택 대기'}
                  </span>
                </div>
              </div>

              <div className="mb-2 flex-1 flex flex-col">
                <span className="block text-label-caps font-label-caps text-text-muted mb-1">사건 정황 분석 (VLM 자동 생성)</span>
                <textarea 
                  className="w-full flex-1 bg-surface-container border border-border-subtle rounded p-2 text-mono-data font-mono-data text-on-surface-variant focus:outline-none resize-none min-h-[60px]" 
                  readOnly
                  value={selectedEvent ? selectedEvent.message : '좌측 실시간 이벤트 피드에서 항목을 선택하면 VLM 추론 결과가 자동으로 입력됩니다.'}
                />
              </div>

              <div className="mb-3">
                <span className="block text-label-caps font-label-caps text-text-muted mb-1">권장 대응 조치</span>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent?.level === 'critical' ? (
                    <>
                      <span className="text-[11px] font-mono-data bg-danger/20 text-danger border border-danger/40 px-2 py-0.5 rounded font-bold">🚨 119/보안팀 즉각 출동</span>
                      <span className="text-[11px] font-mono-data bg-surface-container-highest text-on-surface px-2 py-0.5 rounded border border-border-subtle">현장 경고 방송 송출</span>
                      <span className="text-[11px] font-mono-data bg-surface-container-highest text-on-surface px-2 py-0.5 rounded border border-border-subtle">PTZ 추적 가동</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] font-mono-data bg-tertiary/20 text-tertiary border border-tertiary/40 px-2 py-0.5 rounded font-bold">🟢 정상 상황 (조치 불필요)</span>
                      <span className="text-[11px] font-mono-data bg-surface-container-highest text-text-muted px-2 py-0.5 rounded border border-border-subtle">상시 모니터링 유지</span>
                    </>
                  )}
                </div>
              </div>

              <button 
                onClick={() => alert(`사건 보고서 [${selectedEvent?.id || 'RPT-AUTO'}]가 정식 등록되었습니다.`)}
                className="w-full shrink-0 bg-primary-container text-white font-title-sm text-[14px] py-2 rounded flex items-center justify-center transition-all hover:bg-inverse-primary shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:shadow-[0_0_20px_rgba(124,58,237,0.6)] mt-auto whitespace-nowrap"
              >
                보고서 결재 및 전파 승인 <span className="material-symbols-outlined ml-2 text-sm" data-icon="upload">upload</span>
              </button>
            </div>
          </div>
        </section>

        {/* Snapshot Zoom Modal */}
        {selectedSnapshotModal && (
          <div 
            onClick={() => setSelectedSnapshotModal(null)}
            className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-in fade-in"
          >
            <div className="max-w-4xl max-h-[85vh] bg-surface border border-border-subtle rounded-lg overflow-hidden flex flex-col p-2">
              <div className="flex justify-between items-center mb-2 px-2">
                <span className="text-title-sm text-primary font-bold">실시간 분석 원본 프레임</span>
                <button 
                  onClick={() => setSelectedSnapshotModal(null)}
                  className="text-text-muted hover:text-white"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <img 
                src={selectedSnapshotModal} 
                alt="Enlarged Live Frame" 
                className="max-h-[75vh] object-contain rounded"
              />
            </div>
          </div>
        )}
      </main> 
    </> 
  );
};


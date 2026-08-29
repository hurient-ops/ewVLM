import React, { useEffect, useState } from 'react';
import { useEventLogStore, EventLog } from '../store/useEventLogStore';
import { API } from '../api/client';

export const EventReviewCenter: React.FC = () => {
  const { logs, setLogs } = useEventLogStore();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  useEffect(() => {
    API.fetchEvents(50).then(data => {
      if (data.status === 'success' && data.events) {
        const history: EventLog[] = data.events.map((ev: any) => ({
          id: `db-${ev.id}`,
          timestamp: ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString('ko-KR', { hour12: false }) : '',
          cameraId: ev.camera_id,
          cameraName: `Camera ${ev.camera_id}`,
          level: (ev.trigger_class.includes('collapsed') || ev.trigger_class.includes('fall')) ? 'critical' : 'warning',
          message: ev.semantic_caption || `${ev.trigger_class} 이벤트 발생`,
          confidence: ev.confidence,
          escalationId: ev.escalation_id
        }));
        setLogs(history);
      }
    }).catch(err => console.error('Failed to fetch event history:', err));
  }, [setLogs]);

  const handleLogClick = async (log: any) => {
    setActiveLogId(log.id);
    setLoadingReport(true);
    setSelectedReport(null);
    try {
      // Use escalationId if available, else fallback to log id
      const eventId = log.escalationId || log.id.replace('db-', '');
      const data = await API.getEventReport(eventId);
      if (data.report_text) {
        setSelectedReport(data.report_text);
      }
    } catch (e) {
      console.error(e);
      setSelectedReport("🚨 리포트를 불러오는데 실패했습니다.");
    } finally {
      setLoadingReport(false);
    }
  };

  const handleFeedback = async (isTruePositive: boolean) => {
    if (!activeLogId) return;
    
    try {
      const activeLog = logs.find(l => l.id === activeLogId);
      const eventId = activeLog?.escalationId || activeLogId.replace('db-', '');
      await API.submitEventFeedback(eventId, isTruePositive, isTruePositive ? "Verified by Operator" : "False Positive");
      
      // Remove from list
      const updatedLogs = logs.filter(l => l.id !== activeLogId);
      setLogs(updatedLogs);
      
      // Select next available or clear
      if (updatedLogs.length > 0) {
        handleLogClick(updatedLogs[0]);
      } else {
        setActiveLogId(null);
        setSelectedReport(null);
      }
      
      alert(isTruePositive ? "✅ VLM 모델에 '정답'으로 학습 피드백을 전송했습니다." : "❌ VLM 모델에 '오답(오탐)'으로 피드백을 전송하여 차후 필터링되도록 조치했습니다.");
      
    } catch (e) {
      console.error(e);
      alert("피드백 전송에 실패했습니다.");
    }
  };

  return (
    <div className="flex flex-1 h-full bg-background overflow-hidden relative">

      {/* LEFT PANEL: Pending Verification List */}
      <aside className="w-[340px] bg-surface flex flex-col shrink-0 border-r border-border-subtle z-10">
        <div className="h-10 bg-surface-container-low border-b border-border-subtle flex items-center px-4 shrink-0">
          <span className="text-[12px] font-bold text-text-muted uppercase tracking-widest">검토 대기열</span>
        </div>
        <div className="flex-1 overflow-y-auto pt-2">
          {logs.map((log) => (
            <div 
              key={log.id} 
              onClick={() => handleLogClick(log)}
              className={`p-3 border-b border-border-subtle cursor-pointer relative overflow-hidden group transition-colors ${log.level === 'critical' ? 'bg-warning/10 border-l-4 border-l-warning hover:bg-warning/20' : 'hover:bg-surface-container'} ${activeLogId === log.id ? 'bg-primary/20 border-l-4 border-l-primary' : ''}`}
            >
              <div className="flex gap-3">
                <div className="w-20 h-14 bg-black rounded shrink-0 overflow-hidden relative border border-border-subtle">
                  <video 
                    src="http://localhost:8000/api/v1/records/demo/stream" 
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" 
                  />
                  <div className="absolute top-0 right-0 bg-black/60 px-1 text-[9px] font-mono text-white">CH {log.cameraId.replace('CAM-', '')}</div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className={`text-[14px] font-bold line-clamp-2 ${log.level === 'critical' ? 'text-warning' : 'text-on-surface'}`}>{log.message}</span>
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
                      <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">videocam</span> {log.cameraName}</span>
                      <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">schedule</span> {log.timestamp}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${log.confidence > 0.9 ? 'bg-primary/20 text-primary' : 'bg-surface-dim text-text-muted'}`}>
                      {Math.round(log.confidence * 100)}% Match
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CENTER AREA: Matrix & Analysis */}
      <section className="flex-1 flex flex-col gap-[2px] p-[2px] overflow-hidden">
        {/* Matrix Viewport & Report */}
        <div className="flex-[3] flex gap-[2px]">
          <div className="flex-1 grid grid-rows-2 gap-[2px] bg-border-subtle relative">
            <div className="bg-black relative group overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center">
              <video 
                src="http://localhost:8000/api/v1/records/demo/stream" 
                controls 
                loop
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/60 px-2 rounded text-xs text-white">Playback: Reference (Live)</div>
            </div>
            <div className="bg-black relative group overflow-hidden border-2 border-warning shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center justify-center">
              {activeLogId ? (
                <>
                  <video 
                    src={`http://localhost:8000/api/v1/records/demo/stream?t=${activeLogId}`} 
                    controls 
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                  />
                  {/* Bounding Box overlay for event */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[35%] left-[45%] w-[20%] h-[30%] border-2 border-warning bg-warning/20 animate-pulse">
                      <span className="absolute -top-5 left-[-2px] bg-warning text-black text-[10px] font-mono px-2 py-0.5 font-bold">DETECTED EVENT</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 font-mono text-sm flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl">movie</span>
                  사건 기록을 선택하여 NVR 녹화 영상 및 VLM 분석 결과 확인
                </div>
              )}
              <div className="absolute top-2 left-2 bg-warning px-2 rounded text-xs text-black font-bold">Event NVR Playback & Analytics</div>
            </div>
          </div>

          {/* AI Report Panel */}
          <div className="w-[400px] bg-surface flex flex-col border-l border-border-subtle shrink-0 shadow-lg">
             <div className="h-10 bg-surface-container-highest border-b border-border-subtle flex items-center px-4 shrink-0 gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">summarize</span>
                <span className="text-[14px] font-bold text-on-surface">AI Incident Report</span>
             </div>
             <div className="flex-1 p-5 overflow-y-auto bg-[#070A13]">
                {loadingReport ? (
                  <div className="flex flex-col items-center justify-center h-full text-primary gap-3">
                    <span className="material-symbols-outlined animate-spin text-[32px]">hourglass_empty</span>
                    <span className="text-sm font-mono">VLM 모델 추론 중...</span>
                  </div>
                ) : selectedReport ? (
                  <div className="text-[#E2E8F0] whitespace-pre-wrap font-mono text-[13px] leading-relaxed">
                    {selectedReport}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-text-muted gap-2">
                    <span className="material-symbols-outlined text-[48px] opacity-50">fact_check</span>
                    <p className="text-sm">좌측 타임라인에서 이벤트를 선택하면 AI 자동 생성 리포트가 표시됩니다.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
        {/* Bottom Panel: Action */}
        <div className="h-16 bg-surface-container border-t border-border-subtle flex justify-between items-center px-4 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-danger text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <div className="flex flex-col">
              <span className="text-[16px] font-semibold text-on-surface">조치 필요</span>
              <span className="text-[13px] text-text-muted">프로토콜을 트리거하려면 VLM 감지를 확인하세요.</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => handleFeedback(false)}
              disabled={!activeLogId}
              className="px-6 py-2 border border-border-subtle text-text-primary text-[16px] font-semibold rounded hover:bg-surface-container-high transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">block</span> 무시 (오탐)
            </button>
            <button 
              onClick={() => handleFeedback(true)}
              disabled={!activeLogId}
              className="px-8 py-2 bg-danger text-[#ffdad6] text-[16px] font-semibold rounded hover:brightness-110 transition-all flex items-center gap-2 uppercase tracking-wide disabled:opacity-50 disabled:grayscale"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> 검증: 실제 이벤트
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

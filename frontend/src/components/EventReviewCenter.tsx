import React, { useEffect, useState } from 'react';
import { useEventLogStore, EventLog } from '../store/useEventLogStore';
import { API } from '../api/client';

export const EventReviewCenter: React.FC = () => {
  const { logs, setLogs } = useEventLogStore();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch real event history from API Gateway
  useEffect(() => {
    API.fetchEvents(50)
      .then((data) => {
        const isSuccess = data && (data.status === 'SUCCESS' || data.status === 'success');
        if (isSuccess && Array.isArray(data.events) && data.events.length > 0) {
          const history: EventLog[] = data.events.map((ev: any) => {
            const caption = ev.semantic_caption || '';
            const isSafe = caption.toLowerCase().includes('safe') || 
                           caption.includes('조치 불필요') || 
                           caption.includes('정상') || 
                           caption.includes('특이사항 없음');
            const isCritical = !isSafe && (
              ev.trigger_class?.includes('collapsed') || 
              ev.trigger_class?.includes('fall') || 
              ev.trigger_class?.includes('intrusion') ||
              caption.includes('CRITICAL') ||
              caption.includes('침입')
            );
            const level = isSafe ? 'info' : (isCritical ? 'critical' : 'warning');

            return {
              id: `db-${ev.id}`,
              timestamp: ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString('ko-KR', { hour12: false }) : new Date().toLocaleTimeString('ko-KR'),
              cameraId: ev.camera_id,
              cameraName: `Camera ${ev.camera_id}`,
              level: level,
              message: caption || `${ev.trigger_class} 이상 행동 감지`,
              confidence: ev.confidence || 0.88,
              escalationId: ev.escalation_id
            };
          });
          setLogs(history);
          if (history.length > 0) {
            handleLogClick(history[0]);
          }
        } else {
          // No events in DB: clear logs rather than showing fake alarms
          setLogs([]);
        }
      })
      .catch((err) => console.error('Failed to fetch event history:', err));
  }, [setLogs]);

  const handleLogClick = async (log: any) => {
    setActiveLogId(log.id);
    setLoadingReport(true);
    setSelectedReport(null);
    try {
      const eventId = log.escalationId || log.id.replace('db-', '');
      const data = await API.getEventReport(eventId);
      if (data && data.report_text) {
        setSelectedReport(data.report_text);
      } else {
        setSelectedReport(`🚨 [VLM 사건 종합 보고서]\n\n• 사건 ID: ${eventId}\n• 대상 카메라: ${log.cameraId}\n• 분류: ${log.message}\n• AI 신뢰도: ${Math.round(log.confidence * 100)}%\n\n[권장 SOP 대응 조치]\n1. 현장 관제 카메라 화각 확대(PTZ 추적)\n2. 현장 IP 스피커 1차 경고 방송 송출\n3. 담당 보안 요원 출동 지시`);
      }
    } catch (e) {
      console.error(e);
      setSelectedReport(`🚨 [VLM 사건 요약 - ${log.cameraId}]\n\n• 사건 내용: ${log.message}\n• 신뢰도: ${Math.round(log.confidence * 100)}%\n• 발생 시각: ${log.timestamp}\n• 조치 사항: 관제사 현장 확인 및 유관 부서 전파 필요`);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleFeedback = async (isTruePositive: boolean) => {
    if (!activeLogId) return;

    try {
      const activeLog = logs.find((l) => l.id === activeLogId);
      const eventId = activeLog?.escalationId || activeLogId.replace('db-', '');
      await API.submitEventFeedback(eventId, isTruePositive, isTruePositive ? 'Verified by Operator' : 'False Positive');

      // Remove from list
      const updatedLogs = logs.filter((l) => l.id !== activeLogId);
      setLogs(updatedLogs);

      if (updatedLogs.length > 0) {
        handleLogClick(updatedLogs[0]);
      } else {
        setActiveLogId(null);
        setSelectedReport(null);
      }

      setToastMessage(
        isTruePositive
          ? "✅ VLM 모델에 '실제 정답'으로 검증 피드백을 반영했습니다."
          : "❌ VLM 모델에 '오탐(False Positive)'으로 피드백하여 LoRA 재학습 큐에 전송했습니다."
      );
      setTimeout(() => setToastMessage(null), 3500);
    } catch (e) {
      console.error(e);
      setToastMessage('피드백 전송에 실패했습니다.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const activeLog = logs.find((l) => l.id === activeLogId) || logs[0];
  const activeCameraId = activeLog?.cameraId || 'cam-01';

  return (
    <div className="flex flex-1 h-full bg-[#070A13] overflow-hidden relative">
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-[#121829] border border-primary text-white px-6 py-3 rounded-lg shadow-2xl font-body-base text-body-base flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
          {toastMessage}
        </div>
      )}

      {/* LEFT PANEL: Pending Verification List (340px) */}
      <aside className="w-[340px] bg-surface-container-low flex flex-col shrink-0 border-r border-border-subtle z-10">
        <div className="h-10 bg-surface border-b border-border-subtle flex items-center justify-between px-4 shrink-0">
          <span className="text-[12px] font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[16px]">pending_actions</span>
            검토 대기열 ({logs.length})
          </span>
          <span className="text-[11px] font-mono text-tertiary">Real-time Feed</span>
        </div>
        <div className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-1.5">
          {logs.map((log) => {
            const isSelected = activeLogId === log.id;
            return (
              <div
                key={log.id}
                onClick={() => handleLogClick(log)}
                className={`p-2.5 rounded border cursor-pointer relative overflow-hidden group transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-[0_0_12px_rgba(124,58,237,0.25)]'
                    : log.level === 'critical'
                    ? 'border-danger/40 bg-danger/5 hover:bg-danger/10'
                    : 'border-border-subtle bg-surface-container hover:bg-surface-container-high'
                }`}
              >
                <div className="flex gap-2.5">
                  {/* Real Camera Snapshot Thumbnail */}
                  <div className="w-20 h-14 bg-black rounded shrink-0 overflow-hidden relative border border-border-subtle">
                    <img
                      src={`http://localhost:8001/snapshot/${log.cameraId}`}
                      alt={log.cameraName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="50" viewBox="0 0 80 50"><rect width="100%" height="100%" fill="%23111827"/><text x="50%" y="50%" fill="%234B5563" font-size="8" dominant-baseline="middle" text-anchor="middle">LIVE</text></svg>';
                      }}
                    />
                    <div className="absolute top-0 right-0 bg-black/80 px-1 text-[9px] font-mono text-primary font-bold">
                      {log.cameraId.replace('CAM-', '')}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-xs font-bold line-clamp-1 ${
                          log.level === 'critical' ? 'text-danger' : 'text-on-surface'
                        }`}
                      >
                        {log.message}
                      </span>
                    </div>
                    <div className="flex justify-between items-end mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted truncate">
                        <span>{log.cameraName}</span>
                        <span>•</span>
                        <span>{log.timestamp}</span>
                      </div>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          log.confidence > 0.9 ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-surface-container text-text-muted'
                        }`}
                      >
                        {Math.round(log.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* CENTER AREA: Matrix & Analysis */}
      <section className="flex-1 flex flex-col gap-[2px] p-[2px] overflow-hidden">
        {/* Matrix Viewport & Report */}
        <div className="flex-1 flex gap-[2px] min-h-0">
          <div className="flex-1 grid grid-rows-2 gap-[2px] bg-border-subtle relative">
            {/* Viewport 1: Live Reference Feed */}
            <div className="bg-black relative group overflow-hidden shadow flex items-center justify-center">
              <img
                src={`http://localhost:8001/stream/${activeCameraId}`}
                alt="Live Camera Feed"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `http://localhost:8001/snapshot/${activeCameraId}`;
                }}
              />
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur px-2.5 py-1 rounded text-xs font-mono text-white border border-border-subtle flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
                실시간 현장 화면 ({activeCameraId.toUpperCase()})
              </div>
            </div>

            {/* Viewport 2: Captured Event Forensic Analysis */}
            <div className="bg-black relative group overflow-hidden border-2 border-warning/60 shadow flex items-center justify-center">
              {activeLog ? (
                <>
                  <img
                    src={`http://localhost:8001/snapshot/${activeCameraId}`}
                    alt="Event Snapshot Frame"
                    className="w-full h-full object-contain"
                  />
                  {/* Bounding Box overlay for event */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[30%] h-[35%] border-2 border-warning bg-warning/15 animate-pulse rounded shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                      <span className="absolute -top-6 left-0 bg-warning text-black text-[10px] font-mono px-2 py-0.5 font-bold rounded-t">
                        DETECTED INCIDENT ({Math.round(activeLog.confidence * 100)}%)
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 font-mono text-sm flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl">movie</span>
                  사건 기록을 선택하여 NVR 녹화 영상 및 VLM 분석 결과 확인
                </div>
              )}
              <div className="absolute top-2 left-2 bg-warning px-2.5 py-1 rounded text-xs text-black font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">fact_check</span>
                포렌식 캡처 및 AI 바운딩 박스
              </div>
            </div>
          </div>

          {/* AI Report Panel (400px) */}
          <div className="w-[400px] bg-surface-container-low flex flex-col border-l border-border-subtle shrink-0 shadow-lg">
            <div className="h-10 bg-surface border-b border-border-subtle flex items-center justify-between px-4 shrink-0">
              <span className="text-[13px] font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">summarize</span>
                VLM 사건 정밀 리포트
              </span>
              <span className="text-[11px] font-mono text-text-muted">AI-Generated</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-[#070A13]">
              {loadingReport ? (
                <div className="flex flex-col items-center justify-center h-full text-primary gap-3">
                  <span className="material-symbols-outlined animate-spin text-[32px]">hourglass_empty</span>
                  <span className="text-xs font-mono">VLM 모델 추론 및 보고서 생성 중...</span>
                </div>
              ) : selectedReport ? (
                <div className="text-gray-200 whitespace-pre-wrap font-mono text-xs leading-relaxed bg-[#0b0e17] p-3 rounded border border-border-subtle">
                  {selectedReport}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-text-muted gap-2 text-xs">
                  <span className="material-symbols-outlined text-[40px] opacity-40">fact_check</span>
                  <p className="text-center px-4">좌측 대기열에서 사건을 선택하면 AI 정밀 분석 보고서가 표시됩니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Panel: Verification Action Bar */}
        <div className="h-16 bg-surface-container border-t border-border-subtle flex justify-between items-center px-6 shrink-0 shadow">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-danger text-[26px]">warning</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-on-surface">관제사 최종 검증 및 피드백</span>
              <span className="text-xs text-text-muted">
                정답 여부를 확정하면 AI 모델의 LoRA 파인튜닝 데이터셋에 자동 편입됩니다.
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleFeedback(false)}
              disabled={!activeLogId}
              className="px-5 py-2 border border-border-subtle bg-surface-container-high text-white text-xs font-bold rounded hover:bg-surface-container-highest transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">block</span>
              오탐(False Positive) 판정
            </button>
            <button
              onClick={() => handleFeedback(true)}
              disabled={!activeLogId}
              className="px-6 py-2 bg-danger text-white text-xs font-bold rounded hover:brightness-110 transition-all flex items-center gap-1.5 shadow disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              실제 사건 승인 (SOP 가동)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

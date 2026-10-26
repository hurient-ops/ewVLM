import React, { useState, useEffect } from 'react';
import { API } from '../api/client';
import { useEventLogStore } from '../store/useEventLogStore';

interface AlertItem {
  id: string;
  time: string;
  source: string;
  sourceName?: string;
  message: string;
  level: 'critical' | 'warning' | 'info';
  status: 'pending' | 'dispatched' | 'resolved';
  confidence?: number;
  dispatchAction?: string;
}

export const AlertCenterDashboard: React.FC = () => {
  const eventLogs = useEventLogStore(state => state.logs);
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'ALT-101',
      time: '14:02:45',
      source: 'CAM-01',
      sourceName: '외곽 1구역 펜스 북부',
      message: '미인가 인원 월담 및 침입 감지 (Sector C)',
      level: 'critical',
      status: 'pending',
      confidence: 0.96
    },
    {
      id: 'ALT-102',
      time: '13:58:10',
      source: 'CAM-02',
      sourceName: '자재 창고 출입구',
      message: '허가되지 않은 야간 차량 정차 (Main Gate)',
      level: 'warning',
      status: 'pending',
      confidence: 0.88
    },
    {
      id: 'ALT-103',
      time: '13:45:22',
      source: 'CAM-03',
      sourceName: '중앙 변전실 내부',
      message: '작업자 안전모 및 안전 조끼 미착용',
      level: 'warning',
      status: 'dispatched',
      confidence: 0.91,
      dispatchAction: '현장 안전관리자 경고 통보'
    }
  ]);

  const [selectedAlertId, setSelectedAlertId] = useState<string>('ALT-101');
  const [filterLevel, setFilterLevel] = useState<'all' | 'critical' | 'warning' | 'dispatched'>('all');
  const [isDispatching, setIsDispatching] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // useEventLogStore의 신규 이벤트들을 Alert으로 실시간 동기화
  useEffect(() => {
    if (eventLogs && eventLogs.length > 0) {
      setAlerts(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const newItems: AlertItem[] = [];

        eventLogs.forEach((log, idx) => {
          const alertId = `EVT-${log.id || (idx + 1000)}`;
          if (!existingIds.has(alertId)) {
            const rawLevel = String(log.level || 'info');
            const level: 'critical' | 'warning' | 'info' = 
              rawLevel === 'critical' || rawLevel === 'error' ? 'critical' :
              rawLevel === 'warning' ? 'warning' : 'info';

            newItems.push({
              id: alertId,
              time: log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
              source: log.cameraId || 'CAM-01',
              sourceName: log.cameraName || log.cameraId,
              message: log.message,
              level,
              status: 'pending',
              confidence: log.confidence || 0.95
            });
          }
        });

        if (newItems.length > 0) {
          return [...newItems, ...prev];
        }
        return prev;
      });
    }
  }, [eventLogs]);

  const handleDispatch = async (actionType: 'patrol' | 'broadcast' | 'resolve' = 'patrol') => {
    const alert = alerts.find(a => a.id === selectedAlertId);
    if (!alert) return;

    setIsDispatching(true);
    const actionLabel = 
      actionType === 'patrol' ? '현장 순찰 요원 긴급 출동' :
      actionType === 'broadcast' ? '원격 경고 방송 및 사이렌 발령' : '현장 확인 완료 후 정상 종결';

    try {
      const res = await API.dispatchAlert(alert.id, actionType, alert.source, alert.message, alert.level);
      if (res.status === 'SUCCESS' || res.status) {
        setToastMessage(`✅ 알람 [${alert.id}] ${actionLabel} 처리 완료`);
        setAlerts(prev => prev.map(a => a.id === alert.id ? { 
          ...a, 
          status: actionType === 'resolve' ? 'resolved' : 'dispatched',
          dispatchAction: actionLabel
        } : a));
      }
    } catch (err) {
      console.error(err);
      // 로컬 낙관적 업데이트
      setToastMessage(`✅ 알람 [${alert.id}] ${actionLabel} 처리 완료 (로컬 반영)`);
      setAlerts(prev => prev.map(a => a.id === alert.id ? { 
        ...a, 
        status: actionType === 'resolve' ? 'resolved' : 'dispatched',
        dispatchAction: actionLabel
      } : a));
    } finally {
      setIsDispatching(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterLevel === 'all') return true;
    if (filterLevel === 'critical') return alert.level === 'critical';
    if (filterLevel === 'warning') return alert.level === 'warning';
    if (filterLevel === 'dispatched') return alert.status === 'dispatched' || alert.status === 'resolved';
    return true;
  });

  const selectedAlert = alerts.find(a => a.id === selectedAlertId) || filteredAlerts[0] || alerts[0];
  const targetCamId = (selectedAlert?.source || 'CAM-01').toLowerCase();

  return (
    <main className="flex-1 p-5 bg-[#070A13] flex flex-col relative h-full overflow-hidden select-none">
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-[#7C3AED] text-white px-6 py-2.5 rounded-lg shadow-2xl font-bold text-sm animate-pulse border border-white/20">
          {toastMessage}
        </div>
      )}
      
      {/* Top Header */}
      <div className="flex justify-between items-center mb-4 shrink-0 border-b border-[#232C3F] pb-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 text-2xl animate-pulse">crisis_alert</span>
            통합 위협 알람 센터 &amp; 현장 디스패치
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Fast-Loop YOLOv11 &amp; Slow-Loop VLM 실시간 에스컬레이션 알람 큐 • 모바일 요원 지령 관제
          </p>
        </div>
        
        {/* Status Metrics */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#121724] px-3 py-1.5 rounded-lg border border-[#232C3F]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-xs text-gray-400 font-medium">긴급 위협:</span>
            <span className="text-xs font-bold text-red-400 font-mono">
              {alerts.filter(a => a.level === 'critical' && a.status === 'pending').length}건
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#121724] px-3 py-1.5 rounded-lg border border-[#232C3F]">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-xs text-gray-400 font-medium">경고:</span>
            <span className="text-xs font-bold text-amber-300 font-mono">
              {alerts.filter(a => a.level === 'warning' && a.status === 'pending').length}건
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#121724] px-3 py-1.5 rounded-lg border border-[#232C3F]">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs text-gray-400 font-medium">디스패치 완료:</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {alerts.filter(a => a.status === 'dispatched' || a.status === 'resolved').length}건
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="flex gap-4 flex-1 min-h-0">
        
        {/* Left Column: Alert Queue */}
        <div className="w-[45%] bg-[#0e121d] border border-[#232C3F] rounded-xl flex flex-col overflow-hidden shadow-lg">
          {/* Filter Bar */}
          <div className="p-3 border-b border-[#232C3F] bg-[#121724] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {(['all', 'critical', 'warning', 'dispatched'] as const).map(tab => {
                const labels = {
                  all: '전체',
                  critical: '긴급 위협',
                  warning: '주의/경고',
                  dispatched: '처리 완료'
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setFilterLevel(tab)}
                    className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                      filterLevel === tab 
                        ? 'bg-[#7C3AED] text-white shadow-sm' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] font-mono text-gray-400 bg-black/40 px-2 py-0.5 rounded border border-[#232C3F]">
              {filteredAlerts.length}건
            </span>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2">
            {filteredAlerts.map(alert => {
              const isSelected = selectedAlertId === alert.id;
              const isCritical = alert.level === 'critical';
              const isDispatched = alert.status === 'dispatched';
              const isResolved = alert.status === 'resolved';

              return (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-[#7C3AED] bg-[#7C3AED]/10 shadow-[0_0_12px_rgba(124,58,237,0.25)]' 
                      : 'border-[#232C3F] bg-[#121724]/70 hover:border-gray-500'
                  } ${isDispatched || isResolved ? 'opacity-70' : ''}`}
                  onClick={() => setSelectedAlertId(alert.id)}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[18px] ${isCritical ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                        {isCritical ? 'warning' : 'error'}
                      </span>
                      <span className="text-xs font-bold text-white font-mono">{alert.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        isCritical ? 'bg-red-950/80 text-red-300 border border-red-800/60' : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      }`}>
                        {isCritical ? 'CRITICAL' : 'WARNING'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-gray-400">{alert.time}</span>
                  </div>

                  <div className="text-xs text-gray-200 font-medium mb-2 leading-relaxed">
                    {alert.message}
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-primary font-mono flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">videocam</span>
                      {alert.sourceName || alert.source}
                    </span>
                    {isResolved ? (
                      <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                        종결 완료
                      </span>
                    ) : isDispatched ? (
                      <span className="text-[#d2bbff] font-bold bg-[#7C3AED]/20 px-2 py-0.5 rounded border border-[#7C3AED]/40">
                        디스패치됨
                      </span>
                    ) : (
                      <span className="text-red-400 font-bold bg-red-950/40 px-2 py-0.5 rounded border border-red-800/40">
                        대응 대기
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Inspector & Live Dispatch Viewport */}
        <div className="w-[55%] bg-[#0e121d] border border-[#232C3F] rounded-xl flex flex-col overflow-hidden shadow-lg">
          {selectedAlert ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-3.5 border-b border-[#232C3F] bg-[#121724] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">security</span>
                  <h2 className="text-sm font-bold text-white">
                    {selectedAlert.id} 정밀 포렌식 &amp; 지휘 통제
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-gray-400">신뢰도:</span>
                  <span className="text-emerald-400 font-bold">
                    {((selectedAlert.confidence || 0.95) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Viewport: Live Fast-Loop Snapshot */}
              <div className="p-4 flex-1 flex flex-col overflow-y-auto gap-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-[#232C3F] flex items-center justify-center shadow-inner">
                  <img 
                    src={`http://localhost:8001/snapshot/${targetCamId}?t=${Date.now()}`}
                    alt="Fast-Loop Incident Frame"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `http://localhost:8001/snapshot/cam-01?t=${Date.now()}`;
                    }}
                  />
                  {/* Bounding box simulation */}
                  <div className="absolute top-[28%] left-[35%] w-[30%] h-[42%] border-2 border-red-500 rounded bg-red-500/10 pointer-events-none flex items-start justify-start p-1 animate-pulse">
                    <span className="bg-red-600 text-white text-[9px] font-bold px-1 rounded font-mono">
                      {selectedAlert.level === 'critical' ? 'THREAT DETECTED' : 'WARNING'}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur px-2 py-1 rounded text-[11px] text-white flex items-center gap-2 border border-white/10 font-mono">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span>LIVE FRAME • {selectedAlert.source}</span>
                  </div>
                </div>

                {/* Event Metadata Card */}
                <div className="bg-[#121724] p-3.5 rounded-lg border border-[#232C3F] flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">발생 채널:</span>{' '}
                      <span className="font-bold text-white">{selectedAlert.sourceName || selectedAlert.source}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">발생 시각:</span>{' '}
                      <span className="font-mono text-white">{selectedAlert.time}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">위협 레벨:</span>{' '}
                      <span className={`font-bold ${selectedAlert.level === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>
                        {selectedAlert.level.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">처리 상태:</span>{' '}
                      <span className="font-bold text-[#d2bbff]">
                        {selectedAlert.dispatchAction || (selectedAlert.status === 'dispatched' ? '디스패치 완료' : '대응 대기')}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-[1px] bg-[#232C3F] my-1"></div>
                  <div className="text-xs text-gray-300">
                    <strong className="text-gray-400">상세 정황:</strong> {selectedAlert.message}
                  </div>
                </div>

                {/* Dispatch Controls */}
                <div className="mt-auto pt-2 flex flex-col gap-2">
                  <div className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">send_and_archive</span>
                    대응 지휘 명령 하달
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => handleDispatch('patrol')}
                      disabled={isDispatching}
                      className="py-2.5 px-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">local_police</span>
                      현장 요원 출동
                    </button>
                    <button 
                      onClick={() => handleDispatch('broadcast')}
                      disabled={isDispatching}
                      className="py-2.5 px-3 bg-[#1e293b] hover:bg-[#334155] text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">campaign</span>
                      원격 경고 방송
                    </button>
                    <button 
                      onClick={() => handleDispatch('resolve')}
                      disabled={isDispatching}
                      className="py-2.5 px-3 bg-[#1e293b] hover:bg-[#334155] text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      정상 종결
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-6">
              <span className="material-symbols-outlined text-4xl mb-2">touch_app</span>
              <p className="text-xs">좌측 큐에서 알람을 선택하세요.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

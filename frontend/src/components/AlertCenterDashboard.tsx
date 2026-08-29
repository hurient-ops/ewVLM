import React, { useState } from 'react';
import { API } from '../api/client';

export const AlertCenterDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState([
    { id: 'ALT-101', time: '14:02:45', source: 'CAM-012', message: '미인가 인원 감지 (Sector C)', level: 'critical', status: 'pending' },
    { id: 'ALT-102', time: '13:58:10', source: 'CAM-045', message: '차량 과속 감지 (Main Gate)', level: 'warning', status: 'pending' },
  ]);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDispatch = async () => {
    if (!selectedAlert) return;
    const alert = alerts.find(a => a.id === selectedAlert);
    if (!alert) return;

    setIsDispatching(true);
    try {
      const res = await API.dispatchAlert(alert.id, 'investigate', alert.source, alert.message, alert.level);
      if (res.status === 'SUCCESS') {
        setToastMessage(`✅ 알람 ${alert.id} 현장 요원에게 디스패치 완료.`);
        setAlerts(alerts.map(a => a.id === alert.id ? { ...a, status: 'dispatched' } : a));
      }
    } catch (err) {
      console.error(err);
      setToastMessage('❌ 디스패치 중 오류 발생');
    } finally {
      setIsDispatching(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <main className="flex-1 p-container-padding bg-[#070A13] flex flex-col relative h-full">
      {toastMessage && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-primary-container text-white px-6 py-3 rounded shadow-2xl font-body-base animate-pulse">
          {toastMessage}
        </div>
      )}
      
      <div className="flex justify-between items-end mb-4 shrink-0">
        <div>
          <h1 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-danger">gpp_maybe</span> 통합 알람 센터
          </h1>
          <p className="text-body-base font-body-base text-text-muted mt-1">실시간 위협 알람 큐 및 현장 디스패치 관리</p>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Alert Queue */}
        <div className="w-1/2 bg-surface border border-border-subtle rounded-lg flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border-subtle bg-surface-container-low">
            <h3 className="text-label-caps text-on-surface">활성 알람 큐</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
            {alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`p-3 rounded border cursor-pointer transition-colors ${selectedAlert === alert.id ? 'border-primary bg-primary/10' : 'border-border-subtle bg-surface-container-high hover:border-outline-variant'} ${alert.status === 'dispatched' ? 'opacity-50' : ''}`}
                onClick={() => setSelectedAlert(alert.id)}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-sm ${alert.level === 'critical' ? 'text-danger' : 'text-warning'}`}>
                      {alert.level === 'critical' ? 'warning' : 'error'}
                    </span>
                    <span className="text-title-sm text-on-surface">{alert.id}</span>
                  </div>
                  <span className="text-mono-data text-text-muted">{alert.time}</span>
                </div>
                <div className="text-body-sm text-text-muted mb-2">{alert.message}</div>
                <div className="flex justify-between items-center">
                  <span className="text-mono-data text-primary text-[10px]">{alert.source}</span>
                  {alert.status === 'dispatched' && (
                    <span className="text-[10px] text-tertiary font-bold bg-tertiary/10 px-2 py-0.5 rounded">디스패치 완료</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inspector & Dispatch */}
        <div className="w-1/2 bg-surface border border-border-subtle rounded-lg flex flex-col overflow-hidden">
          {selectedAlert ? (() => {
            const alert = alerts.find(a => a.id === selectedAlert);
            return (
              <div className="p-6 flex flex-col h-full">
                <h2 className="text-headline-sm text-on-surface mb-2">{alert?.id} 상세 정보</h2>
                <div className="bg-surface-container-lowest p-4 rounded border border-border-subtle mb-4">
                  <p className="text-body-base text-on-surface-variant mb-2"><strong>발생원:</strong> {alert?.source}</p>
                  <p className="text-body-base text-on-surface-variant mb-2"><strong>내용:</strong> {alert?.message}</p>
                  <p className="text-body-base text-on-surface-variant"><strong>시간:</strong> {alert?.time}</p>
                </div>
                
                <div className="mt-auto flex justify-end">
                  <button 
                    className={`px-6 py-3 rounded font-bold flex items-center gap-2 ${isDispatching || alert?.status === 'dispatched' ? 'bg-surface-container text-text-muted cursor-not-allowed' : 'bg-primary text-on-primary hover:bg-primary/80 glow-active'}`}
                    onClick={handleDispatch}
                    disabled={isDispatching || alert?.status === 'dispatched'}
                  >
                    <span className={`material-symbols-outlined ${isDispatching ? 'animate-bounce' : ''}`}>send</span>
                    {alert?.status === 'dispatched' ? '디스패치됨' : isDispatching ? '전송 중...' : '모바일 현장 요원 디스패치'}
                  </button>
                </div>
              </div>
            );
          })() : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
              <span className="material-symbols-outlined text-4xl mb-2">touch_app</span>
              <p>알람을 선택하여 상세 정보를 확인하세요</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

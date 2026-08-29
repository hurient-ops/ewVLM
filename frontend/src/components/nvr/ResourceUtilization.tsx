import React, { useEffect } from 'react';
import { useSystemHealthStore } from '../../store/useSystemHealthStore';

export const ResourceUtilization: React.FC = () => {
  const { metrics, fetchHealthData } = useSystemHealthStore();
  
  useEffect(() => {
    fetchHealthData(); // Initial fetch
    const interval = setInterval(fetchHealthData, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [fetchHealthData]);
  const netMetric = metrics.find(m => m.id === 'net');

  return (
    <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
      {/* Network Transport */}
      <div className="bg-surface rounded-lg border border-border-subtle p-4 flex flex-col shadow-lg shadow-black/50">
        <div className="flex justify-between items-center border-b border-border-subtle pb-2 mb-3">
          <h3 className="text-title-sm font-title-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">router</span> 수신 대역폭 
          </h3>
          <span className="text-display-lg font-display-lg text-primary">{netMetric?.value || 1.2}<span className="text-body-base text-text-muted"> Gbps</span></span>
        </div>
        <div className="flex-1 relative flex flex-col justify-end min-h-[100px] border-b border-l border-border-subtle pl-2 pb-2">
          {/* Abstract Chart Representation */}
          <div className="absolute bottom-2 left-2 right-0 h-16 flex items-end gap-1 px-1">
            <div className="w-full bg-primary/20 h-[40%] rounded-t border-t border-primary relative"></div>
            <div className="w-full bg-primary/30 h-[45%] rounded-t border-t border-primary relative"></div>
            <div className="w-full bg-primary/20 h-[50%] rounded-t border-t border-primary relative"></div>
            <div className="w-full bg-primary/40 h-[60%] rounded-t border-t border-primary relative"></div>
            <div className="w-full bg-primary/30 h-[55%] rounded-t border-t border-primary relative"></div>
            <div className="w-full bg-primary/50 h-[70%] rounded-t border-t border-primary relative"></div>
            <div className="w-full bg-warning/50 h-[90%] rounded-t border-t border-warning relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-mono-data text-[10px] text-warning bg-surface-dim px-1 rounded border border-border-subtle">최고점</div>
            </div>
            <div className="w-full bg-primary/40 h-[65%] rounded-t border-t border-primary relative"></div>
            <div className="w-full bg-primary/60 h-[80%] rounded-t border-t border-primary relative"></div>
            <div className="w-full bg-primary/50 h-[75%] rounded-t border-t border-primary relative"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border-subtle">
          <div>
            <div className="text-osd-label text-text-muted mb-1">패킷 손실률</div>
            <div className="text-title-sm font-title-sm text-tertiary">0.02%</div>
          </div>
          <div>
            <div className="text-osd-label text-text-muted mb-1">네트워크 지터</div>
            <div className="text-title-sm font-title-sm text-on-surface">12ms</div>
          </div>
        </div>
      </div>
      {/* Retention Policy */}
      <div className="bg-surface rounded-lg border border-border-subtle p-4 flex flex-col shadow-lg shadow-black/50">
        <div className="flex justify-between items-center border-b border-border-subtle pb-2 mb-3">
          <h3 className="text-title-sm font-title-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">history</span> 보존 정책 상태 
          </h3>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-4">
          {/* Policy Item 1 */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-surface-variant flex items-center justify-center relative">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-tertiary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="100, 100" strokeWidth="4"></path>
              </svg>
              <span className="text-title-sm font-bold text-on-surface z-10">30일</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-mono-data font-mono-data mb-1">
                <span className="text-on-surface">고해상도 스트림 (1080p+)</span>
                <span className="text-tertiary">충족</span>
              </div>
              <p className="text-body-sm font-body-sm text-text-muted">목표: 30일. 현재 32일 분량의 영상 보존 중.</p>
            </div>
          </div>
          {/* Policy Item 2 */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-surface-variant flex items-center justify-center relative">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-warning" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="85, 100" strokeWidth="4"></path>
              </svg>
              <span className="text-title-sm font-bold text-on-surface z-10">90일</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-mono-data font-mono-data mb-1">
                <span className="text-on-surface">저해상도 스트림 (보조)</span>
                <span className="text-warning">위험</span>
              </div>
              <p className="text-body-sm font-body-sm text-text-muted">목표: 90일. 현재 볼륨 B 성능 저하로 인해 85일 분량 보존 중.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

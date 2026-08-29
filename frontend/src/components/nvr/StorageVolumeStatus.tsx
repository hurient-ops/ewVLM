import React from 'react';
import { useSystemHealthStore } from '../../store/useSystemHealthStore';

export const StorageVolumeStatus: React.FC = () => {
  const { metrics } = useSystemHealthStore();
  const diskMetric = metrics.find(m => m.id === 'disk');

  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-4 flex flex-col shadow-lg shadow-black/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-title-sm font-title-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">storage</span> 스토리지 볼륨 및 드라이브 베이 상태 
        </h3>
        <div className="flex items-center gap-4 text-mono-data font-mono-data">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-tertiary"></div><span className="text-text-muted">정상</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-warning"></div><span className="text-text-muted">경고</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-danger"></div><span className="text-text-muted">실패</span></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {/* Volume A */}
        <div className="border border-border-subtle rounded p-3 bg-surface-container-low">
          <div className="flex justify-between items-center mb-3">
            <span className="text-label-caps font-label-caps text-on-surface">VOLUME-A (NVR-01)</span>
            <span className="text-mono-data font-mono-data text-tertiary">RAID 5 - OK</span>
          </div>
          {/* Drive Bays */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-surface-variant border border-tertiary/50 rounded h-12 flex items-center justify-center relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary"></div>
              <span className="text-mono-data font-mono-data text-text-muted text-[10px]">HDD 0</span>
            </div>
            <div className="bg-surface-variant border border-tertiary/50 rounded h-12 flex items-center justify-center relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary"></div>
              <span className="text-mono-data font-mono-data text-text-muted text-[10px]">HDD 1</span>
            </div>
            <div className="bg-surface-variant border border-tertiary/50 rounded h-12 flex items-center justify-center relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary"></div>
              <span className="text-mono-data font-mono-data text-text-muted text-[10px]">HDD 2</span>
            </div>
            <div className="bg-surface-variant border border-tertiary/50 rounded h-12 flex items-center justify-center relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary"></div>
              <span className="text-mono-data font-mono-data text-text-muted text-[10px]">HDD 3</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-mono-data font-mono-data">
            <div className="flex justify-between text-text-muted">
              <span>용량</span>
              <span>{((diskMetric?.value || 77) / 100 * 16).toFixed(1)} TB / 16.0 TB</span>
            </div>
            <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div className={`h-full ${diskMetric?.status === 'warning' ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${diskMetric?.value || 77}%` }}></div>
            </div>
          </div>
        </div>
        {/* Volume B */}
        <div className="border border-danger/30 rounded p-3 bg-surface-container-low relative">
          <div className="absolute inset-0 bg-danger/5 rounded pointer-events-none"></div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-label-caps font-label-caps text-on-surface">VOLUME-B (NVR-02)</span>
            <span className="text-mono-data font-mono-data text-danger animate-pulse">RAID 5 - DEGRADED</span>
          </div>
          {/* Drive Bays */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-surface-variant border border-tertiary/50 rounded h-12 flex items-center justify-center relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary"></div>
              <span className="text-mono-data font-mono-data text-text-muted text-[10px]">HDD 0</span>
            </div>
            <div className="bg-surface-variant border border-danger/80 rounded h-12 flex items-center justify-center relative overflow-hidden bg-danger/10">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-danger led-danger"></div>
              <span className="text-mono-data font-mono-data text-danger text-[10px] font-bold">불량 섹터</span>
            </div>
            <div className="bg-surface-variant border border-tertiary/50 rounded h-12 flex items-center justify-center relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary"></div>
              <span className="text-mono-data font-mono-data text-text-muted text-[10px]">HDD 2</span>
            </div>
            <div className="bg-surface-variant border border-tertiary/50 rounded h-12 flex items-center justify-center relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary"></div>
              <span className="text-mono-data font-mono-data text-text-muted text-[10px]">HDD 3</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-mono-data font-mono-data">
            <div className="flex justify-between text-text-muted">
              <span>용량</span>
              <span>14.1 TB / 16.0 TB</span>
            </div>
            <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-warning" style={{ width: "88%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

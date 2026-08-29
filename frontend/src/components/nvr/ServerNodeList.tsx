import React from 'react';
import { useSystemHealthStore } from '../../store/useSystemHealthStore';

export const ServerNodeList: React.FC = () => {
  const { metrics } = useSystemHealthStore();
  const cpuMetric = metrics.find(m => m.id === 'cpu');
  const ramMetric = metrics.find(m => m.id === 'ram');

  return (
    <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 min-h-0">
      <div className="bg-surface rounded-lg border border-border-subtle flex flex-col flex-1 overflow-hidden shadow-lg shadow-black/50 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-variant/20 to-transparent pointer-events-none"></div>
        <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-container-low">
          <h3 className="text-title-sm font-title-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">dns</span> 녹화 서버 
          </h3>
          <span className="text-mono-data font-mono-data text-text-muted">3 노드</span>
        </div>
        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Node 1 */}
          <div className="p-3 border border-border-subtle rounded bg-surface-container relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary rounded-l"></div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className="text-label-caps font-label-caps text-on-surface">NVR-01-PRIMARY</span>
                <span className="text-mono-data font-mono-data text-text-muted mt-1">10.0.4.12</span>
              </div>
              <div className="flex items-center gap-1 bg-tertiary/10 px-2 py-0.5 rounded border border-tertiary/30">
                <div className="w-1.5 h-1.5 rounded-full bg-tertiary led-safe"></div>
                <span className="text-mono-data font-mono-data text-tertiary">활성</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-mono-data font-mono-data">
              <div>
                <div className="text-text-muted mb-1 flex justify-between">
                  <span>CPU</span>
                  <span className="text-on-surface">{cpuMetric?.value || 42}%</span>
                </div>
                <div className="w-full h-1 bg-surface-variant rounded overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${cpuMetric?.value || 42}%` }}></div>
                </div>
              </div>
              <div>
                <div className="text-text-muted mb-1 flex justify-between">
                  <span>RAM</span>
                  <span className="text-on-surface">{ramMetric?.value || 64}%</span>
                </div>
                <div className="w-full h-1 bg-surface-variant rounded overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${ramMetric?.value || 64}%` }}></div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border-subtle flex justify-between text-mono-data font-mono-data">
              <span className="text-text-muted">할당된 카메라: <span className="text-on-surface">14</span></span>
              <span className="text-text-muted">IOPS: <span className="text-on-surface">1.2k</span></span>
            </div>
          </div>
          {/* Node 2 */}
          <div className="p-3 border border-border-subtle rounded bg-surface-container relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning rounded-l"></div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className="text-label-caps font-label-caps text-on-surface">NVR-02-PRIMARY</span>
                <span className="text-mono-data font-mono-data text-text-muted mt-1">10.0.4.13</span>
              </div>
              <div className="flex items-center gap-1 bg-warning/10 px-2 py-0.5 rounded border border-warning/30">
                <div className="w-1.5 h-1.5 rounded-full bg-warning led-warning"></div>
                <span className="text-mono-data font-mono-data text-warning">높은 부하</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-mono-data font-mono-data">
              <div>
                <div className="text-text-muted mb-1 flex justify-between">
                  <span>CPU</span>
                  <span className="text-warning">88%</span>
                </div>
                <div className="w-full h-1 bg-surface-variant rounded overflow-hidden">
                  <div className="h-full bg-warning" style={{ width: "88%" }}></div>
                </div>
              </div>
              <div>
                <div className="text-text-muted mb-1 flex justify-between">
                  <span>RAM</span>
                  <span className="text-on-surface">72%</span>
                </div>
                <div className="w-full h-1 bg-surface-variant rounded overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "72%" }}></div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border-subtle flex justify-between text-mono-data font-mono-data">
              <span className="text-text-muted">할당된 카메라: <span className="text-on-surface">18</span></span>
              <span className="text-text-muted">IOPS: <span className="text-on-surface">2.4k</span></span>
            </div>
          </div>
          {/* Failover Node */}
          <div className="p-3 border border-border-subtle rounded bg-surface-container relative border-dashed">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-text-muted rounded-l"></div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className="text-label-caps font-label-caps text-text-muted">NVR-03-FAILOVER</span>
                <span className="text-mono-data font-mono-data text-text-muted mt-1">10.0.4.14</span>
              </div>
              <div className="flex items-center gap-1 bg-surface-variant px-2 py-0.5 rounded border border-border-subtle">
                <div className="w-1.5 h-1.5 rounded-full bg-text-muted"></div>
                <span className="text-mono-data font-mono-data text-text-muted">대기</span>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-border-subtle text-mono-data font-mono-data text-text-muted text-center italic"> 주 서버 장애 시 제어 권한 인계 준비 완료. </div>
          </div>
        </div>
      </div>
    </div>
  );
};

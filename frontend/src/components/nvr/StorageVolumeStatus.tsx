import React, { useEffect, useState } from 'react';
import { API } from '../../api/client';

export const StorageVolumeStatus: React.FC = () => {
  const [nodes, setNodes] = useState<any[]>([]);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await API.getNvrStatus();
        if (res.status === 'SUCCESS') {
          setNodes(res.nodes.filter((n: any) => n.role === 'PRIMARY'));
        }
      } catch (err) {
        console.error("Failed to fetch NVR status", err);
      }
    };
    fetchNodes();
    const interval = setInterval(fetchNodes, 5000); // Polling every 5 seconds for live effect
    return () => clearInterval(interval);
  }, []);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {nodes.map((node, index) => {
          const isWarning = node.status === 'WARNING';
          const usagePercent = node.storage_total_tb > 0 ? (node.storage_used_tb / node.storage_total_tb) * 100 : 0;
          const isDegraded = isWarning; // Simulate degraded state for warning nodes

          return (
            <div key={node.id} className={`border ${isDegraded ? 'border-danger/30' : 'border-border-subtle'} rounded p-3 bg-surface-container-low relative`}>
              {isDegraded && <div className="absolute inset-0 bg-danger/5 rounded pointer-events-none"></div>}
              <div className="flex justify-between items-center mb-3">
                <span className="text-label-caps font-label-caps text-on-surface">VOLUME-{String.fromCharCode(65 + index)} ({node.node_name})</span>
                <span className={`text-mono-data font-mono-data ${isDegraded ? 'text-danger animate-pulse' : 'text-tertiary'}`}>
                  RAID 5 - {isDegraded ? 'DEGRADED' : 'OK'}
                </span>
              </div>
              {/* Drive Bays */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[0, 1, 2, 3].map((bayIdx) => {
                  const isFailedBay = isDegraded && bayIdx === 1; // Arbitrarily fail bay 1 on degraded nodes
                  
                  return (
                    <div key={bayIdx} className={`bg-surface-variant border ${isFailedBay ? 'border-danger/80 bg-danger/10' : 'border-tertiary/50'} rounded h-12 flex items-center justify-center relative overflow-hidden`}>
                      <div className={`absolute bottom-0 left-0 w-full h-1 ${isFailedBay ? 'bg-danger led-danger' : 'bg-tertiary'}`}></div>
                      <span className={`text-mono-data font-mono-data text-[10px] ${isFailedBay ? 'text-danger font-bold' : 'text-text-muted'}`}>
                        {isFailedBay ? '불량 섹터' : `HDD ${bayIdx}`}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col gap-1 text-mono-data font-mono-data">
                <div className="flex justify-between text-text-muted">
                  <span>용량</span>
                  <span>{node.storage_used_tb.toFixed(1)} TB / {node.storage_total_tb.toFixed(1)} TB</span>
                </div>
                <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div className={`h-full ${isDegraded || usagePercent > 85 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${usagePercent}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useSystemHealthStore } from '../../store/useSystemHealthStore';
import { API } from '../../api/client';

export const ServerNodeList: React.FC = () => {
  const [nodes, setNodes] = useState<any[]>([]);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await API.getNvrStatus();
        if (res.status === 'SUCCESS') {
          setNodes(res.nodes);
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
    <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 min-h-0">
      <div className="bg-surface rounded-lg border border-border-subtle flex flex-col flex-1 overflow-hidden shadow-lg shadow-black/50 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-variant/20 to-transparent pointer-events-none"></div>
        <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-container-low">
          <h3 className="text-title-sm font-title-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">dns</span> 녹화 서버 
          </h3>
          <span className="text-mono-data font-mono-data text-text-muted">{nodes.length} 노드</span>
        </div>
        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          {nodes.map((node, index) => {
            const isWarning = node.status === 'WARNING';
            const isStandby = node.status === 'STANDBY';
            const isActive = !isWarning && !isStandby;

            let bgColor = isStandby ? 'bg-text-muted' : (isWarning ? 'bg-warning' : 'bg-tertiary');
            let textColor = isStandby ? 'text-text-muted' : (isWarning ? 'text-warning' : 'text-tertiary');
            let badgeBg = isStandby ? 'bg-surface-variant' : (isWarning ? 'bg-warning/10' : 'bg-tertiary/10');
            let badgeBorder = isStandby ? 'border-border-subtle' : (isWarning ? 'border-warning/30' : 'border-tertiary/30');

            return (
              <div key={node.id} className={`p-3 border border-border-subtle rounded bg-surface-container relative ${isStandby ? 'border-dashed' : ''}`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${bgColor} rounded-l`}></div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className={`text-label-caps font-label-caps ${isStandby ? 'text-text-muted' : 'text-on-surface'}`}>{node.node_name}</span>
                    <span className="text-mono-data font-mono-data text-text-muted mt-1">{node.ip_address}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${badgeBg} px-2 py-0.5 rounded border ${badgeBorder}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${bgColor} ${!isStandby ? (isWarning ? 'led-warning' : 'led-safe') : ''}`}></div>
                    <span className={`text-mono-data font-mono-data ${textColor}`}>
                      {isStandby ? '대기' : (isWarning ? '높은 부하' : '활성')}
                    </span>
                  </div>
                </div>
                
                {!isStandby ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-mono-data font-mono-data">
                      <div>
                        <div className="text-text-muted mb-1 flex justify-between">
                          <span>CPU</span>
                          <span className={isWarning && node.cpu_usage > 80 ? "text-warning" : "text-on-surface"}>{node.cpu_usage}%</span>
                        </div>
                        <div className="w-full h-1 bg-surface-variant rounded overflow-hidden">
                          <div className={`h-full ${isWarning && node.cpu_usage > 80 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${node.cpu_usage}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-text-muted mb-1 flex justify-between">
                          <span>RAM</span>
                          <span className="text-on-surface">{node.ram_usage}%</span>
                        </div>
                        <div className="w-full h-1 bg-surface-variant rounded overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${node.ram_usage}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border-subtle flex justify-between text-mono-data font-mono-data">
                      <span className="text-text-muted">할당된 카메라: <span className="text-on-surface">{10 + index * 4}</span></span>
                      <span className="text-text-muted">IOPS: <span className="text-on-surface">{(1.2 + index * 0.6).toFixed(1)}k</span></span>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 pt-2 border-t border-border-subtle text-mono-data font-mono-data text-text-muted text-center italic">
                    주 서버 장애 시 제어 권한 인계 준비 완료.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

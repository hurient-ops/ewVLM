import React, { useState, useEffect } from 'react';
import { API } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface NodeStatus {
  id: number;
  node_name: string;
  ip_address: string;
  role: string;
  status: string;
  cpu_usage: number;
  ram_usage: number;
  storage_total_tb: number;
  storage_used_tb: number;
}

export const EdgeAiOrchestration: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [nodes, setNodes] = useState<NodeStatus[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeStatus | null>(null);

  const fetchNodes = async () => {
    try {
      const res = await API.getNvrStatus();
      if (res && res.nodes) {
        setNodes(res.nodes);
        if (!selectedNode && res.nodes.length > 0) {
          setSelectedNode(res.nodes[0]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch NVR status", e);
    }
  };

  useEffect(() => {
    fetchNodes();
    const interval = setInterval(fetchNodes, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await fetchNodes();
    setTimeout(() => setIsSyncing(false), 500);
  };

  // Generate historical data based on current usage for demonstration
  const generateHistoryData = (currentUsage: number) => {
    return Array.from({ length: 12 }).map((_, i) => {
      const isCurrent = i === 11;
      const val = isCurrent ? currentUsage : Math.max(0, Math.min(100, currentUsage + (Math.random() * 20 - 10)));
      return { time: `-${11 - i}m`, value: val };
    });
  };

  return ( <>
<main className="flex-1 p-container-padding overflow-y-auto h-full flex flex-col gap-4">
{/* Header Section */}
<div className="flex justify-between items-end mb-2">
<div>
<h1 className="text-headline-md font-headline-md text-on-surface whitespace-nowrap">에지 AI 컨테이너 오케스트레이션 및 NIM 분산 전개 모니터링 콘솔</h1>
<p className="text-body-base font-body-base text-text-muted mt-1">NIM 컨테이너 플릿 관리 및 프로파일링</p>
</div>
<div className="flex gap-2">
<button 
  className="px-4 py-2 border border-border-subtle rounded text-body-sm font-body-sm hover:bg-surface-container-high transition-colors text-on-surface flex items-center gap-2"
  onClick={handleSync}
>
  <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>sync</span> {isSyncing ? '동기화 중...' : '플릿 동기화'}
</button>
<button className="px-4 py-2 bg-primary-container text-on-primary-container rounded text-body-sm font-body-sm font-semibold hover:bg-inverse-primary transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">rocket_launch</span> NIM 배포 </button>
</div>
</div>
{/* Bento Grid Layout */}
<div className="grid grid-cols-12 gap-4 flex-1">
{/* Left Column: Edge Device List (Spans 4) */}
<div className="col-span-12 xl:col-span-4 bg-surface rounded-lg border border-border-subtle flex flex-col overflow-hidden">
<div className="p-3 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
<h3 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">router</span> 에지 노드 </h3>
<span className="text-mono-data font-mono-data text-text-muted">{nodes.length} ACTIVE</span>
</div>
<div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
  {nodes.map(node => {
    const isSelected = selectedNode?.id === node.id;
    const isWarning = node.status === 'WARNING';
    const isOffline = node.status === 'OFFLINE';
    return (
      <div 
        key={node.id} 
        onClick={() => setSelectedNode(node)}
        className={`p-3 rounded border cursor-pointer transition-colors ${isSelected ? 'border-primary bg-surface-container-highest' : 'border-border-subtle bg-surface hover:border-outline-variant'}`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isWarning ? 'bg-warning' : isOffline ? 'bg-danger' : 'bg-tertiary'} ${isSelected ? 'industrial-glow' : ''}`}></div>
            <span className="text-body-sm font-body-sm font-bold text-on-surface">{node.node_name}</span>
          </div>
          <span className={`text-mono-data font-mono-data ${isWarning ? 'text-warning' : isOffline ? 'text-danger' : 'text-tertiary'}`}>{node.status}</span>
        </div>
        <div className="flex gap-4 text-mono-data font-mono-data text-text-muted mt-2">
          <div className="flex flex-col"><span className="">ROLE</span><span className="text-on-surface">{node.role}</span></div>
          <div className="flex flex-col"><span className="">CPU</span><span className={node.cpu_usage > 80 ? 'text-warning' : 'text-on-surface'}>{node.cpu_usage}%</span></div>
          <div className="flex flex-col"><span className="">RAM</span><span className={node.ram_usage > 80 ? 'text-warning' : 'text-on-surface'}>{node.ram_usage}%</span></div>
        </div>
      </div>
    );
  })}
</div>
</div>
{/* Right Column: Profiling & Orchestration (Spans 8) */}
<div className="col-span-12 xl:col-span-8 flex flex-col gap-4">
{/* Hardware Profiler (Top Half) */}
<div className="bg-surface rounded-lg border border-border-subtle flex flex-col flex-1">
<div className="p-3 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
<h3 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">memory</span> {selectedNode ? `${selectedNode.node_name} 프로파일러` : '노드 선택 대기중'} </h3>
<div className="flex gap-2">
<span className="px-2 py-1 bg-surface-container-high rounded text-mono-data text-text-muted">IP: {selectedNode?.ip_address || 'N/A'}</span>
</div>
</div>
{selectedNode ? (
<div className="p-4 grid grid-cols-3 gap-4">
{/* GPU Stats */}
<div className="col-span-1 border border-border-subtle rounded p-3 bg-surface-container">
<div className="text-label-caps font-label-caps text-text-muted mb-2">CPU 사용량</div>
<div className="flex items-end gap-2 mb-2">
<span className={`text-display-lg font-display-lg ${selectedNode.cpu_usage > 80 ? 'text-warning' : 'text-tertiary'}`}>{selectedNode.cpu_usage}%</span>
</div>
{/* Recharts Chart */}
<div className="h-12 w-full mt-2">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={generateHistoryData(selectedNode.cpu_usage)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
      <Tooltip 
        contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', fontSize: '10px' }} 
        itemStyle={{ color: '#00f2fe' }}
        cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
      />
      <Bar dataKey="value" radius={[2, 2, 0, 0]}>
        {generateHistoryData(selectedNode.cpu_usage).map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.value > 80 ? '#EF4444' : entry.value > 60 ? '#F59E0B' : '#00f2fe'} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>
</div>
{/* Memory Stats */}
<div className="col-span-1 border border-border-subtle rounded p-3 bg-surface-container">
<div className="text-label-caps font-label-caps text-text-muted mb-2">공유 메모리 (RAM)</div>
<div className="flex items-end gap-2 mb-2">
<span className="text-display-lg font-display-lg text-on-surface">{selectedNode.ram_usage}</span>
<span className="text-body-sm text-text-muted mb-1">%</span>
</div>
<div className="w-full bg-surface-container-lowest h-2 rounded mt-4 overflow-hidden">
<div className={`${selectedNode.ram_usage > 80 ? 'bg-warning' : 'bg-primary'} h-full transition-all`} style={{ width: `${selectedNode.ram_usage}%` }}></div>
</div>
</div>
{/* Power/Temp Stats */}
<div className="col-span-1 border border-border-subtle rounded p-3 bg-surface-container flex flex-col justify-between">
<div>
<div className="flex justify-between items-center mb-1">
<span className="text-label-caps font-label-caps text-text-muted">저장소 사용량</span>
<span className="text-mono-data text-on-surface">{selectedNode.storage_used_tb} TB / {selectedNode.storage_total_tb} TB</span>
</div>
<div className="flex justify-between items-center mb-1">
<span className="text-label-caps font-label-caps text-text-muted">상태</span>
<span className={`text-mono-data ${selectedNode.status === 'ACTIVE' ? 'text-tertiary' : 'text-warning'}`}>{selectedNode.status}</span>
</div>
<div className="flex justify-between items-center">
<span className="text-label-caps font-label-caps text-text-muted">역할군</span>
<span className="text-mono-data text-on-surface">{selectedNode.role}</span>
</div>
</div>
</div>
</div>
) : (
<div className="p-4 flex justify-center items-center h-full text-text-muted">노드를 선택하면 상세 지표가 표시됩니다.</div>
)}
</div>
{/* Container Orchestration (Bottom Half) */}
<div className="bg-surface rounded-lg border border-border-subtle flex flex-col flex-1">
<div className="p-3 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
<h3 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">view_in_ar</span> 구동 중인 NIM (가상 컨테이너) </h3>
<button className="text-primary hover:text-primary-fixed transition-colors text-mono-data flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">add_box</span> Hot Deploy </button>
</div>
<div className="p-0 overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="border-b border-border-subtle text-label-caps font-label-caps text-text-muted bg-surface-container-low">
<th className="p-3 font-normal">NIM 서비스</th>
<th className="p-3 font-normal">버전</th>
<th className="p-3 font-normal">상태</th>
<th className="p-3 font-normal">GPU 할당</th>
<th className="p-3 font-normal text-right">작업</th>
</tr>
</thead>
<tbody className="text-mono-data font-mono-data">
<tr className="border-b border-border-subtle hover:bg-surface-container-highest transition-colors">
<td className="p-3 flex items-center gap-2">
<span className="material-symbols-outlined text-tertiary text-[16px]">visibility</span>
<span className="text-on-surface">DeepStream-Vision</span>
</td>
<td className="p-3 text-text-muted">v6.3-devel</td>
<td className="p-3">
<span className="inline-flex items-center gap-1 text-tertiary bg-tertiary-fixed-dim bg-opacity-10 px-2 py-0.5 rounded">
<div className="w-1.5 h-1.5 rounded-full bg-tertiary"></div> 구동 중 </span>
</td>
<td className="p-3 text-on-surface">45%</td>
<td className="p-3 text-right">
<button className="text-text-muted hover:text-on-surface"><span className="material-symbols-outlined text-[18px]">restart_alt</span></button>
<button className="text-text-muted hover:text-danger ml-2"><span className="material-symbols-outlined text-[18px]">stop_circle</span></button>
</td>
</tr>
<tr className="border-b border-border-subtle hover:bg-surface-container-highest transition-colors">
<td className="p-3 flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[16px]">psychology</span>
<span className="text-on-surface">VLM-Reasoning-Edge</span>
</td>
<td className="p-3 text-text-muted">v1.2-nim</td>
<td className="p-3">
<span className="inline-flex items-center gap-1 text-tertiary bg-tertiary-fixed-dim bg-opacity-10 px-2 py-0.5 rounded">
<div className="w-1.5 h-1.5 rounded-full bg-tertiary"></div> 구동 중 </span>
</td>
<td className="p-3 text-on-surface">30%</td>
<td className="p-3 text-right">
<button className="text-text-muted hover:text-on-surface"><span className="material-symbols-outlined text-[18px]">restart_alt</span></button>
<button className="text-text-muted hover:text-danger ml-2"><span className="material-symbols-outlined text-[18px]">stop_circle</span></button>
</td>
</tr>
<tr className="hover:bg-surface-container-highest transition-colors">
<td className="p-3 flex items-center gap-2">
<span className="material-symbols-outlined text-text-muted text-[16px]">data_usage</span>
<span className="text-on-surface">Kafka-Telemetry</span>
</td>
<td className="p-3 text-text-muted">v3.4-slim</td>
<td className="p-3">
<span className="inline-flex items-center gap-1 text-warning bg-warning bg-opacity-10 px-2 py-0.5 rounded">
<div className="w-1.5 h-1.5 rounded-full bg-warning"></div> 재시작 중 </span>
</td>
<td className="p-3 text-on-surface">5%</td>
<td className="p-3 text-right">
<button className="text-text-muted hover:text-on-surface"><span className="material-symbols-outlined text-[18px]">restart_alt</span></button>
<button className="text-text-muted hover:text-danger ml-2"><span className="material-symbols-outlined text-[18px]">stop_circle</span></button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
</main> </> );
};

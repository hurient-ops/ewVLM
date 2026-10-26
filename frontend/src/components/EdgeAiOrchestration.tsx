import React, { useState, useEffect } from 'react';
import { API } from '../api/client';
import { BarChart, Bar, ResponsiveContainer, Cell, Tooltip } from 'recharts';

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

interface ContainerItem {
  id: string;
  name: string;
  version: string;
  status: 'running' | 'restarting' | 'stopped';
  gpuAllocation: number;
  targetNode: string;
}

export const EdgeAiOrchestration: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [nodes, setNodes] = useState<NodeStatus[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeStatus | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 컨테이너 목록 상태
  const [containers, setContainers] = useState<ContainerItem[]>([
    { id: 'nim-1', name: 'YOLOv11-TensorRT-FastLoop', version: 'v11.0-cu122', status: 'running', gpuAllocation: 40, targetNode: 'Node 1' },
    { id: 'nim-2', name: 'Llama-3.2-Vision-NIM', version: 'v1.2-nim', status: 'running', gpuAllocation: 35, targetNode: 'Node 1' },
    { id: 'nim-3', name: 'DeepStream-Edge-Decoder', version: 'v6.3-devel', status: 'running', gpuAllocation: 15, targetNode: 'Node 2' },
    { id: 'nim-4', name: 'Kafka-Telemetry-Producer', version: 'v3.4-slim', status: 'restarting', gpuAllocation: 5, targetNode: 'Node 1' }
  ]);

  // 배포 모달 상태
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('Qwen-2.5-VL-7B-NIM');
  const [newTargetNode, setNewTargetNode] = useState('Node 1');
  const [newGpuAllocation, setNewGpuAllocation] = useState(30);

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
    setTimeout(() => {
      setIsSyncing(false);
      setToastMessage('✅ 에지 노드 플릿 메트릭 동기화 완료');
      setTimeout(() => setToastMessage(null), 2500);
    }, 500);
  };

  const handleToggleContainer = (id: string) => {
    setContainers(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'running' ? 'stopped' : 'running';
        setToastMessage(`컨테이너 [${c.name}] 상태 변경: ${nextStatus === 'running' ? '구동 시작' : '중지됨'}`);
        setTimeout(() => setToastMessage(null), 2500);
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleRestartContainer = (id: string) => {
    setContainers(prev => prev.map(c => {
      if (c.id === id) {
        setToastMessage(`컨테이너 [${c.name}] 롤링 재시작 시작...`);
        setTimeout(() => {
          setContainers(curr => curr.map(item => item.id === id ? { ...item, status: 'running' } : item));
          setToastMessage(`✅ 컨테이너 [${c.name}] 재기동 완료`);
          setTimeout(() => setToastMessage(null), 2500);
        }, 1200);
        return { ...c, status: 'restarting' };
      }
      return c;
    }));
  };

  const handleDeployNim = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `nim-${Date.now()}`;
    const newContainer: ContainerItem = {
      id: newId,
      name: newServiceName,
      version: 'v1.0-latest',
      status: 'running',
      gpuAllocation: newGpuAllocation,
      targetNode: newTargetNode
    };

    setContainers(prev => [newContainer, ...prev]);
    setIsDeployModalOpen(false);
    setToastMessage(`🚀 [${newServiceName}] 에지 노드(${newTargetNode}) 분산 배포 완료!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const generateHistoryData = (currentUsage: number) => {
    return Array.from({ length: 12 }).map((_, i) => {
      const isCurrent = i === 11;
      const val = isCurrent ? currentUsage : Math.max(0, Math.min(100, currentUsage + (Math.random() * 20 - 10)));
      return { time: `-${11 - i}m`, value: val };
    });
  };

  return (
    <main className="flex-1 p-5 bg-[#070A13] overflow-y-auto h-full flex flex-col gap-4 relative select-none">
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-[#7C3AED] border border-white/20 text-white px-6 py-2.5 rounded-lg shadow-2xl font-bold text-sm animate-pulse">
          {toastMessage}
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-center mb-1 shrink-0 border-b border-[#232C3F] pb-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">developer_board</span>
            에지 AI 컨테이너 오케스트레이션 및 NIM 분산 전개 콘솔
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            NVIDIA NIM (Microservices) 가상 컨테이너 플릿 관리 &amp; VRAM GPU 프로파일링
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="px-3.5 py-1.5 border border-[#232C3F] bg-[#121724] rounded text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
            onClick={handleSync}
          >
            <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>sync</span> 
            {isSyncing ? '동기화 중...' : '플릿 메트릭 갱신'}
          </button>
          <button 
            onClick={() => setIsDeployModalOpen(true)}
            className="px-4 py-1.5 bg-[#7C3AED] text-white rounded text-xs font-bold hover:bg-[#6D28D9] transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(124,58,237,0.3)] active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">rocket_launch</span> 
            신규 NIM 컨테이너 배포
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        
        {/* Left Column: Edge Device List (Spans 4) */}
        <div className="col-span-12 xl:col-span-4 bg-[#0e121d] rounded-xl border border-[#232C3F] flex flex-col overflow-hidden shadow-sm">
          <div className="p-3 border-b border-[#232C3F] flex justify-between items-center bg-[#121724]">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">router</span> 
              에지 NVR 노드 플릿
            </h3>
            <span className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              {nodes.length} ACTIVE
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2">
            {nodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const isWarning = node.status === 'WARNING';
              const isOffline = node.status === 'OFFLINE';
              return (
                <div 
                  key={node.id} 
                  onClick={() => setSelectedNode(node)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-[#7C3AED] bg-[#7C3AED]/10 shadow-[0_0_12px_rgba(124,58,237,0.2)]' 
                      : 'border-[#232C3F] bg-[#121724] hover:border-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isWarning ? 'bg-amber-400' : isOffline ? 'bg-red-500' : 'bg-emerald-400 shadow-[0_0_4px_#10B981]'
                      }`}></div>
                      <span className="text-xs font-bold text-white">{node.node_name}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isWarning ? 'bg-amber-950 text-amber-300' : isOffline ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'
                    }`}>
                      {node.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-gray-400 mt-2 bg-black/30 p-2 rounded border border-[#232C3F]">
                    <div>
                      <span className="text-[10px] text-gray-500 block">ROLE</span>
                      <span className="text-white font-bold">{node.role}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">CPU</span>
                      <span className={node.cpu_usage > 80 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {node.cpu_usage}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">RAM</span>
                      <span className={node.ram_usage > 80 ? 'text-amber-400 font-bold' : 'text-primary font-bold'}>
                        {node.ram_usage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Profiling & Orchestration (Spans 8) */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-4">
          
          {/* Hardware Profiler (Top Half) */}
          <div className="bg-[#0e121d] rounded-xl border border-[#232C3F] flex flex-col shadow-sm">
            <div className="p-3 border-b border-[#232C3F] flex justify-between items-center bg-[#121724]">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">memory</span> 
                {selectedNode ? `${selectedNode.node_name} 실시간 하드웨어 텔레메트리` : '노드 선택 대기'}
              </h3>
              <span className="px-2 py-0.5 bg-black/40 border border-[#232C3F] rounded text-[11px] font-mono text-gray-300">
                IP: {selectedNode?.ip_address || '192.168.1.100'}
              </span>
            </div>

            {selectedNode ? (
              <div className="p-4 grid grid-cols-3 gap-4">
                {/* CPU Stats */}
                <div className="border border-[#232C3F] rounded-lg p-3 bg-[#121724] flex flex-col justify-between">
                  <div className="text-[11px] font-mono text-gray-400 mb-1">CPU 프로세서 부하</div>
                  <div className="text-2xl font-bold font-mono text-white mb-2">
                    {selectedNode.cpu_usage}<span className="text-xs text-gray-400 font-normal">%</span>
                  </div>
                  <div className="h-10 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={generateHistoryData(selectedNode.cpu_usage)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#121724', border: '1px solid #232C3F', fontSize: '10px' }} 
                          cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                        />
                        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                          {generateHistoryData(selectedNode.cpu_usage).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.value > 80 ? '#EF4444' : entry.value > 60 ? '#F59E0B' : '#7C3AED'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Memory Stats */}
                <div className="border border-[#232C3F] rounded-lg p-3 bg-[#121724] flex flex-col justify-between">
                  <div className="text-[11px] font-mono text-gray-400 mb-1">공유 GPU / 시스템 RAM</div>
                  <div className="text-2xl font-bold font-mono text-white mb-2">
                    {selectedNode.ram_usage}<span className="text-xs text-gray-400 font-normal">%</span>
                  </div>
                  <div className="w-full bg-black/40 h-2 rounded overflow-hidden border border-[#232C3F]">
                    <div 
                      className={`${selectedNode.ram_usage > 80 ? 'bg-amber-400' : 'bg-[#7C3AED]'} h-full transition-all`} 
                      style={{ width: `${selectedNode.ram_usage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Storage & Role */}
                <div className="border border-[#232C3F] rounded-lg p-3 bg-[#121724] flex flex-col justify-between text-xs font-mono">
                  <div className="flex justify-between items-center pb-1 border-b border-[#232C3F]">
                    <span className="text-gray-400">NVR 저장소:</span>
                    <span className="text-white font-bold">{selectedNode.storage_used_tb} TB / {selectedNode.storage_total_tb} TB</span>
                  </div>
                  <div className="flex justify-between items-center pb-1 border-b border-[#232C3F]">
                    <span className="text-gray-400">네트워크 상태:</span>
                    <span className="text-emerald-400 font-bold">10 Gbps SFP+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">역할군:</span>
                    <span className="text-primary font-bold">{selectedNode.role}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-gray-500">노드를 선택하면 지표가 표시됩니다.</div>
            )}
          </div>

          {/* Container Orchestration (Bottom Half) */}
          <div className="bg-[#0e121d] rounded-xl border border-[#232C3F] flex flex-col flex-1 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-[#232C3F] flex justify-between items-center bg-[#121724]">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">view_in_ar</span> 
                구동 중인 NIM 가상 컨테이너 플릿 ({containers.length}개)
              </h3>
              <button 
                onClick={() => setIsDeployModalOpen(true)}
                className="text-primary hover:text-white transition-colors text-xs font-mono flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">add_box</span> 
                Hot Deploy 
              </button>
            </div>

            <div className="p-0 overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#232C3F] text-[11px] font-mono text-gray-400 bg-[#121724]">
                    <th className="p-3 font-semibold">NIM 서비스명</th>
                    <th className="p-3 font-semibold">태그 / 버전</th>
                    <th className="p-3 font-semibold">배포 대상</th>
                    <th className="p-3 font-semibold">상태</th>
                    <th className="p-3 font-semibold">VRAM 점유</th>
                    <th className="p-3 font-semibold text-right">수명주기 제어</th>
                  </tr>
                </thead>
                <tbody className="font-mono divide-y divide-[#232C3F]">
                  {containers.map(c => {
                    const isRunning = c.status === 'running';
                    const isRestarting = c.status === 'restarting';
                    return (
                      <tr key={c.id} className="hover:bg-[#121724] transition-colors">
                        <td className="p-3 flex items-center gap-2">
                          <span className={`material-symbols-outlined text-[16px] ${isRunning ? 'text-primary' : 'text-gray-500'}`}>
                            {c.name.includes('Vision') ? 'visibility' : c.name.includes('Llama') || c.name.includes('Qwen') ? 'psychology' : 'view_in_ar'}
                          </span>
                          <span className="text-white font-bold">{c.name}</span>
                        </td>
                        <td className="p-3 text-gray-400">{c.version}</td>
                        <td className="p-3 text-gray-300">{c.targetNode}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isRunning ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/50' :
                            isRestarting ? 'text-amber-400 bg-amber-950/60 border border-amber-800/50' :
                            'text-gray-400 bg-gray-900 border border-gray-700'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400' : isRestarting ? 'bg-amber-400 animate-ping' : 'bg-gray-500'}`}></div>
                            {isRunning ? '구동 중' : isRestarting ? '재기동 중' : '중지됨'}
                          </span>
                        </td>
                        <td className="p-3 text-white font-bold">{c.gpuAllocation}%</td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => handleRestartContainer(c.id)}
                            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                            title="재시작"
                          >
                            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                          </button>
                          <button 
                            onClick={() => handleToggleContainer(c.id)}
                            className={`p-1 ml-1 rounded transition-colors ${isRunning ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'}`}
                            title={isRunning ? "중지" : "시작"}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {isRunning ? 'stop_circle' : 'play_circle'}
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Deploy NIM Modal */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e121d] border border-[#232C3F] rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#232C3F] mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">rocket_launch</span>
                신규 NIM 에지 컨테이너 배포
              </h3>
              <button 
                onClick={() => setIsDeployModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleDeployNim} className="flex flex-col gap-4 text-xs font-mono">
              <div>
                <label className="block text-gray-400 mb-1">NIM VLM / 추론 서비스</label>
                <select 
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full bg-[#121724] border border-[#232C3F] rounded px-3 py-2 text-white"
                >
                  <option value="Qwen-2.5-VL-7B-NIM">Qwen-2.5-VL-7B (초고속 실시간 VLM)</option>
                  <option value="Llama-3.2-11B-Vision-NIM">Llama-3.2-11B-Vision (고정밀 추론)</option>
                  <option value="YOLOv11-x-TensorRT-Edge">YOLOv11-x (최대 성능 에지 탐지)</option>
                  <option value="Audio-Whisper-Scream-Detector">Audio-Whisper (비명/충격음 분석)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">배포 대상 에지 노드</label>
                <select 
                  value={newTargetNode}
                  onChange={(e) => setNewTargetNode(e.target.value)}
                  className="w-full bg-[#121724] border border-[#232C3F] rounded px-3 py-2 text-white"
                >
                  <option value="Node 1">Node 1 (메인 에지 게이트웨이 - 192.168.1.100)</option>
                  <option value="Node 2">Node 2 (외곽 제2 변전실 에지 - 192.168.1.101)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-gray-400">VRAM GPU 할당량</label>
                  <span className="text-primary font-bold">{newGpuAllocation}% (약 {(newGpuAllocation * 0.08).toFixed(1)} GB)</span>
                </div>
                <input 
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={newGpuAllocation}
                  onChange={(e) => setNewGpuAllocation(parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[#232C3F]">
                <button 
                  type="button"
                  onClick={() => setIsDeployModalOpen(false)}
                  className="px-4 py-2 border border-[#232C3F] rounded text-gray-400 hover:text-white"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded font-bold shadow-md"
                >
                  즉시 배포 시작
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

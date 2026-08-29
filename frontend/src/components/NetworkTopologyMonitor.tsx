import React, { useState, useEffect } from 'react';
import { API } from '../api/client';

export const NetworkTopologyMonitor: React.FC = () => {
  const [inspectorVisible, setInspectorVisible] = useState(true);
  const [nodes, setNodes] = useState<Record<string, any>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string>('SW-01');

  useEffect(() => {
    API.getTopology().then(res => {
      if (res.status === 'SUCCESS') {
        setNodes(res.nodes);
      }
    }).catch(err => console.error("Failed to fetch topology", err));
  }, []);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setInspectorVisible(true);
  };
  
  const selectedNode = nodes[selectedNodeId] || {};

  return ( <>
<main className="flex-1 md:bg-background relative overflow-hidden flex">
{/* Topology Canvas (Left 70%) */}
<div className="flex-1 relative h-full bg-[#070A13] border-r border-border-subtle flex flex-col">
{/* Toolbar */}
<div className="absolute top-4 left-4 z-10 flex gap-2">
<button className="bg-surface-container p-2 rounded border border-border-subtle text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined">zoom_in</span></button>
<button className="bg-surface-container p-2 rounded border border-border-subtle text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined">zoom_out</span></button>
<button className="bg-surface-container p-2 rounded border border-border-subtle text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined">fit_screen</span></button>
</div>
{/* Legend */}
<div className="absolute bottom-4 left-4 z-10 bg-surface-container p-3 rounded border border-border-subtle">
<h3 className="text-label-caps font-label-caps text-on-surface mb-2">연결 상태</h3>
<div className="flex flex-col gap-2">
<div className="flex items-center gap-2"><div className="w-4 h-[2px] bg-tertiary"></div><span className="text-mono-data font-mono-data text-text-muted">최적 (&lt; 70%)</span></div>
<div className="flex items-center gap-2"><div className="w-4 h-[2px] bg-warning border-b-2 border-dashed border-background"></div><span className="text-mono-data font-mono-data text-text-muted">과부하 (&gt; 85%)</span></div>
<div className="flex items-center gap-2"><div className="w-4 h-[2px] bg-danger border-b-2 border-dashed border-background"></div><span className="text-mono-data font-mono-data text-text-muted">오프라인 / 끊김</span></div>
</div>
</div>
{/* SVG Topology */}
<svg className="w-full h-full cursor-move" id="topology-canvas" viewBox="0 0 800 600">
<defs>
<linearGradient id="link-grad" x1="0%" x2="100%" y1="0%" y2="0%">
<stop offset="0%" stop-color="#232C3F"></stop>
<stop offset="50%" stop-color="#4edea3"></stop>
<stop offset="100%" stop-color="#232C3F"></stop>
</linearGradient>
<filter height="140%" id="glow" width="140%" x="-20%" y="-20%">
<feGaussianBlur result="blur" stddeviation="4"></feGaussianBlur>
<feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
</filter>
</defs>
{/* Links */}
<line className="topology-link active" stroke="#232C3F" x1="400" x2="250" y1="100" y2="250"></line>
<line className="topology-link active" stroke="#232C3F" x1="400" x2="550" y1="100" y2="250"></line>
{/* NVR to Switches */}
<line className="topology-link active" stroke="#4edea3" x1="250" x2="150" y1="250" y2="400"></line>
<line className="topology-link warning" stroke="#F59E0B" x1="250" x2="300" y1="250" y2="400"></line>
<line className="topology-link active" stroke="#4edea3" x1="550" x2="450" y1="250" y2="400"></line>
<line className="topology-link error" stroke="#EF4444" x1="550" x2="650" y1="250" y2="400"></line>
{/* Nodes */}
{/* Core NVR */}
<g className="topology-node cursor-pointer hover:opacity-80" onClick={() => handleNodeClick('NVR-CORE')} transform="translate(400, 100)">
<rect fill="#121724" filter="url(#glow)" height="60" rx="4" stroke="#7c3aed" strokeWidth="2" width="80" x="-40" y="-30"></rect>
<text fill="#E2E8F0" font-family="Inter" font-size="12" font-weight="bold" text-anchor="middle" x="0" y="-5">NVR-CORE</text>
<text fill="#4edea3" font-family="JetBrains Mono" font-size="10" text-anchor="middle" x="0" y="15">UP</text>
</g>
{/* Switch 1 */}
<g className="topology-node active cursor-pointer hover:opacity-80" onClick={() => handleNodeClick('SW-01')} transform="translate(250, 250)">
<rect fill="#121724" height="50" rx="4" stroke="#232C3F" strokeWidth="2" width="70" x="-35" y="-25"></rect>
<text fill="#E2E8F0" font-family="Inter" font-size="10" font-weight="bold" text-anchor="middle" x="0" y="-2">SW-01</text>
<circle cx="-15" cy="12" fill="#4edea3" filter="url(#glow)" r="3"></circle>
<text fill="#ccc3d8" font-family="JetBrains Mono" font-size="9" x="-5" y="15">PoE</text>
</g>
{/* Switch 2 */}
<g className="topology-node cursor-pointer hover:opacity-80" onClick={() => handleNodeClick('SW-02')} transform="translate(550, 250)">
<rect fill="#121724" height="50" rx="4" stroke="#232C3F" strokeWidth="2" width="70" x="-35" y="-25"></rect>
<text fill="#E2E8F0" font-family="Inter" font-size="10" font-weight="bold" text-anchor="middle" x="0" y="-2">SW-02</text>
<circle cx="-15" cy="12" fill="#F59E0B" filter="url(#glow)" r="3"></circle>
<text fill="#ccc3d8" font-family="JetBrains Mono" font-size="9" x="-5" y="15">PoE</text>
</g>
{/* Cameras under SW-01 */}
<g className="topology-node cursor-pointer hover:opacity-80" onClick={() => handleNodeClick('CAM-1A')} transform="translate(150, 400)">
<circle cx="0" cy="0" fill="#121724" r="20" stroke="#232C3F" strokeWidth="2"></circle>
<text fill="#E2E8F0" font-family="Material Symbols Outlined" font-size="18" text-anchor="middle" x="0" y="4">videocam</text>
<text fill="#7D8D9F" font-family="JetBrains Mono" font-size="9" text-anchor="middle" x="0" y="35">CAM-1A</text>
<circle cx="15" cy="-15" fill="#4edea3" filter="url(#glow)" r="4"></circle>
</g>
<g className="topology-node cursor-pointer hover:opacity-80" onClick={() => handleNodeClick('CAM-1B')} transform="translate(300, 400)">
<circle cx="0" cy="0" fill="#121724" filter="url(#glow)" r="20" stroke="#F59E0B" strokeWidth="2"></circle>
<text fill="#E2E8F0" font-family="Material Symbols Outlined" font-size="18" text-anchor="middle" x="0" y="4">videocam</text>
<text fill="#F59E0B" font-family="JetBrains Mono" font-size="9" text-anchor="middle" x="0" y="35">CAM-1B</text>
<circle cx="15" cy="-15" fill="#F59E0B" filter="url(#glow)" r="4"></circle>
</g>
{/* Cameras under SW-02 */}
<g className="topology-node cursor-pointer hover:opacity-80" onClick={() => handleNodeClick('CAM-2B')} transform="translate(650, 400)">
<circle cx="0" cy="0" fill="#121724" filter="url(#glow)" r="20" stroke="#EF4444" strokeWidth="2"></circle>
<text fill="#EF4444" font-family="Material Symbols Outlined" font-size="18" text-anchor="middle" x="0" y="4">videocam_off</text>
<text fill="#EF4444" font-family="JetBrains Mono" font-size="9" text-anchor="middle" x="0" y="35">CAM-2B</text>
<circle cx="15" cy="-15" fill="#EF4444" filter="url(#glow)" r="4"></circle>
</g>
</svg>
</div>
{/* Inspector Panel (Right 30%) */}
{inspectorVisible && (
<aside className="w-80 bg-surface flex flex-col h-full border-l border-border-subtle shadow-lg z-20">
<div className="p-4 border-b border-border-subtle bg-surface-container-lowest">
<div className="flex items-center justify-between mb-1">
<h2 className="text-title-sm font-title-sm text-on-surface">노드 인스펙터</h2>
<span className="material-symbols-outlined text-text-muted text-sm cursor-pointer hover:text-on-surface" onClick={() => setInspectorVisible(false)}>close</span>
</div>
<div className="text-mono-data font-mono-data text-primary">{selectedNode.id || 'N/A'}</div>
</div>
<div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
{/* Status Card */}
<div className="bg-surface-container p-3 rounded border border-border-subtle">
<div className="flex justify-between items-center mb-3">
<span className="text-label-caps font-label-caps text-text-muted">상태</span>
<div className="flex items-center gap-1.5">
{selectedNode.status === 'online' ? (
  <><div className="w-2 h-2 rounded-full bg-tertiary glow-tertiary"></div><span className="text-mono-data font-mono-data text-tertiary">온라인</span></>
) : selectedNode.status === 'warning' ? (
  <><div className="w-2 h-2 rounded-full bg-warning glow-warning"></div><span className="text-mono-data font-mono-data text-warning">경고</span></>
) : (
  <><div className="w-2 h-2 rounded-full bg-danger glow-danger"></div><span className="text-mono-data font-mono-data text-danger">오프라인</span></>
)}
</div>
</div>
<div className="grid grid-cols-2 gap-2 mb-2">
<div>
<div className="text-label-caps font-label-caps text-text-muted mb-1">가동 시간</div>
<div className="text-mono-data font-mono-data text-on-surface">{selectedNode.uptime || 'N/A'}</div>
</div>
<div>
<div className="text-label-caps font-label-caps text-text-muted mb-1">처리량</div>
<div className="text-mono-data font-mono-data text-on-surface">{selectedNode.throughput || 'N/A'}</div>
</div>
</div>
<div className="grid grid-cols-2 gap-2 border-t border-border-subtle pt-2">
<div>
<div className="text-label-caps font-label-caps text-text-muted mb-1">소비 전력</div>
<div className="text-mono-data font-mono-data text-on-surface">{selectedNode.power_draw || 'N/A'}</div>
</div>
<div>
<div className="text-label-caps font-label-caps text-text-muted mb-1">온도</div>
<div className="text-mono-data font-mono-data text-on-surface">{selectedNode.temperature || 'N/A'}</div>
</div>
</div>
</div>
{/* PoE Port Status */}
<div>
<h3 className="text-label-caps font-label-caps text-on-surface mb-3 flex items-center gap-2">
<span className="material-symbols-outlined text-sm">power</span> PoE 포트 할당 </h3>
<div className="bg-surface-container border border-border-subtle rounded overflow-hidden">
{/* Total Budget */}
<div className="p-3 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
<span className="text-body-sm font-body-sm text-text-muted">전체 예산 (120W)</span>
<span className="text-mono-data font-mono-data text-on-surface">48W 사용됨</span>
</div>
{/* Progress Bar */}
<div className="w-full h-1 bg-surface-container-highest">
<div className="h-full bg-primary-container w-[40%]"></div>
</div>
{/* Port List */}
<div className="flex flex-col">
{/* Port 1 */}
<div className="p-2 border-b border-border-subtle flex items-center justify-between hover:bg-surface-container-high transition-colors">
<div className="flex items-center gap-3">
<div className="w-6 h-6 rounded bg-surface-container-highest flex items-center justify-center border border-border-subtle">
<span className="text-mono-data font-mono-data text-text-muted text-[10px]">P1</span>
</div>
<div className="flex flex-col">
<span className="text-mono-data font-mono-data text-on-surface">CAM-1A</span>
<span className="text-mono-data font-mono-data text-tertiary text-[10px]">15.4W (Class 3)</span>
</div>
</div>
<button className="px-2 py-1 bg-surface border border-border-subtle rounded text-label-caps font-label-caps text-text-muted hover:text-danger hover:border-danger transition-colors flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">restart_alt</span> 초기화 </button>
</div>
{/* Port 2 */}
<div className="p-2 border-b border-border-subtle flex items-center justify-between hover:bg-surface-container-high transition-colors bg-warning/5">
<div className="flex items-center gap-3">
<div className="w-6 h-6 rounded bg-surface-container-highest flex items-center justify-center border border-warning/50">
<span className="text-mono-data font-mono-data text-warning text-[10px]">P2</span>
</div>
<div className="flex flex-col">
<span className="text-mono-data font-mono-data text-on-surface">CAM-1B</span>
<span className="text-mono-data font-mono-data text-warning text-[10px]">28.2W (Class 4) - High</span>
</div>
</div>
<button className="px-2 py-1 bg-surface border border-border-subtle rounded text-label-caps font-label-caps text-text-muted hover:text-danger hover:border-danger transition-colors flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">restart_alt</span> 초기화 </button>
</div>
{/* Port 3 */}
<div className="p-2 flex items-center justify-between bg-surface-container-lowest opacity-50">
<div className="flex items-center gap-3">
<div className="w-6 h-6 rounded bg-surface-container-highest flex items-center justify-center border border-border-subtle">
<span className="text-mono-data font-mono-data text-text-muted text-[10px]">P3</span>
</div>
<div className="flex flex-col">
<span className="text-mono-data font-mono-data text-text-muted">비어있음</span>
<span className="text-mono-data font-mono-data text-text-muted text-[10px]">0.0W</span>
</div>
</div>
<div className="w-2 h-2 rounded-full bg-surface-container-highest border border-border-subtle"></div>
</div>
</div>
</div>
</div>
{/* Actions */}
<div className="mt-auto pt-4">
<button className="w-full py-2 bg-surface-container border border-border-subtle rounded text-label-caps font-label-caps text-on-surface hover:bg-surface-container-high transition-colors mb-2"> 장치 로그 보기 </button>
<button className="w-full py-2 bg-surface-container border border-danger/30 rounded text-label-caps font-label-caps text-danger hover:bg-danger/10 transition-colors flex justify-center items-center gap-2">
<span className="material-symbols-outlined text-sm">power_settings_new</span> 스위치 리부팅 </button>
</div>
</div>
</aside>
)}
</main> </> );
};

import React, { useState } from 'react';
import { useCameraStore } from '../store/useCameraStore';
import { useEventLogStore } from '../store/useEventLogStore';
import { API } from '../api/client';

export const MonitorALiveControl: React.FC = () => {
  const { slots, activeLayout, setLayout, updateSlotStatus, cameras, groups, fetchCameras } = useCameraStore();
  const [vlmModels, setVlmModels] = useState<string[]>([]);
  const [activeModels, setActiveModels] = useState<string[]>(["Llama 3.2 11B Vision Instruct"]);
  const [selectedSlotId, setSelectedSlotId] = useState<number>(1);
  const [ptzFeedback, setPtzFeedback] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const isExpanded = prev[groupId] !== false; // defaults to true
      return { ...prev, [groupId]: !isExpanded };
    });
  };

  const groupedCameras = React.useMemo(() => {
    const grouped: Record<string, { groupName: string, cameras: typeof cameras }> = {};
    groups.forEach(g => {
      grouped[g.id] = { groupName: g.name, cameras: [] };
    });
    grouped['unassigned'] = { groupName: '미배정 그룹', cameras: [] };
    
    cameras.forEach(cam => {
      if (cam.groupId && grouped[cam.groupId]) {
        grouped[cam.groupId].cameras.push(cam);
      } else {
        grouped['unassigned'].cameras.push(cam);
      }
    });
    return grouped;
  }, [cameras, groups]);

  React.useEffect(() => {
    API.getVlmModels().then((data) => {
      setVlmModels(data.available || []);
      if (data.active && Array.isArray(data.active)) {
        setActiveModels(data.active);
      }
    }).catch(console.error);
  }, []);

  const handleModelToggle = async (model: string) => {
    let newModels: string[];
    if (activeModels.includes(model)) {
      newModels = activeModels.filter(m => m !== model);
      if (newModels.length === 0) return;
    } else {
      newModels = [...activeModels, model];
    }
    
    try {
      await API.setVlmModel(newModels);
      setActiveModels(newModels);
      useEventLogStore.getState().addLog({
        cameraId: 'SYSTEM',
        cameraName: 'SYSTEM',
        level: 'info',
        message: `[SYSTEM] AI 모델이 앙상블 조합(${newModels.join(', ')})으로 교체되었습니다.`,
        confidence: 1.0
      });
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  const handleDragStart = (e: React.DragEvent, cameraId: string, cameraName: string) => {
    e.dataTransfer.setData('cameraId', cameraId);
    e.dataTransfer.setData('cameraName', cameraName);
  };

  const handleDrop = (e: React.DragEvent, slotId: number) => {
    e.preventDefault();
    const cameraId = e.dataTransfer.getData('cameraId');
    const cameraName = e.dataTransfer.getData('cameraName');
    
    if (cameraId) {
      assignCameraToSlot(slotId, cameraId, cameraName);
    }
  };

  const assignCameraToSlot = (slotId: number, cameraId: string, cameraName: string) => {
    updateSlotStatus(slotId, 'active', { cameraId, cameraName });
    setSelectedSlotId(slotId);
    useEventLogStore.getState().addLog({
      cameraId,
      cameraName,
      level: 'info',
      message: `모니터 슬롯 ${slotId}에 카메라 (${cameraName}) 바인딩 완료`,
      confidence: 1.0
    });
    
    // Simulate YOLO pipeline initialization
    setTimeout(() => {
      useEventLogStore.getState().addLog({
        cameraId,
        cameraName,
        level: 'info',
        message: `[Edge AI] ${cameraId} 채널 실시간 YOLOv11 분석 파이프라인 활성화`,
        confidence: 1.0
      });
    }, 800);
  };

  // 원클릭 또는 더블클릭 시 현재 선택된 슬롯 또는 첫 빈 슬롯에 자동 배정
  const handleQuickAssign = (cameraId: string, cameraName: string) => {
    let targetSlot = selectedSlotId;
    const currentSelected = slots.find(s => s.slotId === selectedSlotId);
    if (currentSelected && currentSelected.cameraId) {
      // 선택 슬롯이 이미 차있으면 첫 번째 빈 슬롯 탐색
      const emptySlot = slots.slice(0, activeLayout).find(s => !s.cameraId);
      if (emptySlot) {
        targetSlot = emptySlot.slotId;
      }
    }
    assignCameraToSlot(targetSlot, cameraId, cameraName);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // 현재 선택된 슬롯 정보 및 제어 대상 카메라 결정
  const selectedSlot = slots.find(s => s.slotId === selectedSlotId);
  const activeControlCameraId = selectedSlot?.cameraId || slots.find(s => s.status === 'active')?.cameraId || 'cam-01';
  const activeControlCameraName = selectedSlot?.cameraName || cameras.find(c => c.id.toLowerCase() === activeControlCameraId.toLowerCase())?.name || activeControlCameraId;

  const triggerPtzCommand = async (command: string, label?: string) => {
    try {
      await API.controlPtz(activeControlCameraId, command);
      setPtzFeedback(label || command);
      setTimeout(() => setPtzFeedback(null), 1500);
    } catch (err) {
      console.error(err);
      setPtzFeedback('실패');
      setTimeout(() => setPtzFeedback(null), 1500);
    }
  };
  
  // Sort entries: groups first, unassigned last
  const sortedGroupEntries = Object.entries(groupedCameras).sort(([idA], [idB]) => {
    if (idA === 'unassigned') return 1;
    if (idB === 'unassigned') return -1;
    return 0;
  });

  return (
    <div className="flex flex-1 h-full">
      {/* SideNavBar */}
      <aside className="w-[300px] flex flex-col bg-surface-container border-r border-border-subtle shadow-sm select-none">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-border-subtle">
              <span className="material-symbols-outlined text-primary">videocam</span>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-on-surface whitespace-nowrap">자산 탐색기</h2>
              <p className="text-[12px] text-text-muted font-mono">{cameras.length}개 카메라 감지됨</p>
            </div>
          </div>
          <button 
            onClick={() => fetchCameras()}
            className="p-1.5 text-text-muted hover:text-white hover:bg-surface-container-high rounded transition-colors"
            title="새로고침"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
        
        {/* Camera List for Dragging / Quick Assign */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-4 py-2 text-[11px] text-primary/80 bg-primary/10 mx-3 mb-2 rounded border border-primary/20 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">touch_app</span>
            <span>드래그하거나 더블클릭 시 슬롯에 자동 배정</span>
          </div>
          {sortedGroupEntries.map(([groupId, data]) => (
            (data.cameras.length > 0 || groupId !== 'unassigned') && (
              <div key={groupId} className="mb-2">
                <div 
                  className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors text-text-primary"
                  onClick={() => toggleGroup(groupId)}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">{expandedGroups[groupId] === false ? 'folder' : 'folder_open'}</span>
                    <span className="text-body-sm font-bold truncate max-w-[160px]" title={data.groupName}>{data.groupName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-text-muted font-mono bg-surface px-1.5 py-0.5 rounded border border-border-subtle">{data.cameras.length}</span>
                    <span className="material-symbols-outlined text-[16px] transition-transform" style={{ transform: expandedGroups[groupId] === false ? 'rotate(0deg)' : 'rotate(180deg)' }}>expand_more</span>
                  </div>
                </div>
                {expandedGroups[groupId] !== false && (
                  <div className="flex flex-col gap-1 mt-1 pl-2 pr-2">
                    {data.cameras.map(cam => (
                      <div 
                        key={cam.id} 
                        draggable 
                        onDragStart={(e) => handleDragStart(e, cam.id, cam.name)}
                        onDoubleClick={() => handleQuickAssign(cam.id, cam.name)}
                        className="px-3 py-2 flex items-center justify-between text-text-muted hover:text-white hover:bg-surface-container-high mx-2 rounded-lg cursor-grab active:cursor-grabbing border border-border-subtle bg-surface transition-all group"
                        title="더블클릭하여 선택된 슬롯에 배정"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${cam.isActive !== false ? 'bg-[#4edea3] shadow-[0_0_4px_#4edea3]' : 'bg-red-500 shadow-[0_0_4px_#f44336]'}`}></span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-[12px] text-white truncate max-w-[140px]" title={cam.name}>{cam.name}</span>
                            <span className="text-[10px] text-text-muted font-mono truncate">{cam.id}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAssign(cam.id, cam.name);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/20 hover:text-primary rounded transition-opacity"
                            title="현재 슬롯에 배정"
                          >
                            <span className="material-symbols-outlined text-[15px]">input</span>
                          </button>
                          <span className="material-symbols-outlined text-[16px] text-text-muted">drag_indicator</span>
                        </div>
                      </div>
                    ))}
                    {data.cameras.length === 0 && (
                      <div className="px-4 py-1 mx-2 text-[11px] text-text-muted italic">카메라 없음</div>
                    )}
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex bg-background min-w-0">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-3 py-2 bg-surface border-b border-border-subtle">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-text-muted">실시간 모니터링 관제</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono">
                슬롯 {selectedSlotId} 선택됨 ({selectedSlot?.cameraId ? selectedSlot.cameraName : '대기'})
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative group text-xs flex items-center space-x-2 z-50">
                <span className="text-text-muted font-bold">VLM 앙상블 ({activeModels.length}): </span>
                <div className="bg-[#070A13] border border-[#232C3F] text-white rounded px-2 py-1 text-[11px] font-mono cursor-pointer min-w-[150px] text-center shadow-inner">
                  {activeModels.length > 0 ? (activeModels.length === 1 ? activeModels[0] : `${activeModels[0]} 외 ${activeModels.length - 1}개`) : '선택'}
                </div>
                <div className="absolute top-full right-0 mt-1 w-[260px] bg-[#121724] border border-[#232C3F] rounded shadow-lg hidden group-hover:block p-2">
                  <div className="text-[10px] text-[#8E9AA8] mb-2 px-1">다중 선택 시 병렬 교차 검증을 수행합니다.</div>
                  <div className="space-y-1">
                    {vlmModels.map(model => (
                      <label key={model} className="flex items-center space-x-2 text-white cursor-pointer hover:bg-[#1E293B] p-1.5 rounded transition-colors">
                        <input 
                          type="checkbox" 
                          checked={activeModels.includes(model)}
                          onChange={() => handleModelToggle(model)}
                          className="rounded border-[#232C3F] bg-[#070A13] text-primary focus:ring-primary"
                        />
                        <span className="text-[11px] font-mono truncate">{model}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-xs text-[#8E9AA8] flex items-center space-x-1.5 bg-[#121724] px-2 py-1 rounded border border-[#232C3F]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
                <span>Fast-Loop HW: </span>
                <span className="text-white font-mono font-bold">NVDEC + YOLOv11</span>
              </div>
            </div>
          </div>

          {/* Video Grid */}
          <div 
            className="grid gap-[2px] p-[2px] flex-1 min-h-0 bg-black" 
            style={{ 
              gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(activeLayout))}, 1fr)`,
              gridTemplateRows: `repeat(${Math.ceil(Math.sqrt(activeLayout))}, 1fr)`
            }}
          >
            {slots.slice(0, activeLayout).map((slot) => {
              const isSelected = selectedSlotId === slot.slotId;
              return (
                <div 
                  key={slot.slotId}
                  onClick={() => setSelectedSlotId(slot.slotId)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, slot.slotId)}
                  onDoubleClick={handleDoubleClick}
                  className={`relative bg-[#0d111a] border-2 transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/50 z-10' 
                      : slot.status === 'active' 
                        ? 'border-[#232C3F] hover:border-[#3b4764]' 
                        : 'border-[#1b2233] border-dashed hover:border-[#2f3b56]'
                  } flex items-center justify-center overflow-hidden`}
                >
                  {slot.cameraId ? (
                    <>
                      <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
                        <img 
                          src={`http://localhost:8001/stream/${(slot.cameraId || 'cam-01').toLowerCase()}`}
                          alt="YOLOv11 Stream"
                          className="w-full h-full object-fill pointer-events-none"
                          onError={(e) => {
                            // Fast-loop fallback if stream error
                            const targetId = slot.cameraId ? slot.cameraId.toLowerCase() : 'cam-01';
                            (e.target as HTMLImageElement).src = `http://localhost:8001/snapshot/${targetId}?t=${Date.now()}`;
                          }}
                        />
                      </div>
                      
                      {/* Top Overlay Badge */}
                      <div className="absolute top-2 left-2 bg-[rgba(18,23,36,0.85)] backdrop-blur px-2.5 py-1 rounded-md text-[11px] text-white z-10 flex items-center gap-2 border border-[#232C3F]">
                        <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
                        <span className="font-bold text-[#d2bbff]">CH {String(slot.slotId).padStart(2, '0')}</span>
                        <span className="text-gray-300">|</span>
                        <span className="font-medium text-white truncate max-w-[120px]">{slot.cameraName}</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1 rounded border border-emerald-800/50">LIVE</span>
                      </div>

                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[#7C3AED] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          <span>제어 대상</span>
                        </div>
                      )}

                      {/* Bottom-right slot actions */}
                      <div className="absolute bottom-2 right-2 bg-[rgba(18,23,36,0.85)] backdrop-blur p-1.5 rounded-lg flex items-center gap-1.5 border border-[#232C3F] z-10">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerPtzCommand('zoom_in', '줌인');
                          }} 
                          className="p-1 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors" 
                          title="줌 인"
                        >
                          <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerPtzCommand('zoom_out', '줌아웃');
                          }} 
                          className="p-1 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors" 
                          title="줌 아웃"
                        >
                          <span className="material-symbols-outlined text-[16px]">zoom_out</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSlotStatus(slot.slotId, 'empty', { cameraId: null, cameraName: null });
                          }}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                          title="슬롯 비우기"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-300 transition-colors p-4 text-center">
                      <span className="material-symbols-outlined text-[40px] mb-2 opacity-60">add_to_queue</span>
                      <span className="text-[13px] font-bold tracking-wide">슬롯 {slot.slotId}</span>
                      <span className="text-[11px] text-gray-500 mt-0.5">카메라를 끌어다 놓거나 목록에서 더블클릭</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar Control Area */}
        <aside className="w-[310px] flex-shrink-0 bg-[#0b0e17] border-l border-[#232C3F] flex flex-col p-5 gap-6 text-gray-300 overflow-y-auto select-none">
          
          {/* PTZ Controls */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#232C3F] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#d2bbff]">control_camera</span>
                <span className="text-[14px] font-bold text-white tracking-wider">PTZ 제어 콘솔</span>
              </div>
              {ptzFeedback && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 animate-pulse">
                  {ptzFeedback}
                </span>
              )}
            </div>

            {/* Target Camera Indicator */}
            <div className="bg-[#121724] border border-[#232C3F] rounded-lg p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-gray-400 font-mono">제어 대상 채널</span>
                  <span className="text-[12px] font-bold text-white truncate max-w-[170px]" title={activeControlCameraName}>
                    {activeControlCameraName}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                CH {selectedSlotId}
              </span>
            </div>
            
            <div className="bg-[#121724] border border-[#232C3F] rounded-xl p-4 flex flex-col items-center gap-5 shadow-lg">
              <div className="grid grid-cols-3 grid-rows-3 gap-[4px]">
                {/* UP-LEFT */}
                <button 
                  onMouseDown={() => triggerPtzCommand('up-left', '대각선 좌상')}
                  onMouseUp={() => triggerPtzCommand('stop')}
                  onMouseLeave={() => triggerPtzCommand('stop')}
                  className="w-12 h-12 flex items-center justify-center bg-[#1c1f29] rounded-tl-xl hover:bg-[#31343f] text-gray-400 hover:text-[#d2bbff] transition-colors active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px] rotate-[-45deg]">arrow_upward</span>
                </button>
                {/* UP */}
                <button 
                  onMouseDown={() => triggerPtzCommand('up', '상향 이동')}
                  onMouseUp={() => triggerPtzCommand('stop')}
                  onMouseLeave={() => triggerPtzCommand('stop')}
                  className="w-12 h-12 flex items-center justify-center bg-[#1c1f29] hover:bg-[#31343f] text-gray-400 hover:text-[#d2bbff] transition-colors active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                </button>
                {/* UP-RIGHT */}
                <button 
                  onMouseDown={() => triggerPtzCommand('up-right', '대각선 우상')}
                  onMouseUp={() => triggerPtzCommand('stop')}
                  onMouseLeave={() => triggerPtzCommand('stop')}
                  className="w-12 h-12 flex items-center justify-center bg-[#1c1f29] rounded-tr-xl hover:bg-[#31343f] text-gray-400 hover:text-[#d2bbff] transition-colors active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px] rotate-[45deg]">arrow_upward</span>
                </button>
                
                {/* LEFT */}
                <button 
                  onMouseDown={() => triggerPtzCommand('left', '좌향 이동')}
                  onMouseUp={() => triggerPtzCommand('stop')}
                  onMouseLeave={() => triggerPtzCommand('stop')}
                  className="w-12 h-12 flex items-center justify-center bg-[#1c1f29] hover:bg-[#31343f] text-gray-400 hover:text-[#d2bbff] transition-colors active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
                {/* HOME */}
                <button 
                  onClick={() => triggerPtzCommand('home', '홈 위치 복귀')}
                  className="w-12 h-12 flex items-center justify-center bg-[#7c3aed] text-white rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)] hover:bg-[#6d28d9] transition-all transform hover:scale-105 active:scale-95"
                  title="원점 복귀 (Home)"
                >
                  <span className="material-symbols-outlined text-[20px]">my_location</span>
                </button>
                {/* RIGHT */}
                <button 
                  onMouseDown={() => triggerPtzCommand('right', '우향 이동')}
                  onMouseUp={() => triggerPtzCommand('stop')}
                  onMouseLeave={() => triggerPtzCommand('stop')}
                  className="w-12 h-12 flex items-center justify-center bg-[#1c1f29] hover:bg-[#31343f] text-gray-400 hover:text-[#d2bbff] transition-colors active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
                
                {/* DOWN-LEFT */}
                <button 
                  onMouseDown={() => triggerPtzCommand('down-left', '대각선 좌하')}
                  onMouseUp={() => triggerPtzCommand('stop')}
                  onMouseLeave={() => triggerPtzCommand('stop')}
                  className="w-12 h-12 flex items-center justify-center bg-[#1c1f29] rounded-bl-xl hover:bg-[#31343f] text-gray-400 hover:text-[#d2bbff] transition-colors active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px] rotate-[-135deg]">arrow_upward</span>
                </button>
                {/* DOWN */}
                <button 
                  onMouseDown={() => triggerPtzCommand('down', '하향 이동')}
                  onMouseUp={() => triggerPtzCommand('stop')}
                  onMouseLeave={() => triggerPtzCommand('stop')}
                  className="w-12 h-12 flex items-center justify-center bg-[#1c1f29] hover:bg-[#31343f] text-gray-400 hover:text-[#d2bbff] transition-colors active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
                </button>
                {/* DOWN-RIGHT */}
                <button 
                  onMouseDown={() => triggerPtzCommand('down-right', '대각선 우하')}
                  onMouseUp={() => triggerPtzCommand('stop')}
                  onMouseLeave={() => triggerPtzCommand('stop')}
                  className="w-12 h-12 flex items-center justify-center bg-[#1c1f29] rounded-br-xl hover:bg-[#31343f] text-gray-400 hover:text-[#d2bbff] transition-colors active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px] rotate-[135deg]">arrow_upward</span>
                </button>
              </div>

              <div className="w-full h-[1px] bg-[#232C3F]"></div>

              {/* Zoom & Focus Controls */}
              <div className="flex flex-col gap-3 w-full px-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] text-gray-400 font-bold w-8">줌</span>
                  <div className="flex items-center gap-2 flex-1">
                    <button 
                      onMouseDown={() => triggerPtzCommand('zoom-out', '줌 아웃')}
                      onMouseUp={() => triggerPtzCommand('stop')}
                      onMouseLeave={() => triggerPtzCommand('stop')}
                      className="flex-1 h-9 flex items-center justify-center text-gray-300 hover:text-[#d2bbff] bg-[#1c1f29] hover:bg-[#31343f] border border-[#232C3F] rounded-lg transition-colors active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <button 
                      onMouseDown={() => triggerPtzCommand('zoom-in', '줌 인')}
                      onMouseUp={() => triggerPtzCommand('stop')}
                      onMouseLeave={() => triggerPtzCommand('stop')}
                      className="flex-1 h-9 flex items-center justify-center text-gray-300 hover:text-[#d2bbff] bg-[#1c1f29] hover:bg-[#31343f] border border-[#232C3F] rounded-lg transition-colors active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] text-gray-400 font-bold w-8">초점</span>
                  <div className="flex items-center gap-2 flex-1">
                    <button 
                      onClick={() => triggerPtzCommand('focus_far', '원거리 초점')}
                      className="flex-1 h-9 flex items-center justify-center text-gray-300 hover:text-[#d2bbff] bg-[#1c1f29] hover:bg-[#31343f] border border-[#232C3F] rounded-lg transition-colors active:scale-95"
                      title="원거리 (Far)"
                    >
                      <span className="material-symbols-outlined text-[18px]">filter_center_focus</span>
                    </button>
                    <button 
                      onClick={() => triggerPtzCommand('focus_near', '근거리 초점')}
                      className="flex-1 h-9 flex items-center justify-center text-gray-300 hover:text-[#d2bbff] bg-[#1c1f29] hover:bg-[#31343f] border border-[#232C3F] rounded-lg transition-colors active:scale-95"
                      title="근거리 (Near)"
                    >
                      <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layouts */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-[#232C3F] pb-2.5">
              <span className="material-symbols-outlined text-[20px] text-[#d2bbff]">grid_view</span>
              <span className="text-[14px] font-bold text-white tracking-wider">화면 다분할</span>
            </div>
            
            <div className="bg-[#121724] border border-[#232C3F] rounded-xl p-3 grid grid-cols-5 gap-2 shadow-lg">
              {[1, 4, 9, 16, 36].map(num => {
                const cols = Math.ceil(Math.sqrt(num));
                return (
                  <button 
                    key={num}
                    onClick={() => setLayout(num)} 
                    className={`h-11 flex flex-col items-center justify-center rounded-lg border transition-all ${
                      activeLayout === num 
                        ? 'border-[#7c3aed] text-[#d2bbff] bg-[#7c3aed]/20 shadow-[0_0_10px_rgba(124,58,237,0.3)] font-bold' 
                        : 'border-[#232C3F] text-gray-400 bg-[#1c1f29] hover:bg-[#31343f] hover:text-[#d2bbff]'
                    }`}
                    title={`${num}분할`}
                  >
                    <div 
                      className="w-[18px] h-[18px] grid gap-[1px] p-[1px] border border-current rounded-[2px]"
                      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${cols}, 1fr)` }}
                    >
                      {Array.from({ length: Math.min(num, 16) }).map((_, i) => (
                        <div key={i} className="bg-current rounded-[1px] opacity-80"></div>
                      ))}
                    </div>
                    <span className="text-[10px] mt-0.5 font-mono">{num}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-col gap-3 mt-auto">
            <div className="flex items-center justify-between border-b border-[#232C3F] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#d2bbff]">bookmark</span>
                <span className="text-[14px] font-bold text-white tracking-wider">PTZ 프리셋</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">단축 위치</span>
            </div>
            <div className="bg-[#121724] border border-[#232C3F] rounded-xl p-3 grid grid-cols-5 gap-2 shadow-lg">
              {['P1', 'P2', 'P3', 'P4', 'P5'].map((p, idx) => (
                <button 
                  key={p} 
                  onClick={() => triggerPtzCommand(`preset_${idx + 1}`, `프리셋 ${p} 이동`)}
                  className="h-10 flex items-center justify-center text-[12px] font-bold text-gray-300 hover:text-white bg-[#1c1f29] hover:bg-[#7c3aed] rounded-lg transition-all border border-[#232C3F] hover:border-transparent hover:shadow-[0_0_8px_rgba(124,58,237,0.6)] active:scale-95"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

        </aside>
      </main>
    </div>
  );
};


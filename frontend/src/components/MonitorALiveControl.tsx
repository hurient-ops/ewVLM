import React from 'react';
import { useCameraStore } from '../store/useCameraStore';
import { useEventLogStore } from '../store/useEventLogStore';
import { WebRTCPlayer } from './WebRTCPlayer';
import { API } from '../api/client';

const MOCK_CAMERAS = [
  { id: 'CAM-01', name: '외곽 1구역 펜스 북부', status: 'online' },
  { id: 'CAM-02', name: '자재 창고 출입구', status: 'online' },
  { id: 'CAM-03', name: '중앙 변전실 내부', status: 'online' },
  { id: 'CAM-04', name: '본관 메인 로비', status: 'online' },
];

export const MonitorALiveControl: React.FC = () => {
  const { slots, activeLayout, setLayout, updateSlotStatus, cameras, groups, fetchCameras } = useCameraStore();
  const [vlmModels, setVlmModels] = React.useState<string[]>([]);
  const [activeModels, setActiveModels] = React.useState<string[]>(["Llama 3.2 11B Vision Instruct"]);
  
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});

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
    let newModels;
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
      updateSlotStatus(slotId, 'active', { cameraId, cameraName });
      useEventLogStore.getState().addLog({
        cameraId,
        cameraName,
        level: 'info',
        message: `모니터 슬롯 ${slotId}에 카메라 바인딩 완료`,
        confidence: 1.0
      });
      
      // Simulate YOLO pipeline initialization
      setTimeout(() => {
        useEventLogStore.getState().addLog({
          cameraId,
          cameraName,
          level: 'info',
          message: `[Edge AI] ${cameraId} 채널 실시간 YOLO11 분석 파이프라인 활성화`,
          confidence: 1.0
        });
      }, 800);
    }
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
  
  // Sort entries: groups first, unassigned last
  const sortedGroupEntries = Object.entries(groupedCameras).sort(([idA], [idB]) => {
    if (idA === 'unassigned') return 1;
    if (idB === 'unassigned') return -1;
    return 0;
  });

  return (
    <div className="flex flex-1 h-full">
      {/* SideNavBar */}
      <aside className="w-[280px] flex flex-col bg-surface-container border-r border-border-subtle shadow-sm">
        <div className="p-4 border-b border-border-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-surface flex items-center justify-center border border-border-subtle">
            <span className="material-symbols-outlined text-primary">analytics</span>
          </div>
          <div>
            <h2 className="text-[16px] font-semibold text-on-surface whitespace-nowrap">자산 탐색기</h2>
            <p className="text-[12px] text-text-muted mt-1 font-mono">{cameras.length} 활성 채널</p>
          </div>
        </div>
        
        {/* Camera List for Dragging */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-4 py-2 text-xs text-text-muted mb-2">
            💡 팁: 카메라를 우측 빈 슬롯으로 드래그하세요.
          </div>
          {sortedGroupEntries.map(([groupId, data]) => (
            (data.cameras.length > 0 || groupId !== 'unassigned') && (
              <div key={groupId} className="mb-2">
                <div 
                  className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors text-text-primary"
                  onClick={() => toggleGroup(groupId)}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">{expandedGroups[groupId] === false ? 'folder' : 'folder_open'}</span>
                    <span className="text-body-sm font-bold truncate max-w-[150px]" title={data.groupName}>{data.groupName}</span>
                  </div>
                  <span className="material-symbols-outlined text-[16px] transition-transform" style={{ transform: expandedGroups[groupId] === false ? 'rotate(0deg)' : 'rotate(180deg)' }}>expand_more</span>
                </div>
                {expandedGroups[groupId] !== false && (
                  <div className="flex flex-col gap-1 mt-1 pl-2 pr-2">
                    {data.cameras.map(cam => (
                      <div 
                        key={cam.id} 
                        draggable 
                        onDragStart={(e) => handleDragStart(e, cam.id, cam.name)}
                        className="px-3 py-2 flex flex-col gap-1 text-text-muted hover:text-on-surface-variant hover:bg-surface-container-high mx-2 rounded-lg cursor-grab active:cursor-grabbing border border-border-subtle bg-surface"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${cam.isActive !== false ? 'bg-[#4edea3] shadow-[0_0_4px_#4edea3]' : 'bg-red-500 shadow-[0_0_4px_#f44336]'}`}></span>
                            <span className="font-bold text-[13px] text-white truncate max-w-[150px]" title={cam.name}>{cam.name}</span>
                          </div>
                          <span className="material-symbols-outlined text-[16px]">drag_indicator</span>
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
          <div className="flex items-center justify-between p-2 bg-surface border-b border-border-subtle">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-text-muted">실시간 모니터링 컨트롤</span>
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
              <span>CCTV RTSP 디코더: </span>
              <span className="text-white font-mono font-bold">NVIDIA NVDEC Hardware</span>
            </div>
          </div>
        </div>
        {/* Video Grid */}
        <div 
          className="grid gap-[2px] p-[2px] flex-1 min-h-0" 
          style={{ 
            gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(activeLayout))}, 1fr)`,
            gridTemplateRows: `repeat(${Math.ceil(Math.sqrt(activeLayout))}, 1fr)`
          }}
        >
          {slots.slice(0, activeLayout).map((slot) => (
            <div 
              key={slot.slotId}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, slot.slotId)}
              onDoubleClick={handleDoubleClick}
              className={`relative bg-[#121724] border-2 ${slot.status === 'active' ? 'border-[#7C3AED] shadow-[0_0_15px_rgba(124,58,237,0.4)]' : 'border-[#232C3F] border-dashed'} flex items-center justify-center overflow-hidden transition-all`}
            >
              {slot.cameraId ? (
                <>
                  <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
                    <WebRTCPlayer streamUrl={`http://localhost:8889/${slot.cameraId.toLowerCase()}`} />
                  </div>
                  <div className="absolute top-2 left-2 bg-[rgba(18,23,36,0.8)] px-2 py-1 rounded text-[12px] text-white z-10 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
                      <span className="font-bold">CH {String(slot.slotId).padStart(2, '0')} | {slot.cameraName}</span>
                    </div>
                  </div>
                  {/* Mock PTZ Control overlay */}
                  <div className="absolute bottom-4 right-4 bg-[rgba(18,23,36,0.8)] backdrop-blur p-2 rounded-full flex gap-2 border border-[#232C3F]">
                    <button className="p-1 text-gray-300 hover:text-white transition-colors"><span className="material-symbols-outlined text-[16px]">zoom_in</span></button>
                    <button className="p-1 text-gray-300 hover:text-white transition-colors"><span className="material-symbols-outlined text-[16px]">zoom_out</span></button>
                    <button 
                      onClick={() => updateSlotStatus(slot.slotId, 'empty', { cameraId: null, cameraName: null })}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors ml-2"
                      title="연결 해제"
                    ><span className="material-symbols-outlined text-[16px]">close</span></button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[48px] mb-2 opacity-80">add_circle</span>
                  <span className="text-[15px] font-bold tracking-wide">카메라 끌어다 놓기</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar Control Area */}
      <aside className="w-[300px] flex-shrink-0 bg-[#0b0e17] border-l border-[#232C3F] flex flex-col p-6 gap-8 text-gray-300 overflow-y-auto">
          
          {/* PTZ Controls */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#232C3F] pb-3">
              <span className="material-symbols-outlined text-[20px] text-[#d2bbff]">control_camera</span>
              <span className="text-[14px] font-bold text-white tracking-wider">PTZ 제어</span>
            </div>
            
            <div className="bg-[#121724] border border-[#232C3F] rounded-xl p-5 flex flex-col items-center gap-6 shadow-lg">
              <div className="grid grid-cols-3 grid-rows-3 gap-[3px]">
                {/* UP-LEFT */}
                <button 
                  onMouseDown={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'up-left')}
                  onMouseUp={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                  onMouseLeave={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                  className="w-12 h-12 flex items-center justify-center bg-[#1c1f29] rounded-tl-xl hover:bg-[#31343f] text-gray-400 hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[22px] rotate-[-45deg]">arrow_upward</span></button>
                {/* UP */}
                <button 
                  onMouseDown={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'up')}
                  onMouseUp={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                  onMouseLeave={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                  className="w-12 h-12 flex items-center justify-center bg-[#1c1f29] hover:bg-[#31343f] text-gray-400 hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[22px]">arrow_upward</span></button>
                {/* UP-RIGHT */}
                <button 
                  onMouseDown={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'up-right')}
                  onMouseUp={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                  onMouseLeave={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                  className="w-12 h-12 flex items-center justify-center bg-[#1c1f29] rounded-tr-xl hover:bg-[#31343f] text-gray-400 hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[22px] rotate-[45deg]">arrow_upward</span></button>
                
                {/* LEFT */}
                <button 
                  onMouseDown={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'left')}
                  onMouseUp={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                  onMouseLeave={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                  className="w-12 h-12 flex items-center justify-center bg-[#1c1f29] hover:bg-[#31343f] text-gray-400 hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[22px]">arrow_back</span></button>
                {/* HOME */}
                <button 
                  onClick={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'home')}
                  className="w-12 h-12 flex items-center justify-center bg-[#7c3aed] text-white rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)] hover:bg-[#6d28d9] transition-colors transform scale-110"><span className="material-symbols-outlined text-[22px]">my_location</span></button>
                {/* RIGHT */}
                <button 
                  onMouseDown={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'right')}
                  onMouseUp={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                  onMouseLeave={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                  className="w-12 h-12 flex items-center justify-center bg-[#1c1f29] hover:bg-[#31343f] text-gray-400 hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[22px]">arrow_forward</span></button>
                
                {/* DOWN-LEFT */}
                <button 
                  onMouseDown={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'down-left')}
                  onMouseUp={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                  onMouseLeave={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                  className="w-12 h-12 flex items-center justify-center bg-[#1c1f29] rounded-bl-xl hover:bg-[#31343f] text-gray-400 hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[22px] rotate-[-135deg]">arrow_upward</span></button>
                {/* DOWN */}
                <button 
                  onMouseDown={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'down')}
                  onMouseUp={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                  onMouseLeave={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                  className="w-12 h-12 flex items-center justify-center bg-[#1c1f29] hover:bg-[#31343f] text-gray-400 hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[22px]">arrow_downward</span></button>
                {/* DOWN-RIGHT */}
                <button 
                  onMouseDown={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'down-right')}
                  onMouseUp={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                  onMouseLeave={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                  className="w-12 h-12 flex items-center justify-center bg-[#1c1f29] rounded-br-xl hover:bg-[#31343f] text-gray-400 hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[22px] rotate-[135deg]">arrow_upward</span></button>
              </div>

              <div className="w-full h-[1px] bg-[#232C3F]"></div>

              <div className="flex flex-col gap-4 w-full px-2">
                <div className="flex items-center gap-4">
                  <span className="text-[12px] text-gray-500 font-bold w-6">줌</span>
                  <button 
                    onMouseDown={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'zoom-out')}
                    onMouseUp={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                    onMouseLeave={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#d2bbff] bg-[#1c1f29] hover:bg-[#31343f] border border-[#232C3F] rounded-lg transition-colors"><span className="material-symbols-outlined text-[20px]">remove</span></button>
                  <button 
                    onMouseDown={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'zoom-in')}
                    onMouseUp={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                    onMouseLeave={() => API.controlPtz(slots.find(s => s.status === 'active')?.cameraId || 'CAM-01', 'stop')}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#d2bbff] bg-[#1c1f29] hover:bg-[#31343f] border border-[#232C3F] rounded-lg transition-colors flex-1"><span className="material-symbols-outlined text-[20px]">add</span></button>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[12px] text-gray-500 font-bold w-6">초점</span>
                  <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#d2bbff] bg-[#1c1f29] hover:bg-[#31343f] border border-[#232C3F] rounded-lg transition-colors"><span className="material-symbols-outlined text-[20px]">remove</span></button>
                  <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#d2bbff] bg-[#1c1f29] hover:bg-[#31343f] border border-[#232C3F] rounded-lg transition-colors flex-1"><span className="material-symbols-outlined text-[20px]">add</span></button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layouts */}
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center gap-2 border-b border-[#232C3F] pb-3">
              <span className="material-symbols-outlined text-[20px] text-[#d2bbff]">grid_view</span>
              <span className="text-[14px] font-bold text-white tracking-wider">화면 분할</span>
            </div>
            
            <div className="bg-[#121724] border border-[#232C3F] rounded-xl p-4 grid grid-cols-5 gap-2 shadow-lg">
              {[1, 4, 9, 16, 36].map(num => {
                const cols = Math.ceil(Math.sqrt(num));
                return (
                  <button 
                    key={num}
                    onClick={() => setLayout(num)} 
                    className={`h-11 flex flex-col items-center justify-center rounded-lg border transition-colors ${activeLayout === num ? 'border-[#7c3aed] text-[#d2bbff] bg-[#7c3aed]/20 shadow-[0_0_10px_rgba(124,58,237,0.3)]' : 'border-[#232C3F] text-gray-500 bg-[#1c1f29] hover:bg-[#31343f] hover:text-[#d2bbff]'}`}
                    title={`${num}분할`}
                  >
                    {/* 커스텀 분할 박스 아이콘 */}
                    <div 
                      className="w-[20px] h-[20px] grid gap-[1px] p-[1px] border border-current rounded-[3px]"
                      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${cols}, 1fr)` }}
                    >
                      {Array.from({ length: num }).map((_, i) => (
                        <div key={i} className="bg-current rounded-sm opacity-90"></div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-col gap-4 mt-auto">
            <div className="flex items-center gap-2 border-b border-[#232C3F] pb-3">
              <span className="material-symbols-outlined text-[20px] text-[#d2bbff]">bookmark</span>
              <span className="text-[14px] font-bold text-white tracking-wider">프리셋 (투어)</span>
            </div>
            <div className="bg-[#121724] border border-[#232C3F] rounded-xl p-3 grid grid-cols-5 gap-2 shadow-lg">
              {['P1', 'P2', 'P3', 'P4', 'P5'].map(p => (
                <button key={p} className="h-10 flex items-center justify-center text-[13px] font-bold text-gray-400 hover:text-white bg-[#1c1f29] hover:bg-[#7c3aed] rounded-lg transition-colors border border-[#232C3F] hover:border-transparent hover:shadow-[0_0_8px_rgba(124,58,237,0.6)]">
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

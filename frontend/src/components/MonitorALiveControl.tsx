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
  const { slots, activeLayout, setLayout, updateSlotStatus } = useCameraStore();

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
            <p className="text-[12px] text-text-muted mt-1 font-mono">{MOCK_CAMERAS.length} 활성 채널</p>
          </div>
        </div>
        
        {/* Camera List for Dragging */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-4 py-2 text-xs text-text-muted mb-2">
            💡 팁: 카메라를 우측 빈 슬롯으로 드래그하세요.
          </div>
          {MOCK_CAMERAS.map((cam) => (
            <div 
              key={cam.id} 
              draggable 
              onDragStart={(e) => handleDragStart(e, cam.id, cam.name)}
              className="px-3 py-3 flex flex-col gap-1 text-text-muted hover:text-on-surface-variant hover:bg-surface-container-high mx-2 rounded-lg mb-2 cursor-grab active:cursor-grabbing border border-border-subtle bg-surface"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full bg-[#4edea3] shadow-[0_0_4px_#4edea3]`}></span>
                  <span className="font-mono text-[12px] font-bold text-white">{cam.id}</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">drag_indicator</span>
              </div>
              <span className="text-[12px] truncate">{cam.name}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex bg-background min-w-0">
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
              className={`relative bg-[#121724] border-2 ${slot.status === 'active' ? 'border-[#7C3AED] shadow-[0_0_15px_rgba(124,58,237,0.4)]' : 'border-[#232C3F] border-dashed'} flex items-center justify-center overflow-hidden transition-all`}
            >
              {slot.cameraId ? (
                <>
                  <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
                    <WebRTCPlayer streamUrl={`http://localhost:8890/stream/${slot.cameraId.toLowerCase()}`} />
                  </div>
                  <div className="absolute top-2 left-2 bg-[rgba(18,23,36,0.8)] px-2 py-1 rounded text-[12px] text-white z-10 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
                      <span className="font-bold">CH {String(slot.slotId).padStart(2, '0')} | {slot.cameraId}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">{slot.cameraName}</span>
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

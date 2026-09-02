import React from 'react';
import { API } from '../../api/client';
import { WebRTCPlayer } from '../WebRTCPlayer';

interface PtzControlOverlayProps {
  selectedMarkerId: string | null;
}

export const PtzControlOverlay: React.FC<PtzControlOverlayProps> = ({ selectedMarkerId }) => {
  return (
    <div className="absolute bottom-6 right-6 w-72 bg-[#121724]/90 backdrop-blur-md border border-[#232C3F] rounded-xl shadow-lg flex flex-col overflow-hidden pointer-events-auto">
      <div className="bg-[#1c1f29] px-4 py-2 border-b border-[#232C3F] flex justify-between items-center">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#d2bbff]">control_camera</span> PTZ 제어 ({selectedMarkerId || '전체 맵'}) 
        </h3>
        <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
      </div>
      
      <div className="p-4 flex flex-col gap-4">
        {/* Live Mini Feed */}
        <div className="w-full h-32 bg-black border border-[#232C3F] rounded-lg relative overflow-hidden group">
          <WebRTCPlayer streamUrl={`http://localhost:8889/${(selectedMarkerId || 'cam-real-1787557630').toLowerCase()}`} />
          <div className="absolute bottom-1 right-2 text-[#d2bbff] shadow-sm bg-black/80 px-1 rounded text-[10px] font-mono font-bold">LIVE • 1080p</div>
        </div>
        
        {/* Jog Shuttle Controls */}
        <div className="flex justify-center items-center py-2 relative">
          <div className="grid grid-cols-3 gap-2 z-10 relative">
            {/* UP-LEFT */}
            <button 
              onMouseDown={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'up-left')}
              onMouseUp={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
              onMouseLeave={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
              className="w-8 h-8 rounded bg-[#1c1f29] border border-[#232C3F] flex items-center justify-center text-gray-400 hover:bg-[#31343f] hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[16px] transform -rotate-45">arrow_upward</span></button>
            {/* UP */}
            <button 
              onMouseDown={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'up')}
              onMouseUp={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
              onMouseLeave={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
              className="w-8 h-8 rounded bg-[#1c1f29] border border-[#232C3F] flex items-center justify-center text-gray-400 hover:bg-[#31343f] hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[16px]">arrow_upward</span></button>
            {/* UP-RIGHT */}
            <button 
              onMouseDown={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'up-right')}
              onMouseUp={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
              onMouseLeave={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
              className="w-8 h-8 rounded bg-[#1c1f29] border border-[#232C3F] flex items-center justify-center text-gray-400 hover:bg-[#31343f] hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[16px] transform rotate-45">arrow_upward</span></button>
            {/* LEFT */}
            <button 
              onMouseDown={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'left')}
              onMouseUp={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
              onMouseLeave={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
              className="w-8 h-8 rounded bg-[#1c1f29] border border-[#232C3F] flex items-center justify-center text-gray-400 hover:bg-[#31343f] hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[16px]">arrow_back</span></button>
            {/* HOME */}
            <button 
              onClick={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'home')}
              className="w-8 h-8 rounded-full bg-[#7c3aed] border border-[#7c3aed] flex items-center justify-center text-white hover:bg-[#6d28d9] transition-colors shadow-[0_0_10px_rgba(124,58,237,0.4)]"><span className="material-symbols-outlined text-[16px]">my_location</span></button>
            {/* RIGHT */}
            <button 
              onMouseDown={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'right')}
              onMouseUp={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
              onMouseLeave={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
              className="w-8 h-8 rounded bg-[#1c1f29] border border-[#232C3F] flex items-center justify-center text-gray-400 hover:bg-[#31343f] hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[16px]">arrow_forward</span></button>
            {/* DOWN-LEFT */}
            <button 
              onMouseDown={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'down-left')}
              onMouseUp={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
              onMouseLeave={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
              className="w-8 h-8 rounded bg-[#1c1f29] border border-[#232C3F] flex items-center justify-center text-gray-400 hover:bg-[#31343f] hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[16px] transform -rotate-45">arrow_downward</span></button>
            {/* DOWN */}
            <button 
              onMouseDown={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'down')}
              onMouseUp={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
              onMouseLeave={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
              className="w-8 h-8 rounded bg-[#1c1f29] border border-[#232C3F] flex items-center justify-center text-gray-400 hover:bg-[#31343f] hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[16px]">arrow_downward</span></button>
            {/* DOWN-RIGHT */}
            <button 
              onMouseDown={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'down-right')}
              onMouseUp={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
              onMouseLeave={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
              className="w-8 h-8 rounded bg-[#1c1f29] border border-[#232C3F] flex items-center justify-center text-gray-400 hover:bg-[#31343f] hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[16px] transform rotate-45">arrow_downward</span></button>
          </div>
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs font-bold text-gray-500 w-8">줌</span>
          <button 
            onMouseDown={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'zoom-out')}
            onMouseUp={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
            onMouseLeave={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
            className="flex-1 bg-[#1c1f29] border border-[#232C3F] rounded py-1 flex justify-center items-center hover:border-[#d2bbff]/50 hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[18px]">remove</span></button>
          <button 
            onMouseDown={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'zoom-in')}
            onMouseUp={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
            onMouseLeave={() => API.controlPtz(selectedMarkerId || 'CAM-01', 'stop')}
            className="flex-1 bg-[#1c1f29] border border-[#232C3F] rounded py-1 flex justify-center items-center hover:border-[#d2bbff]/50 hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[18px]">add</span></button>
        </div>
      </div>
    </div>
  );
};

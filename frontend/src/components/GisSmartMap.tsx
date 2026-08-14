import React, { useState, useEffect } from 'react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useEventLogStore } from '../store/useEventLogStore';
import { useGisStore, GisMarker } from '../store/useGisStore';
import axios from 'axios';
import { WebRTCPlayer } from './WebRTCPlayer';
import { API } from '../api/client';

interface Camera {
  camera_id: string;
  name: string;
  ip_address: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
}

export const GisSmartMap: React.FC = () => {
  // 카카오 디벨로퍼스(https://developers.kakao.com)에서 발급받은 'JavaScript 키'를 입력하세요.
  const [loading, error] = useKakaoLoader({
    appkey: '44e09b9c015f936e3be324d74f5c9eaf', 
  });

  // 지도 타입 상태 (ROADMAP: 일반뷰, SKYVIEW: 위성뷰)
  const [mapType, setMapType] = useState<"ROADMAP" | "SKYVIEW">("ROADMAP");
  const { markers, setMarkers, center, zoomLevel, selectedMarkerId, selectMarker } = useGisStore();

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/cameras');
        if (response.data.status === 'success') {
          const fetchedMarkers: GisMarker[] = response.data.cameras.map((c: any) => ({
            id: c.camera_id,
            type: 'camera',
            lat: c.latitude,
            lng: c.longitude,
            name: c.name,
            status: c.is_active ? 'normal' : 'offline'
          }));
          setMarkers(fetchedMarkers);
        }
      } catch (err) {
        console.error("Failed to fetch cameras:", err);
      }
    };
    fetchCameras();
  }, [setMarkers]);

  const { logs } = useEventLogStore();
  const latestCriticalLog = logs.find(log => log.level === 'critical');

  return (
    <main className="flex-1 relative bg-[#0b0e17] overflow-hidden">
      
      {/* 🗺️ 1. 카카오맵 영역 */}
      <div className="absolute inset-0 z-0">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-white bg-[#0b0e17]">
            <p>카카오 맵을 불러오는 중입니다...</p>
          </div>
        ) : error ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-red-400 bg-[#0b0e17] p-8 text-center border-4 border-red-900/50">
            <span className="material-symbols-outlined text-5xl mb-4">error</span>
            <h2 className="text-2xl font-bold mb-2">카카오맵 API 키 에러 / 미등록 도메인</h2>
            <p className="text-gray-300">
              현재 API 키가 등록되어 있으나 지도를 불러올 수 없습니다.<br/>
              카카오 디벨로퍼스 <strong>웹 플랫폼 사이트 도메인</strong>에 아래 주소가<br/>
              정상적으로 등록되어 있는지 확인해 주세요.<br/><br/>
              <code className="bg-black px-3 py-2 text-green-400 font-bold rounded text-lg">{window.location.origin}</code>
            </p>
          </div>
        ) : (
          <Map 
            center={center}
            style={{ width: '100%', height: '100%' }}
            level={zoomLevel} // 줌 레벨
            mapTypeId={mapType} // 지도 뷰 타입 설정 (일반 / 위성)
          >
            {/* 기본 기준점 마커 */}
            <MapMarker position={center}>
              <div style={{ padding: "5px", color: "#000", fontWeight: "bold" }}>본관 메인</div>
            </MapMarker>

            {/* DB 연동 카메라 마커 */}
            {markers.map((marker) => {
              const isEventActive = latestCriticalLog?.cameraId === marker.id;
              const isSelected = selectedMarkerId === marker.id;
              return (
                <MapMarker 
                  key={marker.id} 
                  position={{ lat: marker.lat, lng: marker.lng }}
                  onClick={() => selectMarker(marker.id)}
                >
                  <div className={`px-3 py-1.5 rounded-lg font-bold border whitespace-nowrap z-50 relative cursor-pointer ${
                    isEventActive 
                    ? "bg-danger text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)] border-red-900" 
                    : isSelected 
                    ? "bg-[#7c3aed] text-white border-[#d2bbff] shadow-[0_0_15px_rgba(124,58,237,0.8)]"
                    : "bg-[#1c1f29]/90 text-white border-[#232C3F] shadow-lg"
                  }`}>
                    {isEventActive ? `🚨 ${marker.id} - ${latestCriticalLog.message}` : `📷 ${marker.name} (${marker.id})`}
                  </div>
                </MapMarker>
              );
            })}
          </Map>
        )}
      </div>

      {/* 🌐 2. VMS UI Overlays (맵 위에 플로팅) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        
        {/* Floating PTZ Control Panel */}
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
              <WebRTCPlayer streamUrl={`http://localhost:8889/${(selectedMarkerId || 'cam-01').toLowerCase()}`} />
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

        {/* Map View Controls (Top Right Overlay) */}
        <div className="absolute top-6 right-6 flex gap-2 z-30 pointer-events-auto">
          <div className="bg-[#121724]/80 backdrop-blur-md border border-[#232C3F] rounded-lg flex overflow-hidden shadow-md p-1 gap-1">
            <button 
              onClick={() => setMapType("ROADMAP")}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${mapType === "ROADMAP" ? "bg-[#7c3aed] text-white" : "text-gray-400 hover:bg-[#31343f] hover:text-white"}`}
            > 
              일반 뷰 
            </button>
            <button 
              onClick={() => setMapType("SKYVIEW")}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${mapType === "SKYVIEW" ? "bg-[#7c3aed] text-white" : "text-gray-400 hover:bg-[#31343f] hover:text-white"}`}
            > 
              위성 (스카이뷰) 
            </button>
          </div>
        </div>
        
      </div>
    </main>
  );
};


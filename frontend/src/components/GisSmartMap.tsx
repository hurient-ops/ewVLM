import React, { useState } from 'react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useEventLogStore } from '../store/useEventLogStore';

const CAMERA_POSITIONS: Record<string, { lat: number, lng: number }> = {
  'CAM-01': { lat: 37.4019, lng: 127.1089 },
  'CAM-02': { lat: 37.4025, lng: 127.1100 },
  'CAM-03': { lat: 37.4010, lng: 127.1080 },
  'CAM-04': { lat: 37.4000, lng: 127.1110 },
  'CAM-05': { lat: 37.3990, lng: 127.1095 },
  'SYSTEM': { lat: 37.4015, lng: 127.1095 }
};

export const GisSmartMap: React.FC = () => {
  // 카카오 디벨로퍼스(https://developers.kakao.com)에서 발급받은 'JavaScript 키'를 입력하세요.
  const [loading, error] = useKakaoLoader({
    appkey: '44e09b9c015f936e3be324d74f5c9eaf', 
  });

  // 지도 타입 상태 (ROADMAP: 일반뷰, SKYVIEW: 위성뷰)
  const [mapType, setMapType] = useState<"ROADMAP" | "SKYVIEW">("ROADMAP");

  const { logs } = useEventLogStore();
  const latestCriticalLog = logs.find(log => log.level === 'critical');

  // 임의의 산업단지 느낌 좌표 (판교 테크노밸리 부근)
  const centerPosition = { lat: 37.4019, lng: 127.1089 };

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
            <h2 className="text-2xl font-bold mb-2">카카오맵 API 키가 필요합니다!</h2>
            <p className="text-gray-300">
              `src/components/GisSmartMap.tsx` 파일 내부에 있는 <br/>
              <code className="bg-black px-2 py-1 text-green-400 rounded">YOUR_KAKAO_APP_KEY_HERE</code> 부분을 <br/>
              실제 카카오 디벨로퍼스에서 발급받은 <strong>JavaScript 키</strong>로 교체해 주세요.
            </p>
          </div>
        ) : (
          <Map 
            center={centerPosition}
            style={{ width: '100%', height: '100%' }}
            level={4} // 줌 레벨
            mapTypeId={mapType} // 지도 뷰 타입 설정 (일반 / 위성)
          >
            {/* 기본 기준점 마커 */}
            <MapMarker position={centerPosition}>
              <div style={{ padding: "5px", color: "#000", fontWeight: "bold" }}>본관 메인</div>
            </MapMarker>
            
            {/* VLM 동적 이벤트 마커 */}
            {latestCriticalLog && CAMERA_POSITIONS[latestCriticalLog.cameraId] && (
              <MapMarker position={CAMERA_POSITIONS[latestCriticalLog.cameraId]}>
                <div className="bg-danger text-white px-3 py-1.5 rounded-lg font-bold animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)] border border-red-900 whitespace-nowrap z-50 relative">
                  🚨 {latestCriticalLog.cameraId} - {latestCriticalLog.message}
                </div>
              </MapMarker>
            )}
          </Map>
        )}
      </div>

      {/* 🌐 2. VMS UI Overlays (맵 위에 플로팅) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        
        {/* Floating PTZ Control Panel */}
        <div className="absolute bottom-6 right-6 w-72 bg-[#121724]/90 backdrop-blur-md border border-[#232C3F] rounded-xl shadow-lg flex flex-col overflow-hidden pointer-events-auto">
          <div className="bg-[#1c1f29] px-4 py-2 border-b border-[#232C3F] flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#d2bbff]">control_camera</span> PTZ 제어 (CAM-01) 
            </h3>
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
          </div>
          
          <div className="p-4 flex flex-col gap-4">
            {/* Live Mini Feed */}
            <div className="w-full h-32 bg-black border border-[#232C3F] rounded-lg relative overflow-hidden group">
              <img alt="Live Feed Mini" className="w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDY0fPIy4Ou080oe0jSfLAERGfrhSHdG7otJ4IRTmXX5MaYOc9DBZD6x--ugir_t_n04eAADvgCjalKMXImzCg4ng8DDVGcaJWxTtYVsEzcpBETIE8K8IycjN5x0hhtaOFyNhS2yRa1GSatduCYOvMTa_Lqs45yWK7gr1IzWdRVfRL_DP0LBL6Varhj9Zk98B-44AZPgoCBfJP1RKVCtyohlxnK3HKJ9zgLNh2OsGk33BD0jn2LdlyZwA"/>
              <div className="absolute bottom-1 right-2 text-[#d2bbff] shadow-sm bg-black/80 px-1 rounded text-[10px] font-mono font-bold">LIVE • 1080p</div>
            </div>
            
            {/* Jog Shuttle Controls */}
            <div className="flex justify-center items-center py-2 relative">
              <div className="grid grid-cols-3 gap-2 z-10 relative">
                <button className="w-8 h-8 rounded bg-[#1c1f29] border border-[#232C3F] flex items-center justify-center text-gray-400 hover:bg-[#31343f] hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[16px] transform -rotate-45">arrow_upward</span></button>
                <button className="w-8 h-8 rounded bg-[#1c1f29] border border-[#232C3F] flex items-center justify-center text-gray-400 hover:bg-[#31343f] hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[16px]">arrow_upward</span></button>
                <button className="w-8 h-8 rounded bg-[#1c1f29] border border-[#232C3F] flex items-center justify-center text-gray-400 hover:bg-[#31343f] hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[16px] transform rotate-45">arrow_upward</span></button>
                <button className="w-8 h-8 rounded bg-[#1c1f29] border border-[#232C3F] flex items-center justify-center text-gray-400 hover:bg-[#31343f] hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[16px]">arrow_back</span></button>
                <button className="w-8 h-8 rounded-full bg-[#7c3aed] border border-[#7c3aed] flex items-center justify-center text-white hover:bg-[#6d28d9] transition-colors shadow-[0_0_10px_rgba(124,58,237,0.4)]"><span className="material-symbols-outlined text-[16px]">my_location</span></button>
                <button className="w-8 h-8 rounded bg-[#1c1f29] border border-[#232C3F] flex items-center justify-center text-gray-400 hover:bg-[#31343f] hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[16px]">arrow_forward</span></button>
                <button className="w-8 h-8 rounded bg-[#1c1f29] border border-[#232C3F] flex items-center justify-center text-gray-400 hover:bg-[#31343f] hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[16px] transform -rotate-45">arrow_downward</span></button>
                <button className="w-8 h-8 rounded bg-[#1c1f29] border border-[#232C3F] flex items-center justify-center text-gray-400 hover:bg-[#31343f] hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[16px]">arrow_downward</span></button>
                <button className="w-8 h-8 rounded bg-[#1c1f29] border border-[#232C3F] flex items-center justify-center text-gray-400 hover:bg-[#31343f] hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[16px] transform rotate-45">arrow_downward</span></button>
              </div>
            </div>
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold text-gray-500 w-8">줌</span>
              <button className="flex-1 bg-[#1c1f29] border border-[#232C3F] rounded py-1 flex justify-center items-center hover:border-[#d2bbff]/50 hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[18px]">remove</span></button>
              <button className="flex-1 bg-[#1c1f29] border border-[#232C3F] rounded py-1 flex justify-center items-center hover:border-[#d2bbff]/50 hover:text-[#d2bbff] transition-colors"><span className="material-symbols-outlined text-[18px]">add</span></button>
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


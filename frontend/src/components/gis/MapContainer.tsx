import React, { useEffect } from 'react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useEventLogStore } from '../../store/useEventLogStore';
import { useGisStore, GisMarker } from '../../store/useGisStore';
import axios from 'axios';

interface MapContainerProps {
  mapType: "ROADMAP" | "SKYVIEW";
}

export const MapContainer: React.FC<MapContainerProps> = ({ mapType }) => {
  const [loading, error] = useKakaoLoader({
    appkey: '44e09b9c015f936e3be324d74f5c9eaf', 
  });

  const { markers, setMarkers, center, zoomLevel, selectedMarkerId, selectMarker } = useGisStore();
  const { logs } = useEventLogStore();
  const latestCriticalLog = logs.find(log => log.level === 'critical');

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

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white bg-[#0b0e17]">
        <p>카카오 맵을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <Map 
      center={center}
      style={{ width: '100%', height: '100%' }}
      level={zoomLevel}
      mapTypeId={mapType}
    >
      <MapMarker position={center}>
        <div style={{ padding: "5px", color: "#000", fontWeight: "bold" }}>본관 메인</div>
      </MapMarker>

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
  );
};

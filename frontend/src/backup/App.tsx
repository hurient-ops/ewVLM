import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Tv, 
  Search, 
  Sliders, 
  Bell, 
  Terminal, 
  Activity, 
  Database,
  Camera,
  Play,
  Pause,
  AlertTriangle,
  Send,
  RefreshCw
} from 'lucide-react';
import MonitorCanvas from './MonitorCanvas';

interface CameraAsset {
  id: string;
  name: string;
  status: 'online' | 'offline';
  location: string;
}

export default function App() {
  const [cameras, setCameras] = useState<CameraAsset[]>([
    { id: 'CAM-01', name: '외곽 1구역 펜스 북부', status: 'online', location: '북측 경계선' },
    { id: 'CAM-02', name: '자재 창고 출입구', status: 'online', location: '제2물류동' },
    { id: 'CAM-03', name: '중앙 변전실 내부', status: 'online', location: '특고압실' },
    { id: 'CAM-04', name: '본관 메인 로비', status: 'online', location: '본관 1F' },
    { id: 'CAM-05', name: '하역장 차량 진입로', status: 'online', location: '남측 게이트' },
  ]);

  const [logs, setLogs] = useState<string[]>([
    '[ewVLM_SYSTEM] 플랫폼 초기화 완료. GStreamer 수송 루프 연결 대기 중...',
    '[ewVLM_GATEWAY] FastAPI 백엔드 연동 수립 완료 (Port: 8000)',
    '[ewVLM_CORE] 3대 공공보안 AI 모델 가동태세 점검 완료 (Llama 3.2, Solar, PaliGemma 2)'
  ]);

  const [vssQuery, setVssQuery] = useState('');
  const [selectedCam, setSelectedCam] = useState<string | null>(null);

  const handleVssSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vssQuery.trim()) return;
    
    addLog(`[VSS_SEARCH] 자연어 검색 실행: "${vssQuery}"`);
    // Mocking VSS search result
    setTimeout(() => {
      addLog(`[VSS_RESULT] 매칭 프레임 탐지! "CAM-01 [북측 경계선]" 신뢰도 94.2%`);
      setSelectedCam('CAM-01');
    }, 800);
  };

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#070A13] text-gray-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. 최상단 마스터 헤더 */}
      <header className="bg-[#121724] border-b border-[#232C3F] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-[#3B82F6]" />
          <div>
            <h1 className="text-lg font-bold tracking-wider text-white">ewVLM Monitor</h1>
            <p className="text-xs text-[#8E9AA8]">지능형 다중 카메라 선별관제 콕핏 v2.0</p>
          </div>
        </div>

        {/* AI 서버 엔진 상태 판넬 */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-[#070A13] px-3 py-1.5 rounded border border-[#232C3F]">
            <Activity className="w-4 h-4 text-[#10B981] animate-pulse" />
            <span className="text-xs text-gray-300">Fast-Loop (YOLOv11): </span>
            <span className="text-xs font-mono text-[#10B981]">ACTIVE (4.2ms)</span>
          </div>

          <div className="flex items-center space-x-2 bg-[#070A13] px-3 py-1.5 rounded border border-[#232C3F]">
            <Database className="w-4 h-4 text-[#3B82F6]" />
            <span className="text-xs text-gray-300">Slow-Loop (ewVLM-Core): </span>
            <span className="text-xs font-mono text-[#3B82F6]">Ollama Ready</span>
          </div>

          <div className="relative">
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#EF4444] rounded-full animate-ping"></span>
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#EF4444] rounded-full"></span>
            <Bell className="w-6 h-6 text-gray-400 cursor-pointer hover:text-white transition" />
          </div>
        </div>
      </header>

      {/* 2. 메인 워크스페이스 레이아웃 (3단 그리드) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 좌측: 카메라 자산 트리 & ONVIF 등록 리스트 */}
        <aside className="w-72 bg-[#121724] border-r border-[#232C3F] p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-white flex items-center space-x-2">
              <Camera className="w-4 h-4 text-[#3B82F6]" />
              <span>활성 ONVIF 카메라</span>
            </h2>
            <button 
              onClick={() => addLog("[SYSTEM] 전체 카메라 폴링 진단 트리거")}
              className="text-gray-400 hover:text-white transition"
              title="리프레시"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {cameras.map(cam => (
              <div 
                key={cam.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("cameraId", cam.id);
                  addLog(`[DRAG] ${cam.id} 드래그 시작`);
                }}
                onClick={() => setSelectedCam(cam.id)}
                className={`p-3 rounded-lg border transition cursor-pointer flex flex-col space-y-1.5 hover:bg-[#1C2335] ${
                  selectedCam === cam.id ? 'bg-[#1C2335] border-[#3B82F6]' : 'bg-[#070A13] border-[#232C3F]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8E9AA8]">{cam.id}</span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                    <span className="text-[10px] text-gray-400">ONLINE</span>
                  </span>
                </div>
                <div className="text-sm font-medium text-white truncate">{cam.name}</div>
                <div className="text-[11px] text-[#8E9AA8]">{cam.location}</div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#070A13] rounded-lg border border-[#232C3F]">
            <p className="text-[11px] text-[#8E9AA8] leading-relaxed">
              💡 <span className="text-white font-medium">드래그 앤 드롭 지원</span>: 카메라 카드를 오른쪽 분할 감시 화면 슬롯으로 드래그하여 즉시 영상을 바인딩하고 가속 분석을 연결해 보세요.
            </p>
          </div>
        </aside>

        {/* 중앙: 실시간 선별 관제 멀티 슬롯 매트릭스 캔버스 */}
        <main className="flex-1 p-6 overflow-y-auto flex flex-col space-y-4">
          {/* 자연어 기반 멀티모달 비디오 검색(VSS) 탑 바 */}
          <form onSubmit={handleVssSearch} className="bg-[#121724] p-3 rounded-xl border border-[#232C3F] flex items-center space-x-3 shadow-lg">
            <Search className="w-5 h-5 text-[#3B82F6] shrink-0" />
            <input 
              type="text" 
              placeholder="자연어로 지능형 검색 (예: '안전모를 착용하지 않고 펜스를 넘으려 하는 사람 탐지해줘')"
              value={vssQuery}
              onChange={(e) => setVssQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-0"
            />
            <button 
              type="submit"
              className="bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center space-x-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>검색</span>
            </button>
          </form>

          {/* 비디오 모니터 그리드 컴포넌트 */}
          <div className="flex-1">
            <MonitorCanvas selectedCam={selectedCam} onActionTrigger={addLog} />
          </div>
        </main>
      </div>

      {/* 3. 하단 실시간 위협 감지 로깅 & 시스템 원격 디렉토리 제어 */}
      <footer className="h-44 bg-[#121724] border-t border-[#232C3F] flex overflow-hidden">
        <div className="w-80 border-r border-[#232C3F] p-4 flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-white">
            <Terminal className="w-4 h-4 text-[#3B82F6]" />
            <span className="text-xs font-bold tracking-wider">Antigravity AI Bridge</span>
          </div>
          <p className="text-xs text-[#8E9AA8] leading-relaxed">
            로컬 백엔드 서버(`ewvlm_fastapi_gateway.py`) 및 Ollama 수송 장치(`ewvlm_ollama_bridge.py`)의 패킷 통신 로그가 실시간 매핑 연동됩니다.
          </p>
          <div className="text-[10px] text-[#3B82F6] font-mono">
            GATEWAY API STATUS: http://localhost:8000/docs
          </div>
        </div>

        <div className="flex-1 p-4 bg-[#070A13] overflow-y-auto font-mono text-xs text-gray-300 space-y-1">
          {logs.map((log, index) => {
            let color = 'text-gray-400';
            if (log.includes('[SUCCESS]') || log.includes('[성공]')) color = 'text-[#10B981]';
            if (log.includes('[VSS_SEARCH]')) color = 'text-[#3B82F6]';
            if (log.includes('[VSS_RESULT]')) color = 'text-yellow-400 font-bold';
            if (log.includes('[WARNING]') || log.includes('[ALERT]')) color = 'text-[#EF4444] font-bold';
            
            return (
              <div key={index} className={`${color}`}>
                {log}
              </div>
            );
          })}
        </div>
      </footer>
    </div>
  );
}

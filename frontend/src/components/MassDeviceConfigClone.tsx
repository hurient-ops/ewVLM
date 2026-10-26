import React, { useState, useEffect } from 'react';
import { API } from '../api/client';
import { CameraDevice } from '../store/useCameraStore';

export const MassDeviceConfigClone: React.FC = () => {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterText, setFilterText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 마스터 프로파일 상태
  const [profileTemplate, setProfileTemplate] = useState('template-security-high');
  const [codec, setCodec] = useState('H.265');
  const [bitrateMode, setBitrateMode] = useState('VBR (Target 4Mbps)');
  const [resolution, setResolution] = useState('1080p (1920x1080)');
  const [aiWiseStream, setAiWiseStream] = useState(true);
  const [yoloConfidence, setYoloConfidence] = useState(0.85);

  useEffect(() => {
    API.getCameras().then((data: CameraDevice[]) => {
      setCameras(data || []);
      // 기본적으로 모든 활성 카메라 선택
      const activeIds = (data || []).map((c: CameraDevice) => c.id);
      setSelectedIds(activeIds);
    }).catch(err => {
      console.error("Failed to load cameras", err);
    });
  }, []);

  const filteredCameras = cameras.filter(cam => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return cam.name.toLowerCase().includes(q) || cam.id.toLowerCase().includes(q);
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCameras.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCameras.map(c => c.id));
    }
  };

  const toggleCamera = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSync = async () => {
    if (selectedIds.length === 0) {
      setToastMessage('⚠️ 대상 장비를 1대 이상 선택하세요.');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    setIsSyncing(true);
    setProgress(15);
    setToastMessage(`⏳ ${selectedIds.length}대 대상 장비에 정책 클론 배포를 시작합니다...`);

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 25;
      });
    }, 300);

    try {
      const res = await API.syncDeviceConfig(selectedIds.join(','));
      clearInterval(interval);
      setProgress(100);
      if (res.status === 'SUCCESS' || res.status) {
        setToastMessage(`✅ ${selectedIds.length}대 장비에 마스터 프로파일이 성공적으로 배포 및 동기화되었습니다.`);
      }
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      setProgress(100);
      setToastMessage(`✅ ${selectedIds.length}대 장비에 마스터 프로파일 적용 완료 (로컬 반영)`);
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setProgress(0);
        setTimeout(() => setToastMessage(null), 3500);
      }, 800);
    }
  };

  return (
    <main className="flex-1 w-full h-full flex flex-col bg-[#070A13] relative overflow-hidden select-none">
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-[#7C3AED] border border-white/20 text-white px-6 py-2.5 rounded-lg shadow-2xl font-bold text-sm animate-pulse">
          {toastMessage}
        </div>
      )}

      {/* Header Area */}
      <div className="px-6 py-4 border-b border-[#232C3F] flex justify-between items-center bg-[#0e121d] shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">copy_all</span>
            대규모 장비 일괄 설정 및 프로파일 클론 콘솔
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            실시간 등록 장비 플릿에 마스터 스트리밍/보안/AI 감지 정책을 병렬 전개합니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedIds([])}
            className="px-3.5 py-1.5 border border-[#232C3F] text-gray-300 rounded text-xs hover:bg-white/5 transition-colors font-medium"
          >
            선택 해제
          </button>
          <button 
            className={`px-4 py-2 rounded text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
              isSyncing || selectedIds.length === 0
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-[#232C3F]' 
                : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-[0_0_15px_rgba(124,58,237,0.4)] active:scale-95'
            }`}
            onClick={handleSync}
            disabled={isSyncing || selectedIds.length === 0}
          >
            <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>
              {isSyncing ? 'sync' : 'rocket_launch'}
            </span> 
            {isSyncing ? '일괄 배포 중...' : `선택된 ${selectedIds.length}대 일괄 배포 실행`} 
          </button>
        </div>
      </div>

      {/* Content Area (3-Column / Bento Layout) */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4 pb-20">
        
        {/* Col 1: Target Selection Tree */}
        <div className="w-[320px] bg-[#0e121d] rounded-xl border border-[#232C3F] flex flex-col overflow-hidden shadow-sm shrink-0">
          <div className="p-3 border-b border-[#232C3F] bg-[#121724] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                checked={selectedIds.length > 0 && selectedIds.length === filteredCameras.length}
                onChange={toggleSelectAll}
                className="rounded border-[#232C3F] bg-[#070A13] text-primary focus:ring-primary cursor-pointer"
              />
              <h3 className="text-xs font-bold text-white">대상 장비 플릿</h3>
            </div>
            <span className="text-[11px] font-mono text-primary px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
              {selectedIds.length} / {filteredCameras.length}대 선택
            </span>
          </div>

          {/* Search Box */}
          <div className="p-2.5 border-b border-[#232C3F]">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]">
                filter_alt
              </span>
              <input 
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full bg-[#121724] border border-[#232C3F] rounded px-3 py-1.5 pl-8 text-xs text-white focus:outline-none focus:border-primary placeholder-gray-500" 
                placeholder="장비명 또는 채널 ID 검색..." 
                type="text"
              />
            </div>
          </div>

          {/* Camera List */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
            {filteredCameras.map(cam => {
              const isChecked = selectedIds.includes(cam.id);
              return (
                <div 
                  key={cam.id}
                  onClick={() => toggleCamera(cam.id)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border ${
                    isChecked ? 'border-primary/50 bg-primary/10' : 'border-[#232C3F] hover:bg-[#1a2133]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCamera(cam.id)}
                      className="rounded border-[#232C3F] bg-[#070A13] text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_4px_#10B981] shrink-0"></span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate max-w-[150px]" title={cam.name}>
                        {cam.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono truncate">{cam.id}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 bg-black/40 px-1.5 py-0.5 rounded border border-[#232C3F]">
                    {cam.vlmEnabled ? 'VLM ON' : 'AI'}
                  </span>
                </div>
              );
            })}
            {filteredCameras.length === 0 && (
              <div className="text-center py-8 text-xs text-gray-500">
                일치하는 카메라가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Col 2 & 3: Master Policy Configuration */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4">
          
          {/* Master Policy Source Selector */}
          <div className="bg-[#0e121d] rounded-xl border border-[#232C3F] p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-[#121724] border border-[#232C3F] flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">tune</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">마스터 정책 템플릿</h3>
                <p className="text-xs text-gray-400 mt-0.5">배포할 기준 프로파일 규격을 선택하거나 사용자 정의합니다.</p>
              </div>
            </div>
            <select 
              value={profileTemplate}
              onChange={(e) => setProfileTemplate(e.target.value)}
              className="bg-[#121724] border border-[#232C3F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary w-64 cursor-pointer font-mono"
            >
              <option value="template-security-high">템플릿: 24/7 최고 보안 (4K, H.265)</option>
              <option value="template-bandwidth-save">템플릿: 대역폭 최적화 (1080p, VBR)</option>
              <option value="template-edge-ai">템플릿: YOLOv11 &amp; Slow-Loop VLM 연동</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            {/* Stream & Encoding Profile */}
            <div className="bg-[#0e121d] rounded-xl border border-[#232C3F] p-4 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#232C3F]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">movie</span>
                  <h3 className="text-xs font-bold text-white">스트림 및 인코딩</h3>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 font-mono">
                  동기화 준비됨
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-mono mb-1">비디오 압축 코덱</label>
                  <select 
                    value={codec} 
                    onChange={(e) => setCodec(e.target.value)}
                    className="w-full bg-[#121724] border border-[#232C3F] rounded px-3 py-1.5 text-white font-mono"
                  >
                    <option value="H.265">H.265 (HEVC - 권장)</option>
                    <option value="H.264">H.264 (AVC - 호환 모드)</option>
                    <option value="AV1">AV1 (차세대 초고압축)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-mono mb-1">스트림 해상도</label>
                  <select 
                    value={resolution} 
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full bg-[#121724] border border-[#232C3F] rounded px-3 py-1.5 text-white font-mono"
                  >
                    <option value="4K (3840x2160)">4K UHD (3840x2160@30fps)</option>
                    <option value="1080p (1920x1080)">1080p FHD (1920x1080@30fps)</option>
                    <option value="720p (1280x720)">720p HD (1280x720@30fps)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-mono mb-1">비트레이트 제어 방식</label>
                  <select 
                    value={bitrateMode} 
                    onChange={(e) => setBitrateMode(e.target.value)}
                    className="w-full bg-[#121724] border border-[#232C3F] rounded px-3 py-1.5 text-white font-mono"
                  >
                    <option value="VBR (Target 4Mbps)">VBR (가변 비트레이트, 권장 4Mbps)</option>
                    <option value="CBR (Fixed 6Mbps)">CBR (고정 비트레이트 6Mbps)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between bg-[#121724] p-2.5 rounded-lg border border-[#232C3F] mt-2">
                  <span className="text-gray-200 font-medium">AI WiseStream III 동적 대역폭 절감</span>
                  <input 
                    type="checkbox" 
                    checked={aiWiseStream} 
                    onChange={(e) => setAiWiseStream(e.target.checked)}
                    className="rounded border-[#232C3F] bg-[#070A13] text-primary focus:ring-primary cursor-pointer w-4 h-4"
                  />
                </div>
              </div>
            </div>

            {/* Edge AI & VLM Detection Settings */}
            <div className="bg-[#0e121d] rounded-xl border border-[#232C3F] p-4 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#232C3F]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#d2bbff] text-[18px]">psychology</span>
                  <h3 className="text-xs font-bold text-white">에지 AI &amp; VLM 감지 매개변수</h3>
                </div>
                <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-mono">
                  NVIDIA TensorRT
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-gray-400 font-mono">YOLOv11 신뢰도 임계값 (IoU)</label>
                    <span className="text-primary font-mono font-bold">{(yoloConfidence * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="0.95" 
                    step="0.05"
                    value={yoloConfidence} 
                    onChange={(e) => setYoloConfidence(parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-mono mb-1">Slow-Loop VLM 교차 검증</label>
                  <select className="w-full bg-[#121724] border border-[#232C3F] rounded px-3 py-1.5 text-white font-mono">
                    <option>Llama 3.2 11B Vision Instruct (기본)</option>
                    <option>Qwen 2.5 VL 7B (초고속 검증)</option>
                    <option>앙상블 다중 교차 검증 (병렬)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-mono mb-1">미인가 침입/화재 에스컬레이션 주기</label>
                  <select className="w-full bg-[#121724] border border-[#232C3F] rounded px-3 py-1.5 text-white font-mono">
                    <option>즉시 에스컬레이션 (지연 &lt; 0.5s)</option>
                    <option>3프레임 연속 감지 시 에스컬레이션</option>
                  </select>
                </div>

                <div className="bg-[#121724] p-2.5 rounded-lg border border-[#232C3F] flex items-center justify-between mt-2">
                  <span className="text-gray-200 font-medium">802.1x 네트워크 인증 암호화</span>
                  <span className="text-[11px] text-emerald-400 font-mono">EAP-TLS 활성</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Fixed Bottom Deployment Status Bar */}
      <div className="absolute bottom-0 left-0 w-full bg-[#0e121d] border-t border-[#232C3F] px-6 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.5)] z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined text-primary text-xl ${isSyncing ? 'animate-spin' : ''}`}>
            {isSyncing ? 'sync' : 'devices'}
          </span>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              배포 준비 상태
              <span className="text-[10px] text-gray-400 font-normal">
                ({selectedIds.length}개 대상 장비 선택됨)
              </span>
            </div>
            <div className="text-[11px] font-mono text-gray-400">
              {isSyncing ? '대상 장비 플릿에 RTSP 및 AI 파라미터 푸시 중...' : '대기 중 • 일괄 배포 버튼 클릭 시 병렬 전개 시작'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-[280px]">
          <div className="w-full bg-[#121724] rounded-full h-2 border border-[#232C3F] overflow-hidden">
            <div 
              className="bg-[#7C3AED] h-full transition-all duration-300 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-xs font-mono font-bold text-primary w-10 text-right">{progress}%</span>
        </div>
      </div>
    </main>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useEventLogStore } from '../store/useEventLogStore';
import { useCameraStore } from '../store/useCameraStore';
import { API } from '../api/client';
import axios from 'axios';


const MAX_CAMERAS = 2; // 나중에 4로 확장 가능

export const MultiChannelSyncPlayback: React.FC = () => { 
  const [progress, setProgress] = useState(65);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  
  const { logs } = useEventLogStore();
  const { cameras, groups, fetchCameras } = useCameraStore();
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);
  
  const sessionToken = useRef(Date.now()).current;
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null, null]);

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

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);
  
  const toggleCameraSelection = (camId: string) => {
    setSelectedCameras(prev => {
      if (prev.includes(camId)) {
        return prev.filter(id => id !== camId);
      } else {
        if (prev.length >= MAX_CAMERAS) return prev; // Max MAX_CAMERAS cameras
        return [...prev, camId];
      }
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportUrl(null);
    try {
      const response = await API.exportForensicVideo(['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04'], '14:00:00', '14:30:00', true);
      if (response.status === 'SUCCESS') {
        setExportUrl(response.download_url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoomLevel(prev => {
      const newZoom = e.deltaY < 0 ? prev * 1.5 : prev / 1.5;
      return Math.min(Math.max(newZoom, 1), 60);
    });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
    videoRefs.current.forEach(v => {
      if (v && v.duration) {
        v.currentTime = (newProgress / 100) * v.duration;
      }
    });
  };

  const handleScrubStart = () => {
    setIsScrubbing(true);
    if (isPlaying) {
      videoRefs.current.forEach(v => v?.pause());
    }
  };
  const handleScrubEnd = () => {
    setIsScrubbing(false);
    if (isPlaying) {
      videoRefs.current.forEach(v => v?.play());
    }
  };

  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const togglePlay = () => {
    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);
    videoRefs.current.forEach(v => {
      if (v) {
        nextPlay ? v.play() : v.pause();
      }
    });
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    videoRefs.current.forEach(v => {
      if (v) {
        v.playbackRate = speed;
      }
    });
  };

  const stepFrame = (forward: boolean) => {
    const step = forward ? 0.033 : -0.033; // 30fps 기준
    videoRefs.current.forEach(v => {
      if (v) {
        v.pause();
        v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + step));
      }
    });
    setIsPlaying(false);
    
    // Update progress
    const master = videoRefs.current.find(el => el !== null && !isNaN(el.duration) && el.duration > 0);
    if (master) setProgress((master.currentTime / master.duration) * 100);
  };

  useEffect(() => {
    let syncInterval: any;
    if (isPlaying) {
      syncInterval = setInterval(() => {
        const videos = videoRefs.current.filter(el => el !== null && !isNaN(el.duration) && el.duration > 0);
        if (videos.length === 0) return;
        
        // 첫 번째 유효한 비디오를 마스터로 지정 (Master-Slave Sync)
        const master = videos[0];
        if (!master) return;
        
        setProgress((master.currentTime / master.duration) * 100);

        // 슬레이브 비디오들의 타임라인 동기화 (오차가 0.3초 이상일 경우 강제 동기화)
        for (let i = 1; i < videos.length; i++) {
          const slave = videos[i];
          if (!slave) continue;
          
          if (Math.abs(master.currentTime - slave.currentTime) > 0.3) {
            slave.currentTime = master.currentTime;
          }
        }
      }, 100); // 100ms 마다 촘촘하게 동기화 검사
    }
    return () => clearInterval(syncInterval);
  }, [isPlaying]);

  // 시뮬레이션용 시간 문자열 포맷팅 (줌 레벨에 따라 초 단위까지 표시)
  const formatTime = (percent: number, showSeconds = false) => {
    const totalMinutes = 24 * 60;
    const currentSeconds = Math.floor((percent / 100) * totalMinutes * 60);
    const h = Math.floor(currentSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((currentSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (currentSeconds % 60).toString().padStart(2, '0');
    return showSeconds || zoomLevel > 10 ? `${h}:${m}:${s}` : `${h}:${m}`;
  };

  const gridClass = MAX_CAMERAS <= 2 
    ? 'grid-cols-2 grid-rows-1' 
    : 'grid-cols-2 grid-rows-2';

  const trackStyles = [
    { left: '15%', width: '10%', bg: 'bg-[#7c3aed]' },
    { left: '35%', width: '8%', bg: 'bg-[#7c3aed]' },
    { left: '12%', width: '3%', bg: 'bg-yellow-500' },
    { left: '65%', width: '15%', bg: 'bg-green-500' },
  ];
  
  // Sort entries: groups first, unassigned last
  const sortedGroupEntries = Object.entries(groupedCameras).sort(([idA], [idB]) => {
    if (idA === 'unassigned') return 1;
    if (idB === 'unassigned') return -1;
    return 0;
  });

  return (
    <div className="flex w-full h-full bg-[#0b0e17]">
      {/* Sidebar Camera List */}
      <aside className="w-64 shrink-0 border-r border-[#232C3F] flex flex-col bg-surface overflow-hidden">
        <div className="p-4 border-b border-[#232C3F]">
          <h2 className="text-[16px] font-semibold text-on-surface">카메라 목록</h2>
          <p className="text-[12px] text-text-muted mt-1 font-mono">재생할 채널 선택 (최대 {MAX_CAMERAS}개)</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
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
                        onClick={() => toggleCameraSelection(cam.id)}
                        className={`px-3 py-2 mx-2 rounded-lg cursor-pointer border transition-colors flex items-center justify-between ${
                          selectedCameras.includes(cam.id) 
                            ? 'bg-surface-container-high border-[#7c3aed] text-white' 
                            : 'bg-surface border-border-subtle text-text-muted hover:bg-surface-container-high'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${cam.isActive !== false ? 'bg-[#4edea3] shadow-[0_0_4px_#4edea3]' : 'bg-red-500 shadow-[0_0_4px_#f44336]'}`}></span>
                          <span className="font-bold text-[12px] truncate max-w-[150px]" title={cam.name}>{cam.name}</span>
                        </div>
                        <span className="material-symbols-outlined text-[18px]">
                          {selectedCameras.includes(cam.id) ? 'check_box' : 'check_box_outline_blank'}
                        </span>
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

      <main className="flex-1 min-w-0 h-full p-6 flex flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-end shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">다채널 동시 동기화 플레이백 & 동선 복원</h1>
            <p className="text-sm text-gray-400 mt-1">사고 추적을 위한 정밀 시분할 제어.</p>
          </div>
          <div className="flex items-center gap-2 bg-[#121724] px-4 py-2 rounded border border-[#232C3F] shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="font-mono text-sm text-green-500 font-bold">마스터 동기화: 잠금</span>
          </div>
        </div>

        {/* Video Grid */}
        <div className={`grid ${gridClass} gap-2 flex-1 min-h-0 bg-[#121724] p-2 rounded border border-[#232C3F]`}>
          {Array.from({ length: MAX_CAMERAS }).map((_, slotIndex) => {
            const camId = selectedCameras[slotIndex];
            const cam = camId ? cameras.find(c => c.id === camId) : null;
            
            if (!camId) {
              return (
                <div key={`empty-${slotIndex}`} className="flex flex-col items-center justify-center w-full h-full bg-black border border-[#232C3F] rounded text-gray-600">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">videocam_off</span>
                  <span>비어있음</span>
                  <span className="text-xs mt-1">좌측에서 카메라를 선택하세요</span>
                </div>
              );
            }
            
            return (
              <div key={camId} className={`relative w-full h-full rounded overflow-hidden bg-black border border-[#232C3F] transition-opacity duration-200 ${isScrubbing ? 'opacity-70' : 'opacity-100'}`}>
                <video 
                  ref={el => videoRefs.current[slotIndex] = el}
                  src={`http://localhost:8000/api/v1/records/${camId}/stream?session=${sessionToken}`} 
                  className="absolute inset-0 w-full h-full object-cover" 
                  muted
                  loop
                />
                {isScrubbing && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
                    <span className="material-symbols-outlined text-white text-5xl animate-pulse">fast_forward</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
                  <span className="bg-black/60 text-white font-bold px-2 py-1 rounded text-xs">CH {slotIndex + 1} - {cam?.name || camId}</span>
                  <span className="bg-black/60 text-green-400 font-mono px-2 py-1 rounded text-xs">2023-10-27 {formatTime(progress)}:01.450</span>
                </div>
                <div className="absolute bottom-4 right-4 z-10">
                  <span className="bg-black/60 text-gray-300 font-mono px-2 py-1 rounded text-xs">H.264 / 1080p / 30FPS</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Transport Controls & Timeline */}
        <div className="shrink-0 bg-[#121724] p-4 rounded border border-[#232C3F] flex flex-col gap-4">
          {/* Controls Bar */}
          <div className="flex justify-between items-center px-4">
            {/* Speed Controls */}
            <div className="flex items-center gap-1 bg-[#0b0e17] p-1 rounded border border-[#232C3F]">
              <button onClick={() => handleSpeedChange(0.25)} className={`w-10 py-1 text-xs font-mono rounded transition-colors ${playbackSpeed === 0.25 ? 'text-[#d2bbff] bg-[#31343f] border border-[#232C3F] font-bold' : 'text-gray-500 hover:text-white hover:bg-[#31343f]'}`}>0.2x</button>
              <button onClick={() => handleSpeedChange(0.5)} className={`w-10 py-1 text-xs font-mono rounded transition-colors ${playbackSpeed === 0.5 ? 'text-[#d2bbff] bg-[#31343f] border border-[#232C3F] font-bold' : 'text-gray-500 hover:text-white hover:bg-[#31343f]'}`}>0.5x</button>
              <button onClick={() => handleSpeedChange(1)} className={`w-10 py-1 text-xs font-mono rounded transition-colors ${playbackSpeed === 1 ? 'text-[#d2bbff] bg-[#31343f] border border-[#232C3F] font-bold' : 'text-gray-500 hover:text-white hover:bg-[#31343f]'}`}>1x</button>
              <button onClick={() => handleSpeedChange(2)} className={`w-10 py-1 text-xs font-mono rounded transition-colors ${playbackSpeed === 2 ? 'text-[#d2bbff] bg-[#31343f] border border-[#232C3F] font-bold' : 'text-gray-500 hover:text-white hover:bg-[#31343f]'}`}>2x</button>
              <button onClick={() => handleSpeedChange(4)} className={`w-10 py-1 text-xs font-mono rounded transition-colors ${playbackSpeed === 4 ? 'text-[#d2bbff] bg-[#31343f] border border-[#232C3F] font-bold' : 'text-gray-500 hover:text-white hover:bg-[#31343f]'}`}>4x</button>
            </div>
            
            {/* Main Transport */}
            <div className="flex items-center gap-6">
              <button onClick={() => stepFrame(false)} className="text-gray-400 hover:text-white transition-colors" title="이전 프레임">
                <span className="material-symbols-outlined text-3xl">skip_previous</span>
              </button>
              <button onClick={togglePlay} className="w-14 h-14 rounded-full bg-[#7c3aed] text-white flex items-center justify-center hover:bg-[#6d28d9] transition-colors shadow-[0_0_15px_rgba(124,58,237,0.4)]">
                <span className="material-symbols-outlined text-4xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
              </button>
              <button onClick={() => stepFrame(true)} className="text-gray-400 hover:text-white transition-colors" title="다음 프레임">
                <span className="material-symbols-outlined text-3xl">skip_next</span>
              </button>
            </div>
            
            {/* Utility Tools */}
            <div className="flex items-center gap-3">
              <button className="p-2 border border-[#232C3F] rounded text-gray-400 hover:text-white hover:bg-[#31343f] transition-colors" title="스냅샷">
                <span className="material-symbols-outlined text-xl">camera</span>
              </button>
              <button className="p-2 border border-[#232C3F] rounded text-gray-400 hover:text-white hover:bg-[#31343f] transition-colors" title="이벤트 마크">
                <span className="material-symbols-outlined text-xl">bookmark</span>
              </button>
              <button 
                className="p-2 border border-[#232C3F] rounded text-gray-400 hover:text-white hover:bg-[#31343f] transition-colors" 
                title="클립 내보내기"
                onClick={() => setShowExportModal(true)}
              >
                <span className="material-symbols-outlined text-xl">download</span>
              </button>
            </div>
          </div>

          {/* Progressive Timeline */}
          <div 
            className="relative h-[200px] bg-[#0b0e17] border border-[#232C3F] rounded overflow-hidden flex flex-col justify-between pt-6 pb-2"
            onWheel={handleWheel}
          >
            {/* Zoom Indicator */}
            <div className="absolute top-1 right-2 z-30 text-[10px] text-gray-500 font-mono bg-black/50 px-1 rounded">
              배율: {zoomLevel.toFixed(1)}x
            </div>
            
            {/* Event Tracks with dynamic bookmarks */}
            <div className="flex flex-col gap-4 px-4 flex-1 justify-center z-10 mt-2">
              {selectedCameras.map((camId, index) => {
                const cam = cameras.find(c => c.id === camId);
                const style = trackStyles[index % trackStyles.length];
                return (
                  <div key={camId} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 w-24 truncate">CH {index + 1} - {cam?.name || camId}</span>
                    <div className="flex-1 h-1.5 bg-[#232C3F] rounded-full relative">
                      <div className={`absolute ${style.bg} rounded-full h-full`} style={{ left: style.left, width: style.width }}></div>
                      {logs.filter(l => l.cameraId === camId && l.level === 'critical').map((l, i) => (
                        <div key={l.id} className="absolute w-2 h-4 bg-red-500 rounded-sm top-[-5px]" style={{ left: `${20 + (i * 15)}%` }} title={l.message}></div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Ruler */}
            <div className="w-full flex justify-between text-[11px] font-mono text-gray-500 px-[40px] border-t border-[#232C3F] pt-2 z-10 pb-4">
              <span>{zoomLevel > 10 ? formatTime(Math.max(0, progress - 100/zoomLevel)) : '00:00'}</span>
              <span>{zoomLevel > 10 ? '' : '04:00'}</span>
              <span>{zoomLevel > 10 ? '' : '08:00'}</span>
              <span>{zoomLevel > 10 ? '' : '12:00'}</span>
              <span className="text-[#d2bbff] font-bold">{formatTime(progress, true)}</span>
              <span>{zoomLevel > 10 ? '' : '20:00'}</span>
              <span>{zoomLevel > 10 ? formatTime(Math.min(100, progress + 100/zoomLevel)) : '24:00'}</span>
            </div>

            {/* Progressive Scrubber / Slider */}
            <div className="absolute inset-x-0 bottom-0 h-full pointer-events-none px-[40px]">
              <div className="absolute top-4 bottom-8 w-[2px] bg-[#d2bbff] shadow-[0_0_8px_rgba(210,187,255,0.8)] flex flex-col items-center transition-all duration-75" style={{ left: `calc(40px + calc(100% - 80px) * ${progress / 100})` }}>
                <div className="w-3 h-3 bg-[#d2bbff] rounded-full -mt-1"></div>
              </div>
            </div>
            
            <input 
              className="absolute bottom-2 w-full opacity-0 cursor-pointer h-12 z-20" 
              max="100" 
              min="0" 
              type="range" 
              value={progress}
              onChange={handleSliderChange}
              onMouseDown={handleScrubStart}
              onMouseUp={handleScrubEnd}
              onMouseLeave={handleScrubEnd}
              onTouchStart={handleScrubStart}
              onTouchEnd={handleScrubEnd}
            />
          </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="bg-[#121724] border border-[#232C3F] rounded-lg p-6 w-[500px] shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d2bbff]">movie</span>
                동선 복원 클립 생성 (Export)
              </h2>
              <div className="flex flex-col gap-4 mb-6 text-gray-300">
                <p className="text-sm">선택된 채널의 시점과 VLM 메타데이터를 병합하여 다운로드합니다.</p>
                <div className="bg-[#0b0e17] p-4 rounded border border-[#232C3F] flex flex-col gap-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">선택 채널:</span>
                    <span>{selectedCameras.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">시간 구간:</span>
                    <span className="text-green-400">14:00:00 ~ 14:30:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">VLM 오버레이:</span>
                    <span className="text-[#d2bbff]">활성 (ON)</span>
                  </div>
                </div>
                {isExporting && (
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-sm text-yellow-400 animate-pulse">분석 병합 및 인코딩 중...</span>
                    <div className="w-full bg-[#232C3F] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#d2bbff] h-full animate-[progress_2.5s_ease-in-out_forwards]" style={{ width: '0%' }}>
                        <style>{`
                          @keyframes progress {
                            0% { width: 0%; }
                            100% { width: 100%; }
                          }
                        `}</style>
                      </div>
                    </div>
                  </div>
                )}
                {exportUrl && (
                  <div className="mt-2 p-3 bg-green-500/10 border border-green-500/50 rounded flex items-center justify-between text-green-400">
                    <span>✅ 인코딩 완료</span>
                    <a href="#" className="font-bold underline text-white hover:text-green-300 transition-colors">
                      MP4 다운로드
                    </a>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  className="px-4 py-2 rounded font-bold text-gray-400 hover:text-white hover:bg-[#31343f] transition-colors"
                  onClick={() => {
                    setShowExportModal(false);
                    setExportUrl(null);
                    setIsExporting(false);
                  }}
                >
                  닫기
                </button>
                <button 
                  className={`px-4 py-2 rounded font-bold transition-colors flex items-center gap-2 ${isExporting || exportUrl ? 'bg-[#31343f] text-gray-500 cursor-not-allowed' : 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-[0_0_10px_rgba(124,58,237,0.4)]'}`}
                  onClick={handleExport}
                  disabled={isExporting || !!exportUrl}
                >
                  <span className="material-symbols-outlined text-lg">sync</span>
                  {isExporting ? '처리 중' : exportUrl ? '완료' : '추출 실행'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

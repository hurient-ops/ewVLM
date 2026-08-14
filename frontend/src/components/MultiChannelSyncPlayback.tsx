import React, { useState } from 'react';
import { useEventLogStore } from '../store/useEventLogStore';

export const MultiChannelSyncPlayback: React.FC = () => { 
  const [progress, setProgress] = useState(65);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { logs } = useEventLogStore();

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoomLevel(prev => {
      const newZoom = e.deltaY < 0 ? prev * 1.5 : prev / 1.5;
      return Math.min(Math.max(newZoom, 1), 60);
    });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number(e.target.value));
  };

  const handleScrubStart = () => setIsScrubbing(true);
  const handleScrubEnd = () => setIsScrubbing(false);

  // 시뮬레이션용 시간 문자열 포맷팅 (줌 레벨에 따라 초 단위까지 표시)
  const formatTime = (percent: number, showSeconds = false) => {
    const totalMinutes = 24 * 60;
    const currentSeconds = Math.floor((percent / 100) * totalMinutes * 60);
    const h = Math.floor(currentSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((currentSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (currentSeconds % 60).toString().padStart(2, '0');
    return showSeconds || zoomLevel > 10 ? `${h}:${m}:${s}` : `${h}:${m}`;
  };

  return ( <>
    <main className="flex-1 min-w-0 h-full p-6 flex flex-col gap-4 bg-[#0b0e17] overflow-hidden">
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

      {/* 4-Split Video Grid */}
      <div className="grid grid-cols-2 grid-rows-2 gap-2 flex-1 min-h-0 bg-[#121724] p-2 rounded border border-[#232C3F]">
        {/* CH 1 */}
        <div className={`relative w-full h-full rounded overflow-hidden bg-black border border-[#232C3F] transition-opacity duration-200 ${isScrubbing ? 'opacity-70' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAE92JBNpin3x35y4mN51JHEfhWnPvnrDET_t781BidPY1uW22zAVJLqZOqEkM43vOGGDd1cz5ZUGkmki9j8QHD6EK3O41CAvii8SEYkte5RwCrvlgjjqmnWBZq6-xre_vum6cu5T7GTTcOd6_XOKIB1DGCWnkxLP9WP6naTS0qTGvGSVpaswq7S2yB4bJdfLwCGTV8DEbUgbVxpbagy6uG9tVw6DA1YevJBX_EWZRJ1a4Vv_lJYvKhYw')" }}></div>
          {isScrubbing && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
              <span className="material-symbols-outlined text-white text-5xl animate-pulse">fast_forward</span>
            </div>
          )}
          {/* OSD Overlays */}
          <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
            <span className="bg-black/60 text-white font-bold px-2 py-1 rounded text-xs">CH 01 - 주요 교차로</span>
            <span className="bg-black/60 text-green-400 font-mono px-2 py-1 rounded text-xs">2023-10-27 {formatTime(progress)}:01.450</span>
          </div>
          <div className="absolute bottom-4 right-4 z-10">
            <span className="bg-black/60 text-gray-300 font-mono px-2 py-1 rounded text-xs">H.265 / 4K / 30FPS</span>
          </div>
          {/* Bounding Box Example */}
          <div className="absolute top-[30%] left-[25%] w-[30%] h-[40%] border-2 border-[#7c3aed] bg-[#7c3aed]/20 pointer-events-none z-10">
            <span className="absolute -top-6 left-[-2px] bg-[#7c3aed] text-white text-[10px] font-mono px-2 py-0.5 font-bold">VEHICLE_TRACK_01</span>
          </div>
        </div>

        {/* CH 2 */}
        <div className={`relative w-full h-full rounded overflow-hidden bg-black border border-[#232C3F] transition-opacity duration-200 ${isScrubbing ? 'opacity-70' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCOovSK6T3QufP9Sww5APta8jZNN-WpAOPFQWK-FN09ygk6nDLuKTkjGW8h33A1c445oQEBPlN0ib9V9glNdGwFMuep3upWZoiynxk2BTS6mYzOzSPCwGIDtakAOkLOisaiqff_sF3KtZb8zlCR-efYgYH6XwSf6sGrjitOPnXwuX_mnTS0U0s9GN3S8GZKulfKH5wtTAwMFIugelq1ylWSz6zKVLfnSux3OHQ1ejWw3rbnVTcu0aochA')" }}></div>
          {isScrubbing && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
              <span className="material-symbols-outlined text-white text-5xl animate-pulse">fast_forward</span>
            </div>
          )}
          <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
            <span className="bg-black/60 text-white font-bold px-2 py-1 rounded text-xs">CH 02 - 동측 골목</span>
            <span className="bg-black/60 text-green-400 font-mono px-2 py-1 rounded text-xs">2023-10-27 {formatTime(progress)}:01.450</span>
          </div>
        </div>

        {/* CH 3 */}
        <div className={`relative w-full h-full rounded overflow-hidden bg-black border border-[#232C3F] transition-opacity duration-200 ${isScrubbing ? 'opacity-70' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCsvbg8lxQA6WV5ymM5-wBgDKdDf5QzNkb20ihbYKW_ifh4aGd6kYvh7TcMd_WonaPiFal4r76rIdO-R20n8eya3jALwZNX88x4k0ZTUEYGX2ZRmFBtN0SM2ICZUkAqpN_lco9Z3APJDSQ__OwvuMa2Fts9wE2lsH-NMeziRRXvjr1PQXqiSQjQdIWyWIiueOADP9kZn640ef2vQAnZ3jLUaybK7i-ghfaZDxCaXx67NHI7c5s23XXFrw')" }}></div>
          {isScrubbing && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
              <span className="material-symbols-outlined text-white text-5xl animate-pulse">fast_forward</span>
            </div>
          )}
          <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
            <span className="bg-black/60 text-white font-bold px-2 py-1 rounded text-xs">CH 03 - 외곽 펜스</span>
            <span className="bg-black/60 text-green-400 font-mono px-2 py-1 rounded text-xs">2023-10-27 {formatTime(progress)}:01.450</span>
          </div>
        </div>

        {/* CH 4 */}
        <div className={`relative w-full h-full rounded overflow-hidden bg-black border border-[#232C3F] transition-opacity duration-200 ${isScrubbing ? 'opacity-70' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAmEqg0hSVG_OcyMP-VmF8KdPC5kRsWhxmz025Rv1J-YIncnhfWek8RZaP5KV_VZja5qmlbjVQUmt9eG6_IuxSWCzpd8bZt-3x72NVKL2yj_6_E89p5RhzvfPbiK8gukLLVzaeOiV2k8DtF9Is7Jh1q_Ev5XkZa8Vt3F6M58VPk4VZRPSiEGik5RNXMOBdyhUQhgBxE5yeZXHFi5fliKl9M4pNqnA5qoepPl_-H8ydxHrvv-qbQrY-1ZQ')" }}></div>
          {isScrubbing && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
              <span className="material-symbols-outlined text-white text-5xl animate-pulse">fast_forward</span>
            </div>
          )}
          <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
            <span className="bg-black/60 text-white font-bold px-2 py-1 rounded text-xs">CH 04 - 주차장 B2</span>
            <span className="bg-black/60 text-green-400 font-mono px-2 py-1 rounded text-xs">2023-10-27 {formatTime(progress)}:01.450</span>
          </div>
        </div>
      </div>

      {/* Transport Controls & Timeline */}
      <div className="shrink-0 bg-[#121724] p-4 rounded border border-[#232C3F] flex flex-col gap-4">
        {/* Controls Bar */}
        <div className="flex justify-between items-center px-4">
          {/* Speed Controls */}
          <div className="flex items-center gap-1 bg-[#0b0e17] p-1 rounded border border-[#232C3F]">
            <button className="w-10 py-1 text-xs font-mono text-gray-500 hover:text-white hover:bg-[#31343f] rounded transition-colors">-8x</button>
            <button className="w-10 py-1 text-xs font-mono text-gray-500 hover:text-white hover:bg-[#31343f] rounded transition-colors">-2x</button>
            <button className="w-10 py-1 text-xs font-mono text-[#d2bbff] bg-[#31343f] rounded border border-[#232C3F] font-bold">1x</button>
            <button className="w-10 py-1 text-xs font-mono text-gray-500 hover:text-white hover:bg-[#31343f] rounded transition-colors">2x</button>
            <button className="w-10 py-1 text-xs font-mono text-gray-500 hover:text-white hover:bg-[#31343f] rounded transition-colors">8x</button>
          </div>
          
          {/* Main Transport */}
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-white transition-colors" title="이전 프레임">
              <span className="material-symbols-outlined text-3xl">skip_previous</span>
            </button>
            <button className="w-14 h-14 rounded-full bg-[#7c3aed] text-white flex items-center justify-center hover:bg-[#6d28d9] transition-colors shadow-[0_0_15px_rgba(124,58,237,0.4)]">
              <span className="material-symbols-outlined text-4xl">play_arrow</span>
            </button>
            <button className="text-gray-400 hover:text-white transition-colors" title="다음 프레임">
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
            <button className="p-2 border border-[#232C3F] rounded text-gray-400 hover:text-white hover:bg-[#31343f] transition-colors" title="클립 내보내기">
              <span className="material-symbols-outlined text-xl">download</span>
            </button>
          </div>
        </div>

        {/* Progressive Timeline */}
        <div 
          className="relative h-20 bg-[#0b0e17] border border-[#232C3F] rounded overflow-hidden flex flex-col justify-end"
          onWheel={handleWheel}
        >
          {/* Zoom Indicator */}
          <div className="absolute top-1 right-2 z-30 text-[10px] text-gray-500 font-mono bg-black/50 px-1 rounded">
            줌: {zoomLevel.toFixed(1)}x
          </div>
          
          {/* Event Tracks with dynamic bookmarks */}
          <div className="absolute top-2 left-0 right-0 h-10 flex flex-col gap-1 px-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 w-8">CH 1</span>
              <div className="flex-1 h-1.5 bg-[#232C3F] rounded-full relative">
                <div className="absolute left-[15%] w-[10%] h-full bg-[#7c3aed] rounded-full"></div>
                <div className="absolute left-[40%] w-[5%] h-full bg-red-500 rounded-full"></div>
                {/* 동적 북마크 매핑 (랜덤 시뮬레이션용 임시 로직) */}
                {logs.filter(l => l.cameraId === 'CAM-01' && l.level === 'critical').map((l, i) => (
                  <div key={l.id} className="absolute w-2 h-4 bg-red-500 rounded-sm top-[-5px]" style={{ left: `${30 + (i * 15)}%` }} title={l.message}></div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 w-8">CH 2</span>
              <div className="flex-1 h-1.5 bg-[#232C3F] rounded-full relative">
                <div className="absolute left-[35%] w-[8%] h-full bg-[#7c3aed] rounded-full"></div>
                {logs.filter(l => l.cameraId === 'CAM-02' && l.level === 'critical').map((l, i) => (
                  <div key={l.id} className="absolute w-2 h-4 bg-red-500 rounded-sm top-[-5px]" style={{ left: `${50 + (i * 10)}%` }} title={l.message}></div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 w-8">CH 3</span>
              <div className="flex-1 h-1.5 bg-[#232C3F] rounded-full relative">
                <div className="absolute left-[12%] w-[3%] h-full bg-yellow-500 rounded-full"></div>
                {logs.filter(l => l.cameraId === 'CAM-03' && l.level === 'critical').map((l, i) => (
                  <div key={l.id} className="absolute w-2 h-4 bg-red-500 rounded-sm top-[-5px]" style={{ left: `${20 + (i * 20)}%` }} title={l.message}></div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 w-8">CH 4</span>
              <div className="flex-1 h-1.5 bg-[#232C3F] rounded-full relative">
                <div className="absolute left-[65%] w-[15%] h-full bg-green-500 rounded-full"></div>
                {logs.filter(l => l.cameraId === 'CAM-04' && l.level === 'critical').map((l, i) => (
                  <div key={l.id} className="absolute w-2 h-4 bg-red-500 rounded-sm top-[-5px]" style={{ left: `${80 + (i * 5)}%` }} title={l.message}></div>
                ))}
              </div>
            </div>
          </div>

          {/* Time Ruler */}
          <div className="w-full flex justify-between text-[11px] font-mono text-gray-500 px-[40px] border-t border-[#232C3F] pt-1 pb-1">
            <span>{zoomLevel > 10 ? formatTime(Math.max(0, progress - 100/zoomLevel)) : '00:00'}</span>
            <span>{zoomLevel > 10 ? '' : '04:00'}</span>
            <span>{zoomLevel > 10 ? '' : '08:00'}</span>
            <span>{zoomLevel > 10 ? '' : '12:00'}</span>
            <span className="text-[#d2bbff] font-bold">{formatTime(progress, true)}</span>
            <span>{zoomLevel > 10 ? '' : '20:00'}</span>
            <span>{zoomLevel > 10 ? formatTime(Math.min(100, progress + 100/zoomLevel)) : '24:00'}</span>
          </div>

          {/* Progressive Scrubber / Slider */}
          <div className="absolute inset-x-0 bottom-6 h-full pointer-events-none px-[40px]">
            <div className="absolute top-0 bottom-0 w-[2px] bg-[#d2bbff] shadow-[0_0_8px_rgba(210,187,255,0.8)] flex flex-col items-center transition-all duration-75" style={{ left: `calc(40px + calc(100% - 80px) * ${progress / 100})` }}>
              <div className="w-3 h-3 bg-[#d2bbff] rounded-full -mt-1"></div>
            </div>
          </div>
          
          <input 
            className="absolute bottom-6 w-full opacity-0 cursor-pointer h-12 z-20" 
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
    </main> </> );
};

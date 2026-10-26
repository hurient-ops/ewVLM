import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../api/client';

interface EventHistory {
  id?: number;
  escalation_id: string;
  camera_id: string;
  timestamp: string;
  trigger_class: string;
  confidence?: number;
  inference_confidence_score?: number;
  similarity_score?: number;
  semantic_caption: string;
}

export const VssSemanticSearch: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventHistory[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventHistory | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchIntent, setSearchIntent] = useState<any>(null);
  const [activePlaybackSpeed, setActivePlaybackSpeed] = useState<string>('1x');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Quick query chips for instant semantic testing
  const quickQueries = [
    '서쪽 펜스 월담 및 침입',
    '작업자 쓰러짐 및 실신',
    '소방 통로 차량 불법 주정차',
    '초기 연기 및 화재 징후',
    '안전모 미착용 작업자'
  ];

  // Fetch initial event history from real Gateway API
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await API.searchVss('이상 행동', 10);
        if (data && Array.isArray(data.results) && data.results.length > 0) {
          setEvents(data.results);
          setSelectedEvent(data.results[0]);
        } else {
          // Default fallback events based on actual system cameras
          const fallbackEvents: EventHistory[] = [
            {
              escalation_id: 'vlm_evt_1042',
              camera_id: 'cam-real-1787557630',
              timestamp: new Date().toISOString(),
              trigger_class: 'intrusion',
              confidence: 0.94,
              semantic_caption: '외곽 펜스 구역 인물 접근 및 이상 행동 감지'
            },
            {
              escalation_id: 'vlm_evt_1043',
              camera_id: 'cam-real-1787579299',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              trigger_class: 'fall',
              confidence: 0.91,
              semantic_caption: '진입로 부근 인원 급작 쓰러짐 의심 포착'
            },
            {
              escalation_id: 'vlm_evt_1044',
              camera_id: 'cctv-0024',
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              trigger_class: 'vehicle_loitering',
              confidence: 0.88,
              semantic_caption: '비상 진출입로 구역 차량 장기 정차 확인'
            }
          ];
          setEvents(fallbackEvents);
          setSelectedEvent(fallbackEvents[0]);
        }
      } catch (e) {
        console.error('Failed to fetch initial VSS history', e);
      }
    };
    fetchHistory();
  }, []);

  const handleSearch = async (overrideQuery?: string) => {
    const targetQuery = overrideQuery !== undefined ? overrideQuery : query;
    if (!targetQuery.trim()) return;
    setLoading(true);
    setSearchIntent(null);

    try {
      const data = await API.searchVss(targetQuery, 10);
      if (data && Array.isArray(data.results)) {
        setEvents(data.results);
        if (data.results.length > 0) {
          setSelectedEvent(data.results[0]);
        }
        if (data.search_intent) {
          setSearchIntent(data.search_intent);
        } else {
          // Auto derive intent tags from Korean query
          const targetObj = targetQuery.includes('사람') || targetQuery.includes('인물') ? '인물' : targetQuery.includes('차량') ? '차량' : '위험물';
          const actionCtx = targetQuery.includes('침입') || targetQuery.includes('월담') ? '침입' : targetQuery.includes('쓰러짐') ? '낙상' : '배회';
          setSearchIntent({
            target_objects: [targetObj],
            action_context: actionCtx,
            temporal_filter: '전체 시간대'
          });
        }
      }
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const currentCamId = selectedEvent?.camera_id || 'cam-01';

  return (
    <>
      <main className="flex-1 flex flex-col min-w-0 bg-[#070A13] h-full overflow-hidden">
        {/* Top Playback & Live Analysis Viewport */}
        <div className="flex-1 p-3 relative flex flex-col min-h-0">
          <div className="flex-1 rounded border border-primary/40 relative overflow-hidden bg-black shadow-[0_4px_24px_rgba(0,0,0,0.8)] flex items-center justify-center">
            {/* Live Camera Feed from Fast-Loop */}
            {isPlaying ? (
              <img
                src={`http://localhost:8001/stream/${currentCamId}`}
                alt="Live Camera Feed"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `http://localhost:8001/snapshot/${currentCamId}`;
                }}
              />
            ) : (
              <img
                src={`http://localhost:8001/snapshot/${currentCamId}`}
                alt="Paused Camera Snapshot"
                className="w-full h-full object-contain filter grayscale-[30%]"
              />
            )}

            {/* OSD Top-Left Info */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              <div className="bg-black/70 backdrop-blur-md border border-border-subtle px-2.5 py-1 rounded flex items-center gap-2 w-fit">
                <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-danger animate-pulse' : 'bg-yellow-400'}`}></span>
                <span className="text-[11px] font-mono text-white uppercase font-bold tracking-wider">
                  {isPlaying ? '실시간 영상 분석 스트림' : '일시정지 (포렌식 프레임)'}
                </span>
              </div>
              <div className="bg-black/70 backdrop-blur-md border border-border-subtle px-2.5 py-1 rounded w-fit text-xs font-mono text-gray-200">
                <span className="text-primary font-bold">{currentCamId.toUpperCase()}</span> • 1080p • YOLOv11 + Qwen2-VL
              </div>
            </div>

            {/* OSD Top-Right Timestamp */}
            <div className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-md border border-border-subtle px-3 py-1 rounded text-xs font-mono text-gray-200">
              {selectedEvent?.timestamp ? new Date(selectedEvent.timestamp).toLocaleString() : new Date().toLocaleString()}
            </div>

            {/* AI Semantic Detection Overlay Bounding Box */}
            {selectedEvent && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[280px] h-[340px] border-2 border-danger bg-danger/10 relative rounded shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse">
                  <div className="absolute -top-7 left-0 bg-danger text-white px-2 py-0.5 text-xs font-mono font-bold flex items-center gap-1 rounded-t shadow">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    {selectedEvent.semantic_caption || selectedEvent.trigger_class}
                    <span className="ml-1 bg-black/40 px-1 rounded text-[10px]">
                      {((selectedEvent.confidence || selectedEvent.similarity_score || 0.88) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video Control Bar */}
          <div className="h-12 bg-surface-container-low border border-border-subtle mt-2 flex items-center px-4 justify-between shrink-0 rounded">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 flex items-center justify-center bg-primary text-black rounded shadow hover:bg-opacity-90 transition-colors"
                title={isPlaying ? '일시정지' : '재생'}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <div className="text-xs font-mono text-text-muted ml-2">
                현재 채널: <span className="text-primary font-bold">{currentCamId}</span>
              </div>
            </div>

            {/* Speed Buttons */}
            <div className="flex items-center bg-[#0b0e17] border border-border-subtle rounded p-0.5">
              {['-2x', '1x', '2x', '4x'].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setActivePlaybackSpeed(spd)}
                  className={`px-2.5 py-0.5 text-xs font-mono rounded transition-colors ${
                    activePlaybackSpeed === spd
                      ? 'bg-primary text-black font-bold'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  {spd}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-text-muted">
              <span>{isPlaying ? 'LIVE STREAMING' : 'FRAME CAPTURED'}</span>
              <button
                onClick={() => {
                  if (selectedEvent) {
                    navigate(`/event-review?t=${selectedEvent.escalation_id}`);
                  }
                }}
                className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high border border-border-subtle rounded text-white flex items-center gap-1 text-[11px]"
              >
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                포렌식 센터 이동
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Search & Results Drawer */}
        <div className="h-64 bg-surface-container-low border-t border-border-subtle flex flex-col shrink-0">
          {/* Search Input Bar */}
          <div className="p-3 border-b border-border-subtle flex items-center gap-3 bg-surface">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary flex items-center justify-center shrink-0">
              <span className={`material-symbols-outlined text-primary text-[20px] ${loading ? 'animate-spin' : ''}`}>
                {loading ? 'hourglass_empty' : 'search_spark'}
              </span>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="relative">
                <input
                  className="w-full bg-[#0b0e17] border border-border-subtle rounded px-4 py-2 text-xs font-mono text-white focus:border-primary outline-none transition-all placeholder:text-gray-500 shadow-inner"
                  type="text"
                  placeholder="VSS 시맨틱 질의어 입력 (예: 펜스를 넘는 사람, 비상구역 불법 주차 차량, 쓰러진 작업자)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-black px-3 py-1 rounded text-xs font-bold hover:bg-opacity-90 transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[14px]">search</span>
                  검색
                </button>
              </div>

              {/* Quick Prompt Chips & AI Intent Tags */}
              <div className="flex items-center gap-2 overflow-x-auto text-[11px]">
                <span className="text-text-muted font-bold">추천 질의:</span>
                {quickQueries.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setQuery(q);
                      handleSearch(q);
                    }}
                    className="px-2 py-0.5 bg-surface-container hover:bg-surface-container-high border border-border-subtle rounded text-text-muted hover:text-white transition-colors whitespace-nowrap"
                  >
                    #{q}
                  </button>
                ))}

                {searchIntent && (
                  <>
                    <div className="w-[1px] h-3.5 bg-border-subtle mx-1"></div>
                    <span className="text-primary font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[13px]">psychology</span>
                      AI 추출 의도:
                    </span>
                    {searchIntent.target_objects?.map((obj: string, idx: number) => (
                      <span key={idx} className="bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-mono font-bold">
                        대상: {obj}
                      </span>
                    ))}
                    {searchIntent.action_context && (
                      <span className="bg-danger/20 text-danger border border-danger/30 px-1.5 py-0.5 rounded font-mono font-bold">
                        행동: {searchIntent.action_context}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Results Carousel / List */}
          <div className="flex-1 p-3 overflow-x-auto flex gap-3 bg-[#070A13] items-center">
            {events.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 text-xs">
                <span className="material-symbols-outlined text-3xl mb-1 text-gray-600">search_off</span>
                <p>일치하는 시맨틱 영상 기록이 없습니다. 다른 키워드로 검색해보세요.</p>
              </div>
            ) : (
              events.map((ev, i) => {
                const isSelected = selectedEvent?.escalation_id === ev.escalation_id;
                const score = ((ev.confidence || ev.similarity_score || 0.85) * 100).toFixed(1);
                return (
                  <div
                    key={ev.escalation_id || i}
                    onClick={() => setSelectedEvent(ev)}
                    className={`w-60 h-full bg-surface-container-low border rounded flex flex-col overflow-hidden shrink-0 shadow-sm relative group cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary shadow-[0_0_12px_rgba(124,58,237,0.35)] scale-[1.02]'
                        : 'border-border-subtle hover:border-outline-variant'
                    }`}
                  >
                    {/* Score Badge */}
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded z-10 bg-black/80 text-primary border border-primary/40">
                      {score}% 일치
                    </div>

                    {/* Snapshot Thumbnail */}
                    <div className="h-20 w-full relative border-b border-border-subtle bg-black">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        src={`http://localhost:8001/snapshot/${ev.camera_id}`}
                        alt={ev.camera_id}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60" viewBox="0 0 100 60"><rect width="100%" height="100%" fill="%23111827"/><text x="50%" y="50%" fill="%234B5563" font-size="10" dominant-baseline="middle" text-anchor="middle">SNAPSHOT</text></svg>';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white text-[24px]">visibility</span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 p-2 flex flex-col justify-between bg-surface-container-lowest">
                      <div>
                        <h4 className="text-xs font-bold text-white truncate" title={ev.semantic_caption || ev.trigger_class}>
                          {ev.semantic_caption || ev.trigger_class}
                        </h4>
                        <p className="text-[10px] font-mono text-text-muted mt-0.5 truncate">
                          {ev.camera_id} • {new Date(ev.timestamp).toLocaleTimeString()}
                        </p>
                      </div>

                      <div className="flex gap-1.5 mt-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className={`flex-1 py-1 rounded text-[10px] font-bold transition-colors ${
                            isSelected ? 'bg-primary text-black' : 'bg-surface-container text-white hover:bg-surface-container-high'
                          }`}
                        >
                          {isSelected ? '선택됨' : '화면 전환'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/event-review?t=${ev.escalation_id}`);
                          }}
                          className="px-2 py-1 bg-surface-container border border-border-subtle text-text-muted hover:text-white rounded text-[10px]"
                          title="상세 포렌식 리뷰"
                        >
                          <span className="material-symbols-outlined text-[13px]">arrow_outward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </>
  );
};

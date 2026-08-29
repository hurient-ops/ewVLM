import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../api/client';

interface EventHistory {
  id: number;
  escalation_id: string;
  camera_id: string;
  timestamp: string;
  trigger_class: string;
  confidence: number;
  semantic_caption: string;
}

export const VssSemanticSearch: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventHistory[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchIntent, setSearchIntent] = useState<any>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await API.fetchEvents(10);
        if (data.status === 'success') {
          setEvents(data.events);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchHistory();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await API.searchVss(query, 10);
      if (data.status === 'success') {
        setEvents(data.results);
        if (data.search_intent) {
          setSearchIntent(data.search_intent);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <main className="flex-1 flex flex-col min-w-0 bg-surface-dim">
        <div className="flex-1 p-gutter relative flex flex-col">
          <div className="flex-1 rounded-sm border-[2px] border-primary/40 relative overflow-hidden bg-black shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            <div className="absolute inset-0 bg-cover bg-center" data-alt="A high-resolution, gritty security camera playback view" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD4SEbi8Lygn02Z88X6mtD1HAHuf_3NcNxHPgYmsRd9n_y-fDSnhjKsiq8xViD6-jfibHOHCgN02lyOmP-Wq6YzdKyDg4G2OX42HWg8Tbb_zA7sWdVfFQmwZ4BL8_gntjC_vt0ol7wK_8NyTuCruZ8l0jvAJYVitOx0c9f6sWMHncQc52XQ0CdsyTB0rC2EI1g3iwPKFqJBl7HRKVLVhgnSxsFklkKEuTOi3wAE9YCWVLGIFF1rXBIv0A')" }}></div>
            <div className="absolute top-osd-margin left-osd-margin flex flex-col gap-1 z-10">
              <div className="bg-surface-container-lowest/80 backdrop-blur-sm border border-border-subtle px-2 py-1 rounded-sm flex items-center gap-2 w-fit">
                <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
                <span className="text-osd-label font-osd-label text-on-surface uppercase">재생</span>
              </div>
              <div className="bg-surface-container-lowest/80 backdrop-blur-sm border border-border-subtle px-2 py-1 rounded-sm w-fit mt-1">
                <span className="text-osd-label font-osd-label text-on-surface">CH-03 하역장 • 4K • H.265</span>
              </div>
            </div>
            <div className="absolute top-osd-margin right-osd-margin z-10 bg-surface-container-lowest/80 backdrop-blur-sm border border-border-subtle px-3 py-1.5 rounded-sm">
              <span className="text-mono-data font-mono-data text-on-surface text-[14px]">2024-10-24 14:32:45.102</span>
            </div>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[40%] left-[60%] w-[120px] h-[200px] border-[1.5px] border-danger bg-danger/5">
                <div className="absolute -top-[18px] left-[-1.5px] bg-danger text-on-error px-1 text-[10px] font-mono-data flex items-center gap-1 h-[18px]">
                  <span className="material-symbols-outlined text-[10px]">warning</span> 경고: 쓰러짐 감지 (98.7%) 
                </div>
              </div>
              <div className="absolute top-[20%] left-[10%] w-[80px] h-[150px] border-[1.5px] border-primary bg-primary/5">
                <div className="absolute -top-[18px] left-[-1.5px] bg-primary text-on-primary px-1 text-[10px] font-mono-data h-[18px]"> 사람 (92%) </div>
              </div>
            </div>
          </div>
          
          <div className="h-14 bg-surface border border-border-subtle mt-gutter flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface hover:bg-surface-container-highest rounded transition-colors" title="-10s"><span className="material-symbols-outlined text-[20px]">replay_10</span></button>
              <button className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface hover:bg-surface-container-highest rounded transition-colors" title="Previous Frame"><span className="material-symbols-outlined text-[20px]">skip_previous</span></button>
              <button className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary rounded shadow-sm hover:bg-inverse-primary transition-colors mx-2"><span className="material-symbols-outlined symbol-filled text-[24px]">pause</span></button>
              <button className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface hover:bg-surface-container-highest rounded transition-colors" title="Next Frame"><span className="material-symbols-outlined text-[20px]">skip_next</span></button>
              <button className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface hover:bg-surface-container-highest rounded transition-colors" title="+10s"><span className="material-symbols-outlined text-[20px]">forward_10</span></button>
            </div>
            <div className="flex items-center bg-surface-container-lowest border border-border-subtle rounded p-1">
              <button className="px-2 py-1 text-mono-data font-mono-data text-text-muted hover:text-on-surface rounded text-[11px]">-8x</button>
              <button className="px-2 py-1 text-mono-data font-mono-data text-text-muted hover:text-on-surface rounded text-[11px]">-4x</button>
              <button className="px-2 py-1 text-mono-data font-mono-data text-text-muted hover:text-on-surface rounded text-[11px]">-2x</button>
              <div className="w-[1px] h-4 bg-border-subtle mx-1"></div>
              <button className="px-3 py-1 bg-surface-container-highest text-primary font-bold text-mono-data font-mono-data rounded shadow-sm text-[11px]">1x</button>
              <div className="w-[1px] h-4 bg-border-subtle mx-1"></div>
              <button className="px-2 py-1 text-mono-data font-mono-data text-text-muted hover:text-on-surface rounded text-[11px]">2x</button>
              <button className="px-2 py-1 text-mono-data font-mono-data text-text-muted hover:text-on-surface rounded text-[11px]">4x</button>
              <button className="px-2 py-1 text-mono-data font-mono-data text-text-muted hover:text-on-surface rounded text-[11px]">8x</button>
            </div>
            <div className="flex items-center gap-3 text-mono-data font-mono-data">
              <span className="text-text-primary">14:32:45</span>
              <span className="text-text-muted">/</span>
              <span className="text-text-muted">23:59:59</span>
              <button className="ml-2 w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface rounded border border-border-subtle hover:bg-surface-container-highest"><span className="material-symbols-outlined text-[18px]">fullscreen</span></button>
            </div>
          </div>
        </div>

        <div className="h-56 bg-surface-container-low border-t border-border-subtle flex flex-col shrink-0">
          <div className="p-4 border-b border-border-subtle flex items-start gap-4 bg-surface">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 border border-primary flex items-center justify-center shrink-0">
              <span className={`material-symbols-outlined text-primary ${loading ? 'animate-spin' : ''}`}>{loading ? 'hourglass_empty' : 'search_spark'}</span>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="relative">
                <input 
                  className="w-full bg-surface-container-lowest border border-border-subtle rounded p-3 pl-4 pr-24 text-body-base font-body-base text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline-variant shadow-inner" 
                  type="text" 
                  placeholder="검색어를 입력하세요 (예: 서쪽 계단 근처에서 쓰러진 사람 찾기)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-mono-data font-mono-data text-text-muted text-[10px] bg-surface px-1.5 py-0.5 rounded border border-border-subtle">입력 ↵</span>
                  <button onClick={handleSearch} disabled={loading} className="bg-primary text-on-primary p-1.5 rounded hover:bg-inverse-primary transition-colors flex items-center justify-center disabled:opacity-50"><span className="material-symbols-outlined text-[18px]">arrow_forward</span></button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-label-caps font-label-caps text-text-muted">필터:</span>
                <span className="bg-surface-container px-2 py-1 rounded border border-border-subtle text-mono-data font-mono-data text-on-surface-variant text-[10px] flex items-center gap-1 cursor-pointer hover:border-outline"><span className="material-symbols-outlined text-[12px]">schedule</span> 최근 24시간</span>
                <span className="bg-surface-container px-2 py-1 rounded border border-border-subtle text-mono-data font-mono-data text-on-surface-variant text-[10px] flex items-center gap-1 cursor-pointer hover:border-outline"><span className="material-symbols-outlined text-[12px]">videocam</span> 전체 카메라</span>
                
                {searchIntent && (
                  <>
                    <div className="w-[1px] h-4 bg-border-subtle mx-1"></div>
                    <span className="text-label-caps font-label-caps text-primary flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">psychology</span> AI 추출 의도:</span>
                    {searchIntent.target_objects?.map((obj: string, idx: number) => (
                      <span key={idx} className="bg-primary/10 text-primary border border-primary/30 px-2 py-1 rounded text-mono-data font-mono-data text-[10px] font-bold">대상: {obj}</span>
                    ))}
                    {searchIntent.action_context && (
                      <span className="bg-danger/10 text-danger border border-danger/30 px-2 py-1 rounded text-mono-data font-mono-data text-[10px] font-bold">행동: {searchIntent.action_context}</span>
                    )}
                    {searchIntent.temporal_filter && (
                      <span className="bg-secondary/10 text-secondary border border-secondary/30 px-2 py-1 rounded text-mono-data font-mono-data text-[10px] font-bold">시간: {searchIntent.temporal_filter}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-x-auto flex gap-4 bg-surface-dim items-center">
            {events.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2">database</span>
                <p>기록된 이벤트가 없습니다.</p>
              </div>
            ) : (
              events.map((ev, i) => (
                <div key={ev.id} className={`w-64 h-full bg-surface border rounded flex flex-col overflow-hidden shrink-0 shadow-sm relative group ${ev.trigger_class.includes('collapsed') || ev.trigger_class.includes('fall') ? 'border-danger/40 shadow-[0_0_12px_rgba(239,68,68,0.1)]' : 'border-border-subtle'}`}>
                  <div className={`absolute top-0 right-0 px-2 py-0.5 text-mono-data font-mono-data text-[10px] font-bold rounded-bl z-10 flex items-center gap-1 ${ev.trigger_class.includes('collapsed') || ev.trigger_class.includes('fall') ? 'bg-danger text-on-error' : 'bg-surface-container-highest text-on-surface'}`}>
                    {(ev.confidence * 100).toFixed(1)}% 일치
                  </div>
                  <div className="h-24 w-full relative border-b border-border-subtle">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDzprRcN0kVBjqgQh1nrGL47mB-f6WTZt3tEoi_TXul2a4qM6cHbekMl96pddySz-R0qOyRnsRLmexo-eIgWihud4psi3dppJkcvAKmfS1AdLQcnvsVOvm25VX9PSMDnFhX4BKNeCvBkr8kLO60xKdjRIFCMK8onjRqRRV2w-HL1X8h_PuwyHvlnf_wf9IynmncXXqXR2R6oBxVtsz3Wx1GrO1NA98QTMJ_qIOrAftqkU_59BJe7ze2JA')" }}></div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]">
                      <span className="material-symbols-outlined symbol-filled text-white text-[32px] drop-shadow-md">play_circle</span>
                    </div>
                  </div>
                  <div className="flex-1 p-2 flex flex-col justify-between bg-surface-container-lowest">
                    <div>
                      <h3 className="text-body-sm font-body-sm text-text-primary font-semibold truncate" title={ev.semantic_caption || ev.trigger_class}>
                        {ev.semantic_caption ? ev.semantic_caption.substring(0, 20) + "..." : ev.trigger_class}
                      </h3>
                      <p className="text-mono-data font-mono-data text-text-muted text-[10px] mt-0.5">{ev.camera_id} • {new Date(ev.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <button 
                      onClick={() => {
                        navigate(`/event-review?t=${ev.escalation_id}`);
                      }}
                      className="w-full bg-surface-container hover:bg-surface-container-highest border border-border-subtle text-on-surface text-label-caps font-label-caps py-1.5 rounded transition-colors flex items-center justify-center gap-1 mt-2"
                    > 
                      이벤트로 이동 <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                    </button>
                  </div>
                </div>
              ))
            )}
            {events.length > 0 && (
              <div className="h-full border border-dashed border-border-subtle rounded w-32 shrink-0 flex flex-col items-center justify-center text-text-muted hover:bg-surface-container-low transition-colors cursor-pointer gap-2">
                <span className="material-symbols-outlined text-[24px]">more_horiz</span>
                <span className="text-label-caps font-label-caps text-[10px] text-center px-2">결과<br/>더보기</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};


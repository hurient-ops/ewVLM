import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export const MonitorBLayout: React.FC = () => {
  const location = useLocation();
  const isDetachedWindow = window.name === 'VLM_Detached';
  const [isDetachedMode, setIsDetachedMode] = useState(() => {
    return sessionStorage.getItem('vlm_is_detached') === 'true';
  });
  const [channel, setChannel] = useState<BroadcastChannel | null>(null);

  useEffect(() => {
    const bc = new BroadcastChannel('vlm_monitor_b_sync');
    setChannel(bc);

    bc.onmessage = (event) => {
      if (event.data === 'detach_opened') {
        if (!isDetachedWindow) {
          setIsDetachedMode(true);
          sessionStorage.setItem('vlm_is_detached', 'true');
        }
      }
      if (event.data === 'detach_closed') {
        if (!isDetachedWindow) {
          setIsDetachedMode(false);
          sessionStorage.removeItem('vlm_is_detached');
        }
      }
      if (event.data === 'force_close_detached') {
        if (isDetachedWindow) window.close();
      }
      if (event.data === 'ping_detach_status') {
        if (isDetachedWindow) {
          bc.postMessage('detach_opened');
        }
      }
    };

    if (isDetachedWindow) {
      bc.postMessage('detach_opened');
      window.addEventListener('beforeunload', () => {
        bc.postMessage('detach_closed');
      });
    } else {
      // Query if detached window is already alive
      bc.postMessage('ping_detach_status');
    }

    return () => {
      bc.close();
    };
  }, [isDetachedWindow]);

  const openDetachedWindow = () => {
    const newWindow = window.open(location.pathname, 'VLM_Detached', 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no');
    if (newWindow) {
      setIsDetachedMode(true);
    } else {
      alert("⚠️ 브라우저 팝업 차단이 감지되었습니다.\n\n주소창 우측에서 팝업 차단을 해제한 후 다시 시도해주세요.");
    }
  };

  const closeDetachedWindow = () => {
    if (channel) {
      channel.postMessage('detach_closed');
    }
    window.close();
  };

  if (!isDetachedWindow && isDetachedMode) {
    return (
      <div className="flex flex-col flex-1 h-full bg-[#0b0e17] items-center justify-center m-4 rounded-lg border border-[#232C3F]">
        <span className="material-symbols-outlined text-[64px] text-gray-500 mb-4">open_in_new</span>
        <h2 className="text-2xl font-bold text-white mb-2">VLM 분석이 새 창에서 실행 중입니다</h2>
        <p className="text-gray-400 mb-6">다중 모니터 관제를 위해 분리된 창을 사용 중입니다.</p>
        <button 
          onClick={() => {
            if (channel) channel.postMessage('force_close_detached');
            setIsDetachedMode(false);
          }}
          className="px-6 py-2 bg-[#7c3aed] text-white font-semibold rounded hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(124,58,237,0.4)]"
        >
          <span className="material-symbols-outlined text-[20px]">tab_unselected</span>
          본 화면으로 강제 복귀
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full relative">
      {/* Detach/Attach Global Button */}
      <div className="absolute top-3 right-6 z-50">
        {isDetachedWindow ? (
          <button 
            onClick={closeDetachedWindow}
            className="px-4 py-2 bg-[#121724] border border-[#232C3F] text-white text-[14px] font-semibold rounded shadow-lg hover:bg-[#31343f] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">tab_unselected</span> 본 화면으로 복귀
          </button>
        ) : (
          <button 
            onClick={openDetachedWindow}
            className="px-4 py-2 bg-[#121724] border border-[#232C3F] text-white text-[14px] font-semibold rounded shadow-lg hover:bg-[#31343f] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span> 새 창으로 분리
          </button>
        )}
      </div>
      {/* Monitor B Dedicated Sidebar */}
      <aside className="w-[280px] flex-shrink-0 bg-[#121724] border-r border-[#232C3F] flex flex-col h-full z-40">
        <div className="p-4 border-b border-[#232C3F] flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#31343f] flex items-center justify-center border border-[#232C3F]">
            <span className="material-symbols-outlined text-[#d2bbff]">psychology</span>
          </div>
          <div>
            <h2 className="text-[16px] font-semibold text-white whitespace-nowrap">VLM 지능형 분석</h2>
            <p className="text-[12px] text-gray-400 mt-1 font-mono">분석 도구 모음</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <nav className="flex flex-col gap-1.5">
            {[
              { path: '/monitor-b', name: '실시간 VLM 분석', icon: 'psychology' },
              { path: '/vss-semantic-search', name: '자연어 기반 영상 검색 (VSS)', icon: 'youtube_searched_for' },
              { path: '/event-review', name: '이벤트 리뷰 센터', icon: 'history' },
              { path: '/disaster-war-room', name: '대화형 재난 워룸', icon: 'warning' },
              { path: '/realtime-bi', name: '실시간 분석 대시보드', icon: 'bar_chart' },
              { path: '/nl-rule-copilot', name: '자연어 규칙 코파일럿', icon: 'chat' },
              { path: '/semantic-vector', name: '시맨틱 벡터 포탈', icon: 'hub' },
              { path: '/prompt-gateway', name: '프롬프트 게이트웨이', icon: 'settings_ethernet' },
              { path: '/lora-finetuning', name: 'LoRA 파인튜닝', icon: 'model_training' },
            ].map(screen => {
              const isActive = location.pathname === screen.path;
              return (
                <Link
                  key={screen.path}
                  to={screen.path}
                  className={`px-3 py-2.5 text-sm rounded transition-colors flex items-center gap-3 ${
                    isActive
                      ? 'bg-[#7c3aed]/20 text-[#d2bbff] border border-[#7c3aed]/30 font-semibold'
                      : 'text-gray-400 hover:bg-[#31343f] hover:text-gray-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{screen.icon}</span>
                  {screen.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="flex-1 overflow-auto relative bg-[#0b0e17] pt-[60px]">
        <Outlet />
      </main>
    </div>
  );
};

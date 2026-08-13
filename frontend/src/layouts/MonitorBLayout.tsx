import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export const MonitorBLayout: React.FC = () => {
  const location = useLocation();

  return (
    <>
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

      <main className="flex-1 overflow-auto relative bg-[#0b0e17]">
        <Outlet />
      </main>
    </>
  );
};

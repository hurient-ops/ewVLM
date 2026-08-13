import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export const BaseLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  // Helper to determine active top tab
  const getActiveTab = () => {
    if (location.pathname.startsWith('/monitor-b') || 
        location.pathname.startsWith('/vss-semantic-search') || 
        location.pathname.startsWith('/event-review') || 
        location.pathname.startsWith('/disaster-war-room') || 
        location.pathname.startsWith('/realtime-bi')) {
      return 'B';
    }
    if (location.pathname.startsWith('/multi-channel-sync')) {
      return 'PLAYBACK';
    }
    if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/gis-map')) {
      return 'DASHBOARD';
    }
    return 'A'; // Default to Monitor A
  };

  const activeTab = getActiveTab();

  return (
    <div className="flex flex-col h-screen bg-[#0b0e17] text-gray-100 font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
      
      {/* Global Top Header */}
      <header className="h-[60px] flex-shrink-0 flex justify-between items-center px-6 bg-[#121724] border-b border-[#232C3F] shadow-sm z-50">
        
        {/* Left: Logo & Main Navigation Tabs */}
        <div className="flex items-center h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer mr-8" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="ewVLM Logo" className="w-9 h-9 rounded-full border-2 border-[#d2bbff]/50 shadow-[0_0_15px_rgba(210,187,255,0.6)] brightness-125 contrast-110 drop-shadow-[0_0_5px_rgba(210,187,255,0.8)] transition-all hover:brightness-150 hover:shadow-[0_0_20px_rgba(210,187,255,0.9)]" />
            <div className="text-[26px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d2bbff] to-[#ffffff] tracking-tighter drop-shadow-[0_2px_4px_rgba(124,58,237,0.8)]">
              ewVLM
            </div>
          </div>

          {/* Top Tabs */}
          <div className="flex items-center h-full gap-1">
            <button 
              onClick={() => navigate('/monitor-a')}
              className={`h-full px-6 flex items-center justify-center font-bold text-[15px] border-b-2 transition-colors ${activeTab === 'A' ? 'border-[#d2bbff] text-[#d2bbff]' : 'border-transparent text-gray-400 hover:text-white hover:bg-[#31343f]/50'}`}
            >
              실시간 영상
            </button>
            <button 
              onClick={() => navigate('/multi-channel-sync')} 
              className={`h-full px-6 flex items-center justify-center font-bold text-[15px] border-b-2 transition-colors ${activeTab === 'PLAYBACK' ? 'border-[#d2bbff] text-[#d2bbff]' : 'border-transparent text-gray-400 hover:text-white hover:bg-[#31343f]/50'}`}
            >
              저장영상
            </button>
            <button 
              onClick={() => navigate('/gis-map')}
              className={`h-full px-6 flex items-center justify-center font-bold text-[15px] border-b-2 transition-colors ${activeTab === 'DASHBOARD' ? 'border-[#d2bbff] text-[#d2bbff]' : 'border-transparent text-gray-400 hover:text-white hover:bg-[#31343f]/50'}`}
            >
              대시보드
            </button>
            <button 
              onClick={() => navigate('/monitor-b')}
              className={`h-full px-6 flex items-center justify-center font-bold text-[15px] border-b-2 transition-colors ${activeTab === 'B' ? 'border-[#d2bbff] text-[#d2bbff]' : 'border-transparent text-gray-400 hover:text-white hover:bg-[#31343f]/50'}`}
            >
              VLM 분석
            </button>
          </div>
        </div>

        {/* Right: Utilities & Profile */}
        <div className="flex items-center gap-4">
          
          {/* Settings Dropdown Wrapper */}
          <div className="relative">
            <button 
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              onBlur={() => setTimeout(() => setShowSettingsDropdown(false), 200)}
              className={`p-2 rounded-full transition-colors ${showSettingsDropdown ? 'bg-[#31343f] text-white' : 'text-gray-400 hover:bg-[#31343f] hover:text-white'}`}
              title="환경 설정"
            >
              <span className="material-symbols-outlined text-[22px]">settings</span>
            </button>
            
            {showSettingsDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-[#1c1f29] border border-[#232C3F] rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-[#232C3F] mb-1">
                  시스템 설정
                </div>
                <button onMouseDown={() => navigate('/camera-setup')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#31343f] hover:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">build</span> 카메라 환경설정
                </button>
                <button onMouseDown={() => navigate('/camera-security')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#31343f] hover:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">security</span> 보안 관리자 포탈
                </button>
                <button onMouseDown={() => navigate('/nvr-storage')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#31343f] hover:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">storage</span> NVR 스토리지
                </button>
                <button onMouseDown={() => navigate('/network-topology')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#31343f] hover:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">hub</span> 네트워크 토폴로지
                </button>
                <button onMouseDown={() => navigate('/system-audit')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#31343f] hover:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">policy</span> 시스템 감사 이력
                </button>
              </div>
            )}
          </div>

          <button className="p-2 text-gray-400 hover:bg-[#31343f] rounded-full transition-colors relative" title="알림">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-2 border-l border-[#232C3F]">
            <div className="w-8 h-8 rounded-full bg-[#31343f] overflow-hidden border border-[#232C3F]">
              <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmXfPZahRP6VpaAbGLqDMMAWeeVj6w0SNfOd1B5sxH4AGDG2jo0c--ohbGnIkfrZQ2eBkK-gcOmf_t_4y9YGvqygbJROvulkcJDrxQoMqXv6SHN4s8ATgzE8mPc3uFcv_h2CW8HtZEx3A_pxR4gh-67dLJ4SYNNlu72mGnaQpgqT47axy9VmOKMg8V5YDlxZFFYvPwoxQBin4SKTxwDWKr88-M7XGZiOX4eEh2MoN9kNSa67BTLBml3Q"/>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="p-2 text-gray-400 hover:bg-[#31343f] hover:text-red-400 rounded-full transition-colors"
              title="로그아웃"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (Layout wrapper for nested routes) */}
      <div className="flex-1 flex overflow-hidden">
        <Outlet />
      </div>
      
    </div>
  );
};

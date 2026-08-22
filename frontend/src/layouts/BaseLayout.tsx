import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEventLogStore } from '../store/useEventLogStore';
import { useAuthStore } from '../store/useAuthStore';

export const BaseLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [isDetachedMode, setIsDetachedMode] = useState(() => {
    return sessionStorage.getItem('vlm_is_detached') === 'true';
  });
  
  const isDetachedWindow = window.name === 'VLM_Detached';
  const { logs, unreadAlertCount, clearUnreadCount } = useEventLogStore();
  const [toast, setToast] = useState<{message: string, level: string, visible: boolean} | null>(null);

  const handleLogout = () => {
    // 1. Force close detached windows
    const bc = new BroadcastChannel('vlm_monitor_b_sync');
    bc.postMessage('force_close_detached');
    bc.close();
    
    // 2. Clear Auth Store
    useAuthStore.getState().logout();
    
    // 3. Clear session storage completely
    sessionStorage.clear();
    
    // 4. Hard refresh to clear all in-memory React/Zustand state
    window.location.href = '/login';
  };

  useEffect(() => {
    if (logs.length > 0) {
      const latestLog = logs[0];
      setToast({ message: latestLog.message, level: latestLog.level, visible: true });
      const timer = setTimeout(() => setToast(prev => prev ? { ...prev, visible: false } : null), 5000);
      return () => clearTimeout(timer);
    }
  }, [logs]);

  useEffect(() => {
    if (isDetachedWindow) return;

    const bc = new BroadcastChannel('vlm_monitor_b_sync');
    
    // Check local storage or similar if we want persistent state, but for now just listen
    bc.onmessage = (event) => {
      if (event.data === 'detach_opened') {
        setIsDetachedMode(true);
        sessionStorage.setItem('vlm_is_detached', 'true');
      }
      if (event.data === 'detach_closed') {
        setIsDetachedMode(false);
        sessionStorage.removeItem('vlm_is_detached');
      }
      if (event.data === 'ping_detach_status') {
        // We only care about receiving detach_opened/closed. 
        // We don't reply here because BaseLayout is never the detached popup (since it doesn't render header in detached mode, but wait, it does run the effect!).
        // The MonitorBLayout in the popup will reply.
      }
    };

    // Query if detached window is already alive
    bc.postMessage('ping_detach_status');

    return () => {
      bc.close();
    };
  }, [isDetachedWindow]);

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

  if (isDetachedWindow) {
    return (
      <div className="flex flex-col h-screen bg-[#0b0e17] text-gray-100 font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          <Outlet />
        </div>
      </div>
    );
  }

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
              className={`h-full px-6 flex items-center justify-center gap-2 font-bold text-[15px] border-b-2 transition-colors ${activeTab === 'A' ? 'border-[#d2bbff] text-[#d2bbff]' : 'border-transparent text-gray-400 hover:text-white hover:bg-[#31343f]/50'}`}
            >
              <span className="material-symbols-outlined text-[20px]">videocam</span>
              실시간 영상
            </button>
            <button 
              onClick={() => navigate('/multi-channel-sync')} 
              className={`h-full px-6 flex items-center justify-center gap-2 font-bold text-[15px] border-b-2 transition-colors ${activeTab === 'PLAYBACK' ? 'border-[#d2bbff] text-[#d2bbff]' : 'border-transparent text-gray-400 hover:text-white hover:bg-[#31343f]/50'}`}
            >
              <span className="material-symbols-outlined text-[20px]">play_circle</span>
              저장영상
            </button>
            <button 
              onClick={() => navigate('/gis-map')}
              className={`h-full px-6 flex items-center justify-center gap-2 font-bold text-[15px] border-b-2 transition-colors ${activeTab === 'DASHBOARD' ? 'border-[#d2bbff] text-[#d2bbff]' : 'border-transparent text-gray-400 hover:text-white hover:bg-[#31343f]/50'}`}
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              대시보드
            </button>
            <button 
              onClick={() => navigate('/monitor-b')}
              className={`h-full px-6 flex items-center justify-center gap-2 font-bold text-[15px] border-b-2 transition-colors ${activeTab === 'B' ? 'border-[#d2bbff] text-[#d2bbff]' : 'border-transparent text-gray-400 hover:text-white hover:bg-[#31343f]/50'}`}
            >
              <span className="material-symbols-outlined text-[20px]">analytics</span>
              VLM 분석
              {isDetachedMode && (
                <span className="material-symbols-outlined text-[16px] text-[#d2bbff]" title="새 창에서 실행 중">open_in_new</span>
              )}
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
              <div className="absolute right-0 mt-2 w-56 bg-[#1c1f29] border border-[#232C3F] rounded-lg shadow-xl py-2 z-50 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-[#232C3F] mb-1">
                  시스템 설정
                </div>
                <button onMouseDown={() => navigate('/camera-list')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#31343f] hover:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">list_alt</span> 카메라 목록 및 그룹 관리
                </button>
                <button onMouseDown={() => navigate('/camera-setup')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#31343f] hover:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">build</span> 카메라 신규 등록
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
                <button onMouseDown={() => navigate('/hw-self-healing')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#31343f] hover:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">healing</span> 자동 복구 시스템
                </button>
                <button onMouseDown={() => navigate('/mass-device-config')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#31343f] hover:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">device_hub</span> 다중 기기 설정
                </button>
                <button onMouseDown={() => navigate('/edge-ai')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#31343f] hover:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">router</span> Edge AI 오케스트레이터
                </button>
                <button onMouseDown={() => navigate('/multi-site-auth')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#31343f] hover:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">lock_person</span> 다중 사이트 인증
                </button>

                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-[#232C3F] mb-1 mt-2">
                  운영 및 제어
                </div>
                <button onMouseDown={() => navigate('/ptz-patrol')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#31343f] hover:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">camera_outdoor</span> PTZ 순찰 스케줄
                </button>
                <button onMouseDown={() => navigate('/ptz-target-handover')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#31343f] hover:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">transfer_within_a_station</span> 타겟 핸드오버
                </button>
                <button onMouseDown={() => navigate('/mobile-patrol')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#31343f] hover:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">smartphone</span> 모바일 순찰 뷰
                </button>
                <button onMouseDown={() => navigate('/ip-audio')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#31343f] hover:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">record_voice_over</span> IP 오디오 방송
                </button>
                <button onMouseDown={() => navigate('/privacy-export')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#31343f] hover:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">privacy_tip</span> 프라이버시 반출
                </button>
              </div>
            )}
          </div>

          <button 
            className="p-2 text-gray-400 hover:bg-[#31343f] rounded-full transition-colors relative" 
            title="알림"
            onClick={clearUnreadCount}
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadAlertCount > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></span>
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
                </span>
              </>
            )}
          </button>
          
          <div className="flex items-center gap-3 pl-2 border-l border-[#232C3F]">
            <div className="w-8 h-8 rounded-full bg-[#31343f] overflow-hidden border border-[#232C3F]">
              <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmXfPZahRP6VpaAbGLqDMMAWeeVj6w0SNfOd1B5sxH4AGDG2jo0c--ohbGnIkfrZQ2eBkK-gcOmf_t_4y9YGvqygbJROvulkcJDrxQoMqXv6SHN4s8ATgzE8mPc3uFcv_h2CW8HtZEx3A_pxR4gh-67dLJ4SYNNlu72mGnaQpgqT47axy9VmOKMg8V5YDlxZFFYvPwoxQBin4SKTxwDWKr88-M7XGZiOX4eEh2MoN9kNSa67BTLBml3Q"/>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:bg-[#31343f] hover:text-red-400 rounded-full transition-colors"
              title="로그아웃"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (Layout wrapper for nested routes) */}
      <div className="flex-1 flex overflow-hidden relative">
        <Outlet />

        {/* Global Toast Notification */}
        {toast && toast.visible && (
          <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-2xl border flex items-center gap-3 transition-all duration-300 ${
            toast.level === 'critical' ? 'bg-danger text-white border-red-900 shadow-[0_0_20px_rgba(239,68,68,0.5)]' :
            toast.level === 'warning' ? 'bg-warning text-white border-yellow-700 shadow-[0_0_20px_rgba(245,158,11,0.5)]' :
            'bg-[#31343f] text-white border-[#232C3F]'
          }`}>
            <span className="material-symbols-outlined text-[24px]">
              {toast.level === 'critical' ? 'error' : toast.level === 'warning' ? 'warning' : 'info'}
            </span>
            <span className="font-bold">{toast.message}</span>
            <button onClick={() => setToast({ ...toast, visible: false })} className="ml-4 opacity-70 hover:opacity-100">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}
      </div>
      
    </div>
  );
};

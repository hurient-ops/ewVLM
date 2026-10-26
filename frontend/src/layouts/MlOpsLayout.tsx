import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export const MlOpsLayout: React.FC = () => {
  const location = useLocation();

  const mlopsScreens = [
    { path: '/mlops/lora-finetuning', name: '폐쇄망 로컬 LoRA 학습', icon: 'model_training', badge: 'LLaMA-Factory' },
    { path: '/mlops/dataset', name: 'Active Learning 데이터셋', icon: 'dataset', badge: '피드백' },
    { path: '/mlops/semantic-vector', name: '시맨틱 벡터 포탈 (t-SNE)', icon: 'hub' },
    { path: '/mlops/prompt-gateway', name: '프롬프트 게이트웨이', icon: 'settings_ethernet' },
    { path: '/mlops/edge-ai', name: 'Edge AI 오케스트레이터', icon: 'router' },
  ];

  return (
    <div className="flex h-full w-full bg-[#0b0e17]">
      {/* AI MLOps Dedicated Sidebar */}
      <aside className="w-[280px] flex-shrink-0 bg-[#121724] border-r border-[#232C3F] flex flex-col h-full z-40">
        <div className="p-4 border-b border-[#232C3F] flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#1e1b4b] flex items-center justify-center border border-[#4338ca]">
            <span className="material-symbols-outlined text-[#818cf8]">precision_manufacturing</span>
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-white whitespace-nowrap">AI MLOps 스튜디오</h2>
            <p className="text-[11px] text-indigo-400 mt-0.5 font-mono">100% 폐쇄망 로컬 학습 센터</p>
          </div>
        </div>

        {/* Offline Badge Card */}
        <div className="m-3 p-3 bg-[#1e1b4b]/30 border border-[#4338ca]/40 rounded-lg flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <div className="flex-1">
            <div className="text-xs font-semibold text-emerald-300">오프라인 모드 활성</div>
            <div className="text-[10px] text-gray-400">LLaMA-Factory 0.9.6 Core</div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">Air-Gapped</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <nav className="flex flex-col gap-1.5">
            {mlopsScreens.map(screen => {
              const isActive = location.pathname === screen.path;
              return (
                <Link
                  key={screen.path}
                  to={screen.path}
                  className={`px-3 py-2.5 text-sm rounded transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-950/80 to-purple-950/60 text-indigo-200 border border-indigo-500/50 font-bold shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                      : 'text-gray-400 hover:bg-[#1a2030] hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-indigo-400' : 'text-gray-500'}`}>
                      {screen.icon}
                    </span>
                    <span>{screen.name}</span>
                  </div>
                  {screen.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#232C3F] text-gray-300 border border-gray-700">
                      {screen.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Hardware Info */}
        <div className="p-3 border-t border-[#232C3F] bg-[#0f131d] text-xs text-gray-400">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-gray-500 font-mono">GPU ENGINE</span>
            <span className="text-emerald-400 font-mono font-semibold">GTX 1660S (4-bit)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-gray-500 font-mono">TARGET MODEL</span>
            <span className="text-gray-300 font-mono text-[11px]">Qwen2-VL 7B (Local)</span>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-auto relative bg-[#0b0e17]">
        <Outlet />
      </main>
    </div>
  );
};

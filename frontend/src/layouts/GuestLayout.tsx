import React from 'react';
import { Outlet } from 'react-router-dom';

export const GuestLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[100px]"></div>
      </div>
      
      <div className="z-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-4 mb-8">
          <img src="/logo.png" alt="ewVLM Logo" className="w-14 h-14 rounded-full border-2 border-primary/50 shadow-[0_0_15px_rgba(210,187,255,0.6)] brightness-125 contrast-110" />
          <h1 className="text-5xl font-bold font-title-lg tracking-tight">ewVLM</h1>
        </div>
        
        <Outlet />
        
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>© 2026 ewVLM-Core Intelligent VMS</p>
          <p>NVIDIA DeepStream & K-AI VLM Hybrid Engine</p>
        </div>
      </div>
    </div>
  );
};

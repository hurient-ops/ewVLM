import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const PtzHandoverConsole: React.FC = () => {
  const navigate = useNavigate();
  const [activeTarget, setActiveTarget] = useState<string | null>('TGT-9923');
  const [cameras, setCameras] = useState([
    { id: 'CAM-01', name: 'Main Gate', isTracking: false },
    { id: 'CAM-02', name: 'Lobby', isTracking: true },
    { id: 'CAM-03', name: 'Corridor A', isTracking: false },
    { id: 'CAM-04', name: 'Parking Lot', isTracking: false },
  ]);

  const handleHandover = (camId: string) => {
    setCameras(cameras.map(c => ({
      ...c,
      isTracking: c.id === camId
    })));
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
      {/* Page Header */}
      <div className="px-6 py-5 border-b border-border-subtle bg-surface flex justify-between items-end shrink-0 z-10">
        <div>
          <div className="text-label-caps font-label-caps text-primary mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">my_location</span> PTZ ?쒖뼱 ?꾨찓??          </div>
          <h1 className="text-[22px] font-headline-md text-on-surface whitespace-nowrap">PTZ ?몃뱶?ㅻ쾭 肄섏넄</h1>
          <p className="text-text-muted mt-1 text-body-sm font-body-sm">?⑥씪 媛앹껜瑜??щ윭 ???PTZ 移대찓?쇰줈 ?곗냽 異붿쟻?섍퀬 ?쒖뼱沅뚯쓣 ?멸퀎?⑸땲??</p>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto flex gap-6 z-10">
        {/* Left Column: Target Map */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex-1 bg-surface border border-border-subtle rounded-lg p-4 flex flex-col relative overflow-hidden shadow-sm">
            <div className="flex justify-between items-center mb-4 z-10">
              <h2 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">radar</span>
                ?ㅼ떆媛?沅ㅼ쟻 留?              </h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
                <span className="text-mono-data font-mono-data text-xs text-text-muted">Tracking Active</span>
              </div>
            </div>
            
            {/* Interactive SVG Floor Plan / Map Area */}
            <div className="flex-1 bg-black border border-border-subtle rounded relative overflow-hidden flex items-center justify-center">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              <svg className="w-full h-full absolute inset-0 z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Structural Walls / Environment */}
                <path d="M 10 10 L 90 10 L 90 90 L 10 90 Z" fill="none" stroke="#333" strokeWidth="0.5" />
                <path d="M 30 10 L 30 40 M 70 10 L 70 50 M 10 60 L 50 60 M 70 70 L 90 70" fill="none" stroke="#444" strokeWidth="1.5" />
                
                {/* Camera FOV Cones */}
                {cameras.map((cam, idx) => {
                  const positions = [
                    { x: 20, y: 20, angle: 45 },
                    { x: 60, y: 40, angle: 135 },
                    { x: 30, y: 70, angle: 315 },
                    { x: 80, y: 60, angle: 225 }
                  ];
                  const pos = positions[idx];
                  const isTracking = cam.id === (cameras.find(c => c.isTracking)?.id);
                  
                  // Calculate cone path (simple wedge)
                  const fov = 40; // FOV angle in degrees
                  const distance = isTracking ? 35 : 25; // How far the cone reaches
                  
                  // Convert angles to radians for math
                  const radStart = (pos.angle - fov / 2) * (Math.PI / 180);
                  const radEnd = (pos.angle + fov / 2) * (Math.PI / 180);
                  
                  const p1x = pos.x + distance * Math.cos(radStart);
                  const p1y = pos.y + distance * Math.sin(radStart);
                  const p2x = pos.x + distance * Math.cos(radEnd);
                  const p2y = pos.y + distance * Math.sin(radEnd);
                  
                  const pathData = `M ${pos.x} ${pos.y} L ${p1x} ${p1y} A ${distance} ${distance} 0 0 1 ${p2x} ${p2y} Z`;

                  return (
                    <g key={`fov-${cam.id}`} style={{ transition: 'all 0.5s ease-in-out' }}>
                      <path 
                        d={pathData} 
                        fill={isTracking ? 'url(#trackingGradient)' : 'rgba(255, 255, 255, 0.03)'} 
                        stroke={isTracking ? '#00f2fe' : '#555'} 
                        strokeWidth="0.2"
                        opacity={isTracking ? "0.6" : "0.3"}
                      />
                    </g>
                  );
                })}
                
                {/* Tracking Target Line */}
                {cameras.map((cam, idx) => {
                  const positions = [
                    { x: 20, y: 20 },
                    { x: 60, y: 40 },
                    { x: 30, y: 70 },
                    { x: 80, y: 60 }
                  ];
                  const pos = positions[idx];
                  if (cam.isTracking) {
                    return (
                      <line 
                        key={`line-${cam.id}`}
                        x1={pos.x} y1={pos.y} 
                        x2="55" y2="45" 
                        stroke="#EF4444" 
                        strokeWidth="0.3" 
                        strokeDasharray="1,1" 
                        className="animate-pulse"
                      />
                    );
                  }
                  return null;
                })}

                {/* SVG Definitions */}
                <defs>
                  <radialGradient id="trackingGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
              
              {/* Target Blip */}
              <div className="absolute top-[45%] left-[55%] flex flex-col items-center z-20">
                <div className="w-4 h-4 bg-danger rounded-full animate-ping absolute"></div>
                <div className="w-3 h-3 bg-danger rounded-full relative z-10 border border-white"></div>
                <div className="mt-1 bg-surface-container/80 backdrop-blur px-2 py-0.5 rounded border border-danger/30 text-mono-data font-mono-data text-[10px] text-danger font-bold">
                  {activeTarget}
                </div>
              </div>

              {/* Camera Markers on HTML layer for nice styling */}
              {cameras.map((cam, idx) => {
                const positions = [
                  { top: '20%', left: '20%' },
                  { top: '40%', left: '60%' },
                  { top: '70%', left: '30%' },
                  { top: '60%', left: '80%' }
                ];
                return (
                  <div key={`marker-${cam.id}`} className="absolute flex flex-col items-center z-20" style={{ top: positions[idx].top, left: positions[idx].left, transform: 'translate(-50%, -50%)' }}>
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors cursor-pointer hover:scale-110
                        ${cam.isTracking ? 'bg-primary border-primary text-on-primary shadow-[0_0_15px_rgba(0,242,254,0.6)]' : 'bg-surface-container-highest border-border-subtle text-text-muted'}
                      `}
                      onClick={() => handleHandover(cam.id)}
                    >
                      <span className="material-symbols-outlined text-[14px]">videocam</span>
                    </div>
                    <span className="mt-1 text-mono-data font-mono-data text-[10px] text-on-surface bg-surface-container/90 px-1.5 py-0.5 rounded border border-border-subtle whitespace-nowrap">
                      {cam.id}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Camera Feeds & Handover Control */}
        <div className="w-96 flex flex-col gap-6">
          <div className="bg-surface border border-border-subtle rounded-lg flex flex-col overflow-hidden h-[300px]">
             <div className="p-3 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
               <span className="text-title-sm font-title-sm text-on-surface">?꾩옱 異붿쟻 ?붾㈃</span>
               <span className="text-mono-data font-mono-data text-[10px] bg-primary text-on-primary px-2 py-0.5 rounded">LOCK-ON</span>
             </div>
             <div className="flex-1 relative bg-black">
                <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD4SEbi8Lygn02Z88X6mtD1HAHuf_3NcNxHPgYmsRd9n_y-fDSnhjKsiq8xViD6-jfibHOHCgN02lyOmP-Wq6YzdKyDg4G2OX42HWg8Tbb_zA7sWdVfFQmwZ4BL8_gntjC_vt0ol7wK_8NyTuCruZ8l0jvAJYVitOx0c9f6sWMHncQc52XQ0CdsyTB0rC2EI1g3iwPKFqJBl7HRKVLVhgnSxsFklkKEuTOi3wAE9YCWVLGIFF1rXBIv0A')" }}></div>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-[30%] left-[40%] w-[100px] h-[180px] border-[2px] border-primary bg-primary/10">
                    <div className="absolute -top-[20px] left-[-2px] bg-primary text-on-primary px-1 text-[10px] font-mono-data h-[20px] flex items-center"> {activeTarget} </div>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-surface border border-border-subtle rounded-lg flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-border-subtle">
              <h3 className="text-title-sm font-title-sm text-on-surface">?몄젒 移대찓???몃뱶?ㅻ쾭</h3>
              <p className="text-xs text-text-muted mt-1">異붿쟻 沅뚰븳???섍만 移대찓?쇰? ?좏깮?섏꽭??</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {cameras.map(cam => (
                <div key={cam.id} className={`p-3 rounded border flex items-center justify-between transition-colors ${cam.isTracking ? 'bg-primary/10 border-primary' : 'bg-surface-container border-border-subtle hover:border-primary/50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${cam.isTracking ? 'text-primary' : 'text-text-muted'}`}>videocam</span>
                    <div>
                      <div className="text-body-sm font-bold text-on-surface">{cam.name}</div>
                      <div className="text-mono-data text-[10px] text-text-muted">{cam.id}</div>
                    </div>
                  </div>
                  {!cam.isTracking ? (
                    <button onClick={() => handleHandover(cam.id)} className="bg-surface border border-border-subtle hover:bg-primary hover:text-on-primary hover:border-primary text-xs px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1">
                      ?멸퀎 <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  ) : (
                    <span className="text-xs text-primary font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> ?쒖꽦
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

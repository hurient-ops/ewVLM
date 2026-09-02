import React, { useState, useEffect } from 'react';
import { usePtzStore } from '../store/usePtzStore';

export const PtzTourScheduler: React.FC = () => {
  const { schedules, fetchSchedules } = usePtzStore();
  const [activeTour, setActiveTour] = useState<number | null>(null);
  
  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Fallback UI presets for visual demo if not connected to real camera
  const presets = [
    { id: 'P1', name: '정문 진입로', pan: 45.2, tilt: -10.5, zoom: 2.0 },
    { id: 'P2', name: '주차장 A구역', pan: 120.0, tilt: -15.0, zoom: 1.5 },
    { id: 'P3', name: '자재 창고 입구', pan: -45.0, tilt: -5.0, zoom: 3.0 },
    { id: 'P4', name: '서측 펜스 1', pan: -90.0, tilt: 0.0, zoom: 1.0 },
    { id: 'P5', name: '동측 펜스 2', pan: 90.0, tilt: 5.0, zoom: 1.0 },
  ];

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
      <div className="px-6 py-5 border-b border-border-subtle bg-surface flex justify-between items-end shrink-0 z-10">
        <div>
          <div className="text-label-caps font-label-caps text-primary mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">schedule</span> PTZ 제어 도메인
          </div>
          <h1 className="text-[22px] font-headline-md text-on-surface whitespace-nowrap">PTZ 자율 순찰 스케줄러</h1>
          <p className="text-text-muted mt-1 text-body-sm font-body-sm">시간대별로 카메라의 프리셋 위치를 자동으로 순회하도록 설정합니다.</p>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto flex gap-6 z-10">
        {/* Left: Tours List */}
        <div className="w-1/3 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-title-sm font-title-sm text-on-surface">순찰 투어 목록</h2>
            <button className="text-primary hover:text-primary/80 transition-colors">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {schedules.map(tour => (
              <div 
                key={tour.id} 
                onClick={() => setActiveTour(tour.id!)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${activeTour === tour.id ? 'bg-primary/10 border-primary shadow-sm' : 'bg-surface border-border-subtle hover:border-primary/50'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-body-base font-bold text-on-surface">{tour.name}</h3>
                  {tour.is_active === 1 ? (
                    <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded border border-success/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span> 동작중
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-text-muted bg-surface-container-highest px-2 py-0.5 rounded border border-border-subtle">
                      대기
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-muted mb-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">history_toggle_off</span> Camera: {tour.camera_id}
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex-1 bg-surface-container hover:bg-surface-container-highest border border-border-subtle text-xs py-1.5 rounded transition-colors">
                    설정 편집
                  </button>
                  <button className={`flex-1 text-xs py-1.5 rounded font-bold transition-colors ${tour.is_active === 1 ? 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20' : 'bg-primary text-on-primary hover:bg-primary/90'}`}>
                    {tour.is_active === 1 ? '중지' : '시작'}
                  </button>
                </div>
              </div>
            ))}
            {schedules.length === 0 && (
              <div className="text-center text-text-muted text-sm py-8 border border-dashed border-border-subtle rounded-lg">
                등록된 스케줄이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Right: Preset Timeline */}
        <div className="flex-1 flex flex-col gap-4">
           <div className="flex justify-between items-center">
            <h2 className="text-title-sm font-title-sm text-on-surface">투어 시퀀스: {activeTour ? schedules.find(t => t.id === activeTour)?.name : '선택 안됨'}</h2>
          </div>
          
          {activeTour ? (
            <div className="bg-surface border border-border-subtle rounded-lg p-6 flex-1 flex flex-col">
              {/* Visual Sequence */}
              <div className="relative mb-8 pt-8">
                <div className="absolute top-[48px] left-10 right-10 h-1 bg-border-subtle -z-10"></div>
                <div className="flex justify-between">
                  {['P1', 'P3', 'P5', 'P1'].map((p, idx) => (
                    <div key={idx} className="flex flex-col items-center group">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${idx === 1 && schedules.find(t=>t.id === activeTour)?.is_active === 1 ? 'bg-primary text-on-primary border-primary ring-4 ring-primary/20' : 'bg-surface text-text-muted border-border-subtle group-hover:border-primary/50'}`}>
                        {p}
                      </div>
                      <div className="text-[10px] text-text-muted mt-2 bg-surface-container px-2 py-1 rounded">15 sec</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Presets Library */}
              <h3 className="text-label-caps font-label-caps text-text-muted mb-3">사용 가능한 프리셋</h3>
              <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2">
                {presets.map(p => (
                  <div key={p.id} className="bg-surface-container-lowest border border-border-subtle rounded p-3 flex items-center justify-between group hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-surface-container-highest rounded text-mono-data font-bold text-xs flex items-center justify-center text-on-surface">
                        {p.id}
                      </div>
                      <div>
                        <div className="text-body-sm font-bold text-on-surface">{p.name}</div>
                        <div className="text-mono-data text-[10px] text-text-muted mt-0.5">
                          P: {p.pan}° / T: {p.tilt}° / Z: {p.zoom}x
                        </div>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 text-primary hover:text-primary/80 transition-opacity">
                      <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-surface border border-dashed border-border-subtle rounded-lg flex flex-col items-center justify-center text-text-muted">
              <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">route</span>
              <p className="text-body-sm">좌측에서 투어를 선택하거나 새 투어를 생성하세요.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

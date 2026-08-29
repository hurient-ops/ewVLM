import React from 'react';

export const NvrDashboardHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-end pb-2 border-b border-border-subtle">
      <div>
        <h1 className="text-headline-md lg:text-[28px] font-display-lg text-primary whitespace-nowrap overflow-hidden text-ellipsis">NVR 스토리지 및 하드웨어 상태 검수 대시보드</h1>
        <p className="text-body-base font-body-base text-text-muted mt-1">스토리지 및 녹화 서버 상태 모니터링</p>
      </div>
      <div className="flex items-center gap-4 text-mono-data font-mono-data">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-tertiary led-safe"></div>
          <span className="text-tertiary">시스템 정상</span>
        </div>
        <div className="px-2 py-1 bg-surface-variant rounded border border-border-subtle"> 가동 시간: 94일 14시간 22분 </div>
      </div>
    </div>
  );
};

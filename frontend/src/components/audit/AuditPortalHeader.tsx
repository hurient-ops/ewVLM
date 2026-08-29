import React from 'react';

export const AuditPortalHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-end border-b border-border-subtle pb-4">
      <div>
        <h2 className="text-display-lg font-display-lg text-on-surface mb-1">암호학적 시스템 로그 위변조 방지 감사 이력 포탈</h2>
        <p className="text-body-base font-body-base text-text-muted">VSS 쿼리 및 접속 기록을 위한 불변 원장. SHA-256 실링으로 보호됨.</p>
      </div>
      <div className="flex gap-2">
        <div className="bg-surface border border-border-subtle rounded-DEFAULT px-3 py-1.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_4px_rgba(78,222,163,0.8)]"></span>
          <span className="text-mono-data font-mono-data text-on-surface">노드: 동기화됨</span>
        </div>
        <button className="bg-surface border border-border-subtle rounded-DEFAULT px-3 py-1.5 flex items-center gap-2 text-mono-data font-mono-data text-on-surface hover:border-primary transition-colors">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>download</span> 로그 내보내기 
        </button>
      </div>
    </div>
  );
};

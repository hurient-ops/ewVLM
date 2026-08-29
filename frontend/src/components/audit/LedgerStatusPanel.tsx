import React from 'react';
import { AuditLog } from './types';

interface Props {
  logs: AuditLog[];
}

export const LedgerStatusPanel: React.FC<Props> = ({ logs }) => {
  return (
    <div className="col-span-12 lg:col-span-3 row-span-2 bg-surface border border-border-subtle rounded-lg p-4 flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
        <h3 className="text-title-sm font-title-sm text-on-surface">원장 상태</h3>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-label-caps font-label-caps text-text-muted mb-1">최신 블록</p>
          <p className="text-mono-data font-mono-data text-on-surface text-lg">#{8942105 + logs.length}</p>
        </div>
        <div>
          <p className="text-label-caps font-label-caps text-text-muted mb-1">네트워크 해시 레이트</p>
          <p className="text-mono-data font-mono-data text-primary">45.2 TH/s</p>
        </div>
        <div>
          <p className="text-label-caps font-label-caps text-text-muted mb-1">최종 실링</p>
          <p className="text-mono-data font-mono-data text-on-surface">{logs.length > 0 ? new Date(logs[0].timestamp).toLocaleTimeString() : '대기중'}</p>
        </div>
      </div>
    </div>
  );
};

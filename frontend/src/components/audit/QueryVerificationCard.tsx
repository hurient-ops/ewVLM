import React from 'react';
import { AuditLog } from './types';

interface Props {
  logs: AuditLog[];
}

export const QueryVerificationCard: React.FC<Props> = ({ logs }) => {
  return (
    <div className="col-span-12 lg:col-span-9 row-span-2 bg-surface border border-border-subtle rounded-lg p-4 flex flex-col relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#7c3aed 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>
      <div className="relative z-10 flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          <h3 className="text-title-sm font-title-sm text-on-surface">실시간 쿼리 검증</h3>
        </div>
        <span className="text-osd-label font-osd-label bg-surface-container px-2 py-1 rounded-DEFAULT border border-border-subtle text-text-muted">SHA-256</span>
      </div>
      <div className="relative z-10 flex-1 flex flex-col justify-center gap-3">
        <div className="bg-surface-container-lowest p-3 rounded-DEFAULT border border-border-subtle flex flex-col gap-1">
          <span className="text-label-caps font-label-caps text-text-muted">자연어 쿼리</span>
          <code className="text-mono-data font-mono-data text-on-surface">"Show me all red sedans passing Sector 4 between 22:00 and 23:00 yesterday."</code>
        </div>
        <div className="flex items-center gap-2 pl-4">
          <span className="material-symbols-outlined text-text-muted text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_downward</span>
        </div>
        <div className="bg-surface-container-lowest p-3 rounded-DEFAULT border border-primary/30 flex flex-col gap-1 relative overflow-hidden group">
          <div className="absolute left-0 top-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-label-caps font-label-caps text-primary flex items-center gap-2"> 해시 서명 <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          </span>
          <code className="text-mono-data font-mono-data text-on-surface break-all text-xs opacity-80">
            {logs.length > 0 ? logs[0].tx_hash : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
          </code>
        </div>
      </div>
    </div>
  );
};

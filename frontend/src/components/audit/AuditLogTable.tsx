import React from 'react';
import { AuditLog } from './types';

interface Props {
  logs: AuditLog[];
}

export const AuditLogTable: React.FC<Props> = ({ logs }) => {
  return (
    <div className="col-span-12 row-span-4 bg-surface border border-border-subtle rounded-lg flex flex-col overflow-hidden">
      <div className="p-3 border-b border-border-subtle flex justify-between items-center bg-surface-container-low">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>list_alt</span>
          <h3 className="text-title-sm font-title-sm text-on-surface">불변 감사 로그</h3>
        </div>
        <div className="flex gap-2">
          <input className="bg-background border border-border-subtle rounded-DEFAULT px-2 py-1 text-mono-data font-mono-data text-on-surface text-xs focus:border-primary focus:outline-none w-48" placeholder="사용자 또는 TxID로 필터링..." type="text"/>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-surface-container-lowest border-b border-border-subtle z-10">
            <tr>
              <th className="p-2 text-label-caps font-label-caps text-text-muted">타임스탬프</th>
              <th className="p-2 text-label-caps font-label-caps text-text-muted">사용자 / ID</th>
              <th className="p-2 text-label-caps font-label-caps text-text-muted">작업 유형</th>
              <th className="p-2 text-label-caps font-label-caps text-text-muted">리소스 / 쿼리</th>
              <th className="p-2 text-label-caps font-label-caps text-text-muted">TX 해시</th>
              <th className="p-2 text-label-caps font-label-caps text-text-muted">상태</th>
            </tr>
          </thead>
          <tbody className="text-mono-data font-mono-data text-on-surface">
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-border-subtle hover:bg-surface-container-highest transition-colors">
                <td className="p-2 whitespace-nowrap text-text-muted">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-2">{log.username}</td>
                <td className="p-2"><span className="bg-surface-container px-1.5 py-0.5 rounded-DEFAULT border border-border-subtle text-primary">{log.action_type}</span></td>
                <td className="p-2 truncate max-w-[200px]" title={log.resource_query}>{log.resource_query}</td>
                <td className="p-2 truncate max-w-[150px] text-text-muted font-mono" title={log.tx_hash}>{log.tx_hash.substring(0, 10)}...</td>
                <td className="p-2">
                  <div className="flex items-center gap-1 text-tertiary">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> {log.status} 
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

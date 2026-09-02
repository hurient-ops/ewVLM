import React, { useState, useEffect } from 'react';
import { API } from '../api/client';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  ip: string;
  status: string;
}

export const SystemAuditLogPortal: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await API.getAuditLogs(50);
        if (response.status === 'SUCCESS' && response.logs) {
          const mappedLogs = response.logs.map((log: any) => ({
            id: String(log.id),
            timestamp: log.timestamp,
            user: log.username,
            action: log.action_type,
            target: log.resource_query || 'System',
            ip: log.tx_hash || 'localhost',
            status: log.status || 'SUCCESS'
          }));
          setLogs(mappedLogs);
        } else {
          setLogs([]);
        }
      } catch (err) {
        console.error(err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = filterAction === 'ALL' ? logs : logs.filter(l => l.action.includes(filterAction));

  return (
    <main className="flex-1 p-container-padding bg-[#070A13] flex flex-col relative h-full">
      <div className="flex justify-between items-end mb-4 shrink-0">
        <div>
          <h1 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#d2bbff]">policy</span> 시스템 감사 이력
          </h1>
          <p className="text-body-base font-body-base text-text-muted mt-1">시스템 조작, 로그인, 권한 변경 등에 대한 감사 추적 로그를 열람합니다.</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="bg-surface-container border border-border-subtle text-on-surface p-2 rounded"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="ALL">모든 액션</option>
            <option value="LOGIN">로그인</option>
            <option value="PTZ">PTZ 제어</option>
            <option value="EXPORT">영상 반출</option>
            <option value="DISPATCH">알람 디스패치</option>
            <option value="ROLE_UPDATE">권한 변경</option>
          </select>
          <button className="px-4 py-2 bg-surface-container border border-border-subtle rounded hover:bg-surface-variant transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">download</span> CSV 다운로드
          </button>
        </div>
      </div>

      <div className="flex-1 bg-surface border border-border-subtle rounded-lg overflow-hidden flex flex-col">
        <div className="grid grid-cols-7 gap-4 p-3 bg-surface-container-low border-b border-border-subtle font-bold text-label-caps text-on-surface">
          <div className="col-span-1">ID</div>
          <div className="col-span-1">시간</div>
          <div className="col-span-1">사용자</div>
          <div className="col-span-1">IP 주소</div>
          <div className="col-span-1">액션</div>
          <div className="col-span-1">대상</div>
          <div className="col-span-1 text-center">결과</div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {loading ? (
            <div className="h-full flex items-center justify-center text-text-muted">
              <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
            </div>
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map(log => (
              <div key={log.id} className="grid grid-cols-7 gap-4 p-3 border-b border-border-subtle hover:bg-surface-container transition-colors items-center text-body-sm font-mono-data">
                <div className="col-span-1 text-text-muted">{log.id}</div>
                <div className="col-span-1 text-primary">{new Date(log.timestamp).toLocaleString()}</div>
                <div className="col-span-1 text-on-surface-variant font-bold">{log.user}</div>
                <div className="col-span-1 text-text-muted">{log.ip}</div>
                <div className="col-span-1 text-tertiary">{log.action}</div>
                <div className="col-span-1 text-on-surface-variant truncate" title={log.target}>{log.target}</div>
                <div className="col-span-1 flex justify-center">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${log.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400' : log.status === 'FAILED' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-text-muted">
              조건에 일치하는 로그가 없습니다.
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

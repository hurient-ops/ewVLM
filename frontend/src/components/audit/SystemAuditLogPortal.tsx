import React, { useEffect, useState } from 'react';
import { API } from '../../api/client';
import { AuditLog } from './types';
import { AuditPortalHeader } from './AuditPortalHeader';
import { LedgerStatusPanel } from './LedgerStatusPanel';
import { QueryVerificationCard } from './QueryVerificationCard';
import { AuditLogTable } from './AuditLogTable';

export const SystemAuditLogPortal: React.FC = () => { 
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    API.getAuditLogs().then(logs => {
      setLogs(logs);
    }).catch(err => console.error("Failed to fetch audit logs", err));
  }, []);

  return ( 
    <main className="flex-1 flex flex-col overflow-hidden bg-background p-container-padding gap-4">
      <AuditPortalHeader />
      <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-4 overflow-hidden">
        <LedgerStatusPanel logs={logs} />
        <QueryVerificationCard logs={logs} />
        <AuditLogTable logs={logs} />
      </div>
    </main>
  );
};

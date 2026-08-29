import React from 'react';
import { NvrDashboardHeader } from './NvrDashboardHeader';
import { ServerNodeList } from './ServerNodeList';
import { StorageVolumeStatus } from './StorageVolumeStatus';
import { ResourceUtilization } from './ResourceUtilization';

export const NvrStorageDashboard: React.FC = () => { 
  return (
    <main className="flex-1 p-container-padding flex flex-col gap-4 overflow-hidden relative">
      <NvrDashboardHeader />
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        <ServerNodeList />
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 min-h-0">
          <StorageVolumeStatus />
          <ResourceUtilization />
        </div>
      </div>
    </main>
  );
};

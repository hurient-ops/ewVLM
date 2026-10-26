import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { initWebSocket } from './api/client';
import Login from './components/Login';
import Signup from './components/Signup';

// Layouts
import { BaseLayout } from './layouts/BaseLayout';
import { MonitorBLayout } from './layouts/MonitorBLayout';
import { MlOpsLayout } from './layouts/MlOpsLayout';
import { GuestLayout } from './layouts/GuestLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Monitor A Group
import { MonitorALiveControl } from './components/MonitorALiveControl';
import { PtzPatrolSchedule } from './components/PtzPatrolSchedule';
import { PtzTargetHandover } from './components/PtzTargetHandover';
import { MobilePatrolApp } from './components/MobilePatrolApp';
import { IpAudioBroadcastConsole } from './components/IpAudioBroadcastConsole';
import { HardwareSelfHealingShell } from './components/HardwareSelfHealingShell';
import { MassDeviceConfigClone } from './components/MassDeviceConfigClone';
import { EdgeAiOrchestration } from './components/EdgeAiOrchestration';
import { PrivacyExportWorkshop } from './components/PrivacyExportWorkshop';
import { AlertCenterDashboard } from './components/AlertCenterDashboard';

// Monitor B Group (VLM Investigation & War Room)
import { MonitorBVlmAnalysis } from './components/MonitorBVlmAnalysis';
import { EventReviewCenter } from './components/EventReviewCenter';
import { DisasterVirtualWarRoom } from './components/DisasterVirtualWarRoom';
import { RealtimeBiDashboard } from './components/RealtimeBiDashboard';
import { VssSemanticSearch } from './components/VssSemanticSearch';
import { NaturalLanguageRuleCopilot } from './components/NaturalLanguageRuleCopilot';

// AI MLOps Group (Dedicated Air-Gapped Training Center)
import { LoraFinetuningConsole } from './components/LoraFinetuningConsole';
import { DatasetManagementPortal } from './components/DatasetManagementPortal';
import { SemanticVectorPortal } from './components/SemanticVectorPortal';
import { PromptGatewayDeploy } from './components/PromptGatewayDeploy';

// Common / Misc
import { GisSmartMap } from './components/gis/GisSmartMap';
import { MultiChannelSyncPlayback } from './components/MultiChannelSyncPlayback';

// Settings Group
import { CameraSecurityPortal } from './components/CameraSecurityPortal';
import { CameraSetupConfig } from './components/CameraSetupConfig';
import { CameraListManager } from './components/CameraListManager';
import { GeometryCalibrationConsole } from './components/GeometryCalibrationConsole';
import { NetworkTopologyMonitor } from './components/NetworkTopologyMonitor';
import { NvrStorageDashboard } from './components/nvr/NvrStorageDashboard';
import { MultiSiteAuthMatrix } from './components/MultiSiteAuthMatrix';
import { SystemAuditLogPortal } from './components/SystemAuditLogPortal';


export default function App() {

  useEffect(() => {
    initWebSocket();

    // 부모 창(Monitor A)이 닫히거나 새로고침될 때 분리된 창(Monitor B)도 함께 강제 종료
    const handleBeforeUnload = () => {
      const bc = new BroadcastChannel('vlm_monitor_b_sync');
      bc.postMessage('force_close_detached');
      bc.close();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Guest Routes */}
        <Route element={<GuestLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Base Layout containing the Top Nav Header */}
          <Route path="/" element={<BaseLayout />}>
            <Route index element={<Navigate to="/monitor-a" replace />} />
          
          {/* ----- 1. Monitor A Domain (Realtime Surveillance) ----- */}
          <Route path="/monitor-a" element={<MonitorALiveControl />} />
          <Route path="/ptz-patrol" element={<PtzPatrolSchedule />} />
          <Route path="/ptz-target-handover" element={<PtzTargetHandover />} />
          <Route path="/mobile-patrol" element={<MobilePatrolApp />} />
          <Route path="/ip-audio" element={<IpAudioBroadcastConsole />} />
          <Route path="/hw-self-healing" element={<HardwareSelfHealingShell />} />
          <Route path="/mass-device-config" element={<MassDeviceConfigClone />} />
          <Route path="/privacy-export" element={<PrivacyExportWorkshop />} />
          <Route path="/alert-center" element={<AlertCenterDashboard />} />
          
          {/* ----- 2. Monitor B Domain (VLM Investigation & War Room) ----- */}
          <Route element={<MonitorBLayout />}>
            <Route path="/monitor-b" element={<MonitorBVlmAnalysis />} />
            <Route path="/event-review" element={<EventReviewCenter />} />
            <Route path="/disaster-war-room" element={<DisasterVirtualWarRoom />} />
            <Route path="/realtime-bi" element={<RealtimeBiDashboard />} />
            <Route path="/vss-semantic-search" element={<VssSemanticSearch />} />
            <Route path="/nl-rule-copilot" element={<NaturalLanguageRuleCopilot />} />
          </Route>

          {/* ----- 3. AI MLOps Domain (Air-Gapped Local In-House Training) ----- */}
          <Route element={<MlOpsLayout />}>
            <Route path="/mlops" element={<Navigate to="/mlops/lora-finetuning" replace />} />
            <Route path="/mlops/lora-finetuning" element={<LoraFinetuningConsole />} />
            <Route path="/mlops/dataset" element={<DatasetManagementPortal />} />
            <Route path="/mlops/semantic-vector" element={<SemanticVectorPortal />} />
            <Route path="/mlops/prompt-gateway" element={<PromptGatewayDeploy />} />
            <Route path="/mlops/edge-ai" element={<EdgeAiOrchestration />} />
          </Route>

          {/* Legacy Route Redirects for Compatibility */}
          <Route path="/lora-finetuning" element={<Navigate to="/mlops/lora-finetuning" replace />} />
          <Route path="/semantic-vector" element={<Navigate to="/mlops/semantic-vector" replace />} />
          <Route path="/prompt-gateway" element={<Navigate to="/mlops/prompt-gateway" replace />} />
          <Route path="/edge-ai" element={<Navigate to="/mlops/edge-ai" replace />} />


          {/* ----- Common / Playback ----- */}
          <Route path="/gis-map" element={<GisSmartMap />} />
          <Route path="/multi-channel-sync" element={<MultiChannelSyncPlayback />} />

          {/* ----- Settings / System ----- */}
          <Route path="/camera-security" element={<CameraSecurityPortal />} />
          <Route path="/camera-setup" element={<CameraSetupConfig />} />
          <Route path="/camera-list" element={<CameraListManager />} />
          <Route path="/geometry-calib" element={<GeometryCalibrationConsole />} />
          <Route path="/network-topology" element={<NetworkTopologyMonitor />} />
          <Route path="/nvr-storage" element={<NvrStorageDashboard />} />
          <Route path="/multi-site-auth" element={<MultiSiteAuthMatrix />} />
          <Route path="/system-audit" element={<SystemAuditLogPortal />} />

        </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

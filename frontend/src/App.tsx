import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { initWebSocket } from './api/client';
import { useEventSimulator } from './hooks/useEventSimulator';
import Login from './components/Login';
import Signup from './components/Signup';

// Layouts
import { BaseLayout } from './layouts/BaseLayout';
import { MonitorBLayout } from './layouts/MonitorBLayout';

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

// Monitor B Group
import { MonitorBVlmAnalysis } from './components/MonitorBVlmAnalysis';
import { EventReviewCenter } from './components/EventReviewCenter';
import { DisasterVirtualWarRoom } from './components/DisasterVirtualWarRoom';
import { RealtimeBiDashboard } from './components/RealtimeBiDashboard';
import { VssSemanticSearch } from './components/VssSemanticSearch';
import { NaturalLanguageRuleCopilot } from './components/NaturalLanguageRuleCopilot';
import { SemanticVectorPortal } from './components/SemanticVectorPortal';
import { PromptGatewayDeploy } from './components/PromptGatewayDeploy';
import { LoraFinetuningConsole } from './components/LoraFinetuningConsole';

// Common / Misc
import { GisSmartMap } from './components/GisSmartMap';
import { MultiChannelSyncPlayback } from './components/MultiChannelSyncPlayback';

// Settings Group
import { CameraSecurityPortal } from './components/CameraSecurityPortal';
import { CameraSetupConfig } from './components/CameraSetupConfig';
import { GeometryCalibrationConsole } from './components/GeometryCalibrationConsole';
import { NetworkTopologyMonitor } from './components/NetworkTopologyMonitor';
import { NvrStorageDashboard } from './components/NvrStorageDashboard';
import { MultiSiteAuthMatrix } from './components/MultiSiteAuthMatrix';
import { SystemAuditLogPortal } from './components/SystemAuditLogPortal';


export default function App() {
  const { currentView, setCurrentView } = useAuthStore();

  useEffect(() => {
    initWebSocket();
  }, []);

  // 15초 단위로 랜덤 VLM 이벤트 자동 발생 시뮬레이터 시작 (주석 처리하여 중지)
  // useEventSimulator(15000);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={() => { window.location.href='/monitor-a' }} onNavigateSignup={() => { window.location.href='/signup' }} />} />
        <Route path="/signup" element={<Signup onSignupSuccess={() => { window.location.href='/monitor-a' }} onBackToLogin={() => { window.location.href='/login' }} />} />
        
        {/* Base Layout containing the Top Nav Header */}
        <Route path="/" element={<BaseLayout />}>
          <Route index element={<Navigate to="/monitor-a" replace />} />
          
          {/* ----- Monitor A Domain ----- */}
          <Route path="/monitor-a" element={<MonitorALiveControl />} />
          <Route path="/ptz-patrol" element={<PtzPatrolSchedule />} />
          <Route path="/ptz-target-handover" element={<PtzTargetHandover />} />
          <Route path="/mobile-patrol" element={<MobilePatrolApp />} />
          <Route path="/ip-audio" element={<IpAudioBroadcastConsole />} />
          <Route path="/hw-self-healing" element={<HardwareSelfHealingShell />} />
          <Route path="/mass-device-config" element={<MassDeviceConfigClone />} />
          <Route path="/edge-ai" element={<EdgeAiOrchestration />} />
          <Route path="/privacy-export" element={<PrivacyExportWorkshop />} />

          {/* ----- Monitor B Domain (Uses specific Layout for Sidebar) ----- */}
          <Route element={<MonitorBLayout />}>
            <Route path="/monitor-b" element={<MonitorBVlmAnalysis />} />
            <Route path="/event-review" element={<EventReviewCenter />} />
            <Route path="/disaster-war-room" element={<DisasterVirtualWarRoom />} />
            <Route path="/realtime-bi" element={<RealtimeBiDashboard />} />
            <Route path="/vss-semantic-search" element={<VssSemanticSearch />} />
            <Route path="/nl-rule-copilot" element={<NaturalLanguageRuleCopilot />} />
            <Route path="/semantic-vector" element={<SemanticVectorPortal />} />
            <Route path="/prompt-gateway" element={<PromptGatewayDeploy />} />
            <Route path="/lora-finetuning" element={<LoraFinetuningConsole />} />
          </Route>

          {/* ----- Common / Playback ----- */}
          <Route path="/gis-map" element={<GisSmartMap />} />
          <Route path="/multi-channel-sync" element={<MultiChannelSyncPlayback />} />

          {/* ----- Settings / System ----- */}
          <Route path="/camera-security" element={<CameraSecurityPortal />} />
          <Route path="/camera-setup" element={<CameraSetupConfig />} />
          <Route path="/geometry-calib" element={<GeometryCalibrationConsole />} />
          <Route path="/network-topology" element={<NetworkTopologyMonitor />} />
          <Route path="/nvr-storage" element={<NvrStorageDashboard />} />
          <Route path="/multi-site-auth" element={<MultiSiteAuthMatrix />} />
          <Route path="/system-audit" element={<SystemAuditLogPortal />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import React, { useState } from 'react';

export const DisasterVirtualWarRoom: React.FC = () => {
  const [isEscalated, setIsEscalated] = useState(false);

  return ( <>
<main className="flex-1 flex flex-col p-container-padding gap-container-padding h-full overflow-hidden bg-background">
{/* Alert Header */}
<div className="bg-surface border border-danger p-4 flex items-center justify-between rounded shadow-[0_0_15px_rgba(239,68,68,0.2)]">
<div className="flex items-center gap-4">
<div className="bg-error-container text-on-error p-2 rounded flex items-center justify-center">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
</div>
<div>
<h1 className="text-title-sm font-title-sm text-danger flex items-center gap-2">
<span className="led led-live"></span> 중대 재난 대응 프로토콜 발효 </h1>
<p className="text-mono-data font-mono-data text-on-surface-variant mt-1">INCIDENT ID: VLM-992-A | LOC: METRO SECTOR 7 | TIME: 00:14:02 ELAPSED</p>
</div>
</div>
<div className="flex gap-2">
<button className="bg-surface-container border border-border-subtle text-on-surface px-4 py-2 rounded text-body-sm font-body-sm hover:bg-surface-container-high transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-sm">download</span> 로그 내보내기 </button>
<button 
  className={`px-6 py-2 rounded text-body-sm font-body-sm font-bold shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-colors ${isEscalated ? 'bg-error-container text-danger cursor-not-allowed' : 'bg-danger text-white hover:bg-red-600'}`}
  onClick={() => setIsEscalated(true)}
  disabled={isEscalated}
>
  {isEscalated ? '에스컬레이션 완료' : '지역 본부 에스컬레이션'}
</button>
</div>
</div>
{/* Multi-Agency Video Fusion Grid */}
<div className="flex-1 grid grid-cols-3 grid-rows-2 gap-gutter min-h-0">
{/* Main Feed (VLM Source) */}
<div className="col-span-2 row-span-2 video-cell active">
<div className="absolute inset-0 bg-surface-container-lowest flex items-center justify-center">
<img alt="Main Incident Feed" className="w-full h-full object-cover opacity-80" data-alt="A high-contrast night vision camera feed showing a large industrial chemical plant. Plumes of smoke are visible in the center. The image features a technical overlay with bounding boxes highlighting active fires in red and responding fire trucks in green. The lighting is harsh, typical of security footage, with a gritty, realistic texture." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw47fM_56rONWEyXn5rghRFD8NQcwru0ZCCu3AyNWroNfQWDNEO0edGBfWQBIICkJork55hKT0vGB52g2NKqe4Si1aRhmfpTEvcXr_ZavvlJpLRQPWnNMTsrv34AaYaDqILotOtGtBjnzq7963pqIXiizg4o5CqIXnkkicekULSKeFt9ZAI2QlLT13RuffOahfMfrGjOAKIdR-Ak3X3G-wb-gNzJRPDzbHFYcuN-1vBHn6f4cRB9dCjQ"/>
</div>
{/* OSD */}
<div className="absolute top-osd-margin left-osd-margin flex flex-col gap-1">
<span className="bg-surface/80 backdrop-blur px-2 py-1 text-osd-label font-osd-label text-primary flex items-center gap-1 border border-border-subtle">
<span className="material-symbols-outlined text-[12px]">videocam</span> CAM_MAIN_01 (VLM_SOURCE) </span>
<span className="bg-error-container/80 backdrop-blur px-2 py-1 text-osd-label font-osd-label text-on-error border border-danger"> VLM DETECT: HAZMAT LEAK + FIRE </span>
</div>
{/* Bounding Box Example */}
<div className="absolute top-[30%] left-[40%] w-1/4 h-1/4 border-[1.5px] border-danger bg-danger/10">
<span className="absolute -top-5 left-0 text-osd-label font-osd-label text-danger bg-surface-dim px-1">FIRE CONFIRMED (98%)</span>
</div>
{/* PTZ Controls (Ghost) */}
<div className="absolute bottom-osd-margin right-osd-margin flex gap-1">
<button className="bg-surface/50 backdrop-blur border border-border-subtle p-1 hover:bg-primary/20 transition-colors rounded"><span className="material-symbols-outlined text-on-surface">zoom_in</span></button>
<button className="bg-surface/50 backdrop-blur border border-border-subtle p-1 hover:bg-primary/20 transition-colors rounded"><span className="material-symbols-outlined text-on-surface">zoom_out</span></button>
</div>
</div>
{/* Agency Feed 1: Police */}
<div className="video-cell">
<div className="absolute inset-0 bg-surface-container flex items-center justify-center">
<img alt="Police Dashcam Feed" className="w-full h-full object-cover opacity-70" data-alt="Dashboard camera view from a police cruiser approaching a roadblock at night. Flashing blue and red lights illuminate the wet asphalt. The UI overlay shows speed and GPS coordinates in a crisp, monospaced font. The scene is tense and urgent, maintaining the dark, industrial color palette." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1wW4gwLmgBLRV3JoqiCkFWj-NdIU3D4yjlMSReiSLOoEYZWQvanwtKZtw7MZdW94xCNUl0DifoOejhDoVzPw4a0vjz1M6RmcNUu0ZsjPHa7yyYv68vsW1TOdmTiU0hoXmwb_4rJWAYns_eGWG_MmSxV2WC7JATpZjnrR5YE-4ni2zaiz7hGqSMbrgiULCLbdCQDU-1SzyhP5E1QnZyXUN2U_IvEDK9rWArvX0pET7FftjulX5Kwjytg"/>
</div>
<div className="absolute top-osd-margin left-osd-margin">
<span className="bg-surface-dim/90 px-2 py-1 text-osd-label font-osd-label text-secondary flex items-center gap-1 border border-border-subtle">
<span className="material-symbols-outlined text-[12px]">local_police</span> UNIT P-402 (POLICE) </span>
</div>
</div>
{/* Agency Feed 2: Fire Dept Drone */}
<div className="video-cell">
<div className="absolute inset-0 bg-surface-container flex items-center justify-center">
<img alt="Drone Thermal Feed" className="w-full h-full object-cover opacity-70" data-alt="Thermal imaging view from a firefighting drone looking down at an industrial building roof. Hot spots are highlighted in bright yellow and orange against a dark blue background. Data points like altitude and temperature are overlaid in green technical text. The aesthetic is strictly military-grade utility." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdSrJ8dUIcfBtJdhKvr8wFCi2hJVmmvah_UfDp-pramkpypMGLfk__LDtOYILNfdJQzZE7mjAV_TcZMX5JXPlkGZjcADEe0ySm9rh2Z-O9u2NXEnj3Dz_janKad5kn1BWpSVam68WG34ewwDFHjjidTOQLRPxxkbY6v4LIHeoW9irw2pZPgolrLYvQXe-I1dRlDKinEnCclXtRD2ZTbdzSPMghQkhrNKl8_DZWRc2CQi_ZANB72P7eZg"/>
</div>
<div className="absolute top-osd-margin left-osd-margin">
<span className="bg-surface-dim/90 px-2 py-1 text-osd-label font-osd-label text-warning flex items-center gap-1 border border-border-subtle">
<span className="material-symbols-outlined text-[12px]">flight_takeoff</span> UAV T-09 (FIRE_DEPT) </span>
</div>
</div>
</div>
</main> </> );
};

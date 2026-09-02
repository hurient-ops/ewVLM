import React, { useState, useEffect } from 'react';
import { API } from '../api/client';

export const MultiSiteAuthMatrix: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const data = await API.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await API.updateUserRole(userId, newRole);
      loadUsers();
      alert('✅ 권한 변경이 완료되었습니다.');
    } catch (err) {
      alert('권한 변경 실패');
    }
  };

  return ( <>
<main className="flex-1 overflow-y-auto p-container-padding flex flex-col gap-4 relative bg-surface-container-lowest">
{/* Header */}
<div className="flex justify-between items-end mb-2">
<div>
<h1 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-3xl">hub</span> 다중 사이트 페더레이션 &amp; 사용자 권한 매트릭스 관리 콘솔 </h1>
<p className="text-body-base font-body-base text-text-muted mt-1">Manage remote NVR/CCTV node clusters and Role-Based Access Control (RBAC) matrices globally.</p>
</div>
<div className="flex gap-2">
<button className="px-4 py-1.5 border border-border-subtle rounded text-body-sm font-body-sm text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-sm">sync</span> 정책 동기화 </button>
<button className="px-4 py-1.5 bg-primary-container text-on-primary-container rounded text-body-sm font-body-sm hover:bg-inverse-primary transition-colors flex items-center gap-2 border border-primary-container shadow-[0_0_10px_rgba(124,58,237,0.4)]">
<span className="material-symbols-outlined text-sm">save</span> 설정 저장 </button>
</div>
</div>
<div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1">
{/* Left Column: Node Topology */}
<div className="xl:col-span-1 flex flex-col gap-4">
{/* Cluster Map Widget */}
<div className="bg-surface border border-border-subtle rounded-lg flex flex-col h-[400px] overflow-hidden relative group">
<div className="p-3 border-b border-border-subtle bg-surface-container-low flex justify-between items-center z-10">
<h3 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-sm text-primary">share</span> 노드 클러스터 토폴로지 </h3>
<div className="flex gap-1">
<button className="p-1 text-text-muted hover:text-on-surface rounded hover:bg-surface-container-high"><span className="material-symbols-outlined text-sm">zoom_in</span></button>
<button className="p-1 text-text-muted hover:text-on-surface rounded hover:bg-surface-container-high"><span className="material-symbols-outlined text-sm">zoom_out</span></button>
</div>
</div>
<div className="flex-1 relative bg-background overflow-hidden cursor-crosshair" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #1c1f29 0%, #0b0e17 100%)" }}>
{/* Abstract Node Representation */}
<div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(35, 44, 63, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(35, 44, 63, 0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
{/* HQ Node */}
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border-2 border-primary bg-surface flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.6)] z-20">
<span className="material-symbols-outlined text-primary">corporate_fare</span>
</div>
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-8 text-osd-label font-osd-label text-on-surface whitespace-nowrap bg-surface-container/80 px-2 py-0.5 rounded backdrop-blur z-20">HQ-Core</div>
{/* Lines connecting nodes (SVG would be better but CSS for simplicity here) */}
<div className="absolute top-1/2 left-1/2 w-32 h-0 border-t-2 border-dashed border-tertiary/50 origin-left -rotate-45 z-10"></div>
<div className="absolute top-1/2 left-1/2 w-40 h-0 border-t-2 border-dashed border-warning/50 origin-left rotate-15 z-10"></div>
<div className="absolute top-1/2 left-1/2 w-28 h-0 border-t-2 border-dashed border-tertiary/50 origin-left rotate-[135deg] z-10"></div>
{/* Node 1 */}
<div className="absolute top-[25%] left-[75%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-tertiary bg-surface flex items-center justify-center z-20 hover:border-white transition-colors cursor-pointer">
<span className="material-symbols-outlined text-tertiary text-sm">router</span>
</div>
<div className="absolute top-[25%] left-[75%] -translate-x-1/2 mt-6 text-osd-label font-osd-label text-text-muted whitespace-nowrap z-20">Site-Alpha</div>
{/* Node 2 (Warning State) */}
<div className="absolute top-[60%] left-[85%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-warning bg-surface flex items-center justify-center z-20 hover:border-white transition-colors cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.4)]">
<span className="material-symbols-outlined text-warning text-sm">router</span>
<span className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full animate-ping"></span>
</div>
<div className="absolute top-[60%] left-[85%] -translate-x-1/2 mt-6 text-osd-label font-osd-label text-warning whitespace-nowrap z-20">Site-Beta (Syncing)</div>
{/* Node 3 */}
<div className="absolute top-[75%] left-[20%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-tertiary bg-surface flex items-center justify-center z-20 hover:border-white transition-colors cursor-pointer">
<span className="material-symbols-outlined text-tertiary text-sm">router</span>
</div>
<div className="absolute top-[75%] left-[20%] -translate-x-1/2 mt-6 text-osd-label font-osd-label text-text-muted whitespace-nowrap z-20">Site-Gamma</div>
</div>
</div>
{/* Node Properties List */}
<div className="bg-surface border border-border-subtle rounded-lg flex-1 flex flex-col min-h-[250px]">
<div className="p-3 border-b border-border-subtle bg-surface-container-low">
<h3 className="text-title-sm font-title-sm text-on-surface">연동 노드</h3>
</div>
<div className="flex-1 overflow-y-auto">
<table className="w-full text-left border-collapse">
<tbody>
<tr className="border-b border-border-subtle hover:bg-surface-container-highest cursor-pointer transition-colors bg-surface-container-highest">
<td className="p-3 w-8"><span className="material-symbols-outlined text-primary text-sm">corporate_fare</span></td>
<td className="p-3">
<div className="text-body-sm font-body-sm text-on-surface font-semibold">HQ-Core</div>
<div className="text-mono-data font-mono-data text-text-muted text-[10px]">192.168.1.1</div>
</td>
<td className="p-3 text-right">
<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary-container/30 text-tertiary border border-tertiary/50">MASTER</span>
</td>
</tr>
<tr className="border-b border-border-subtle hover:bg-surface-container-highest cursor-pointer transition-colors">
<td className="p-3 w-8"><span className="material-symbols-outlined text-tertiary text-sm">router</span></td>
<td className="p-3">
<div className="text-body-sm font-body-sm text-on-surface">Site-Alpha</div>
<div className="text-mono-data font-mono-data text-text-muted text-[10px]">10.0.4.55</div>
</td>
<td className="p-3 text-right">
<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary/10 text-tertiary border border-tertiary/20">ONLINE</span>
</td>
</tr>
<tr className="border-b border-border-subtle hover:bg-surface-container-highest cursor-pointer transition-colors">
<td className="p-3 w-8"><span className="material-symbols-outlined text-warning text-sm">router</span></td>
<td className="p-3">
<div className="text-body-sm font-body-sm text-on-surface">Site-Beta</div>
<div className="text-mono-data font-mono-data text-text-muted text-[10px]">10.0.5.12</div>
</td>
<td className="p-3 text-right">
<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-warning/10 text-warning border border-warning/20">SYNCING</span>
</td>
</tr>
<tr className="border-b border-border-subtle hover:bg-surface-container-highest cursor-pointer transition-colors">
<td className="p-3 w-8"><span className="material-symbols-outlined text-tertiary text-sm">router</span></td>
<td className="p-3">
<div className="text-body-sm font-body-sm text-on-surface">Site-Gamma</div>
<div className="text-mono-data font-mono-data text-text-muted text-[10px]">10.0.8.200</div>
</td>
<td className="p-3 text-right">
<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary/10 text-tertiary border border-tertiary/20">ONLINE</span>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
{/* Right Column: RBAC & Users */}
<div className="xl:col-span-2 flex flex-col gap-4">
{/* RBAC Matrix */}
<div className="bg-surface border border-border-subtle rounded-lg flex flex-col overflow-hidden shadow-lg h-[400px]">
<div className="p-4 border-b border-border-subtle bg-surface-container-low flex justify-between items-center shrink-0">
<div>
<h2 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-lg">admin_panel_settings</span> 역할 기반 권한 제어 (RBAC) 매트릭스 </h2>
<p className="text-mono-data font-mono-data text-text-muted mt-1">Context: Global Federation Policies / Selected: HQ-Core</p>
</div>
<div className="flex gap-2">
<div className="relative">
<select className="appearance-none bg-surface-container-high border border-border-subtle rounded text-body-sm font-body-sm text-on-surface pl-3 pr-8 py-1.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-40">
<option>All Resources</option>
<option>Cameras Only</option>
<option>PTZ Controls</option>
<option>System Config</option>
</select>
<span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">arrow_drop_down</span>
</div>
<button className="px-3 py-1.5 border border-border-subtle rounded text-body-sm font-body-sm text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1">
<span className="material-symbols-outlined text-sm">add</span> 역할 추가 </button>
</div>
</div>
<div className="flex-1 overflow-auto bg-surface-container-lowest p-4 relative">
{/* High density table design */}
<table className="w-full text-left border-collapse min-w-[800px]">
<thead>
<tr>
<th className="sticky top-0 bg-surface-container-lowest z-20 p-2 border-b border-border-subtle text-label-caps font-label-caps text-text-muted min-w-[150px]"> Role / Group </th>
<th className="sticky top-0 bg-surface-container-lowest z-20 p-2 border-b border-border-subtle border-l text-center text-label-caps font-label-caps text-on-surface bg-surface-container/50" colSpan={4}> Video Streams </th>
<th className="sticky top-0 bg-surface-container-lowest z-20 p-2 border-b border-border-subtle border-l text-center text-label-caps font-label-caps text-on-surface bg-surface-container/50" colSpan={3}> PTZ &amp; Controls </th>
<th className="sticky top-0 bg-surface-container-lowest z-20 p-2 border-b border-border-subtle border-l text-center text-label-caps font-label-caps text-on-surface bg-surface-container/50" colSpan={2}> Federation </th>
</tr>
<tr>
<th className="sticky top-8 bg-surface-container-lowest z-20 p-2 border-b border-border-subtle text-osd-label font-osd-label text-text-muted"></th>
{/* Video */}
<th className="sticky top-8 bg-surface-container-lowest z-20 p-2 border-b border-border-subtle border-l text-center text-mono-data text-text-muted w-16 group cursor-pointer hover:bg-surface-container-high">
<span className="material-symbols-outlined text-sm block mb-1">visibility</span>실시간(Live) </th>
<th className="sticky top-8 bg-surface-container-lowest z-20 p-2 border-b border-border-subtle text-center text-mono-data text-text-muted w-16 group cursor-pointer hover:bg-surface-container-high">
<span className="material-symbols-outlined text-sm block mb-1">history</span>저장조회(Play) </th>
<th className="sticky top-8 bg-surface-container-lowest z-20 p-2 border-b border-border-subtle text-center text-mono-data text-text-muted w-16 group cursor-pointer hover:bg-surface-container-high">
<span className="material-symbols-outlined text-sm block mb-1">download</span>영상반출(Exprt) </th>
<th className="sticky top-8 bg-surface-container-lowest z-20 p-2 border-b border-border-subtle text-center text-mono-data text-text-muted w-16 group cursor-pointer hover:bg-surface-container-high">
<span className="material-symbols-outlined text-sm block mb-1">psychology</span>AI 분석(AI) </th>
{/* PTZ */}
<th className="sticky top-8 bg-surface-container-lowest z-20 p-2 border-b border-border-subtle border-l text-center text-mono-data text-text-muted w-16 group cursor-pointer hover:bg-surface-container-high">
<span className="material-symbols-outlined text-sm block mb-1">gamepad</span>PTZ 제어(Move) </th>
<th className="sticky top-8 bg-surface-container-lowest z-20 p-2 border-b border-border-subtle text-center text-mono-data text-text-muted w-16 group cursor-pointer hover:bg-surface-container-high">
<span className="material-symbols-outlined text-sm block mb-1">center_focus_strong</span>프리셋(Prst) </th>
<th className="sticky top-8 bg-surface-container-lowest z-20 p-2 border-b border-border-subtle text-center text-mono-data text-text-muted w-16 group cursor-pointer hover:bg-surface-container-high">
<span className="material-symbols-outlined text-sm block mb-1">lock</span>Lock </th>
{/* System */}
<th className="sticky top-8 bg-surface-container-lowest z-20 p-2 border-b border-border-subtle border-l text-center text-mono-data text-text-muted w-16 group cursor-pointer hover:bg-surface-container-high">
<span className="material-symbols-outlined text-sm block mb-1">settings_ethernet</span>Cnfg </th>
<th className="sticky top-8 bg-surface-container-lowest z-20 p-2 border-b border-border-subtle text-center text-mono-data text-text-muted w-16 group cursor-pointer hover:bg-surface-container-high">
<span className="material-symbols-outlined text-sm block mb-1">policy</span>RBAC </th>
</tr>
</thead>
<tbody>
{/* Row 1: Global Admin */}
<tr className="border-b border-border-subtle hover:bg-surface/50 group">
<td className="p-3 bg-surface-container-low/50 group-hover:bg-surface">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-danger shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>
<div>
<div className="text-body-sm font-body-sm text-on-surface font-semibold">전역 관리자</div>
<div className="text-[10px] text-text-muted">Full System Access</div>
</div>
</div>
</td>
{/* Video */}
<td className="p-2 border-l border-border-subtle text-center bg-surface-container-low/20">
<button className="w-6 h-6 rounded bg-primary/20 border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></button>
</td>
<td className="p-2 text-center bg-surface-container-low/20">
<button className="w-6 h-6 rounded bg-primary/20 border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></button>
</td>
<td className="p-2 text-center bg-surface-container-low/20">
<button className="w-6 h-6 rounded bg-primary/20 border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></button>
</td>
<td className="p-2 text-center bg-surface-container-low/20">
<button className="w-6 h-6 rounded bg-primary/20 border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></button>
</td>
{/* PTZ */}
<td className="p-2 border-l border-border-subtle text-center bg-surface-container-low/20">
<button className="w-6 h-6 rounded bg-primary/20 border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></button>
</td>
<td className="p-2 text-center bg-surface-container-low/20">
<button className="w-6 h-6 rounded bg-primary/20 border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></button>
</td>
<td className="p-2 text-center bg-surface-container-low/20">
<button className="w-6 h-6 rounded bg-primary/20 border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></button>
</td>
{/* System */}
<td className="p-2 border-l border-border-subtle text-center bg-surface-container-low/20">
<button className="w-6 h-6 rounded bg-primary/20 border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></button>
</td>
<td className="p-2 text-center bg-surface-container-low/20">
<button className="w-6 h-6 rounded bg-primary/20 border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></button>
</td>
</tr>
{/* Row 2: Site Manager */}
<tr className="border-b border-border-subtle hover:bg-surface/50 group">
<td className="p-3 bg-surface-container-low/50 group-hover:bg-surface">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-warning"></div>
<div>
<div className="text-body-sm font-body-sm text-on-surface">사이트 관리자</div>
<div className="text-[10px] text-text-muted">Node-level Control</div>
</div>
</div>
</td>
{/* Video */}
<td className="p-2 border-l border-border-subtle text-center">
<button className="w-6 h-6 rounded bg-primary/20 border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></button>
</td>
<td className="p-2 text-center">
<button className="w-6 h-6 rounded bg-primary/20 border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></button>
</td>
<td className="p-2 text-center">
<button className="w-6 h-6 rounded bg-primary/20 border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></button>
</td>
<td className="p-2 text-center">
<button className="w-6 h-6 rounded border border-border-subtle text-text-muted flex items-center justify-center hover:bg-surface-container-highest transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
</td>
{/* PTZ */}
<td className="p-2 border-l border-border-subtle text-center">
<button className="w-6 h-6 rounded bg-primary/20 border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></button>
</td>
<td className="p-2 text-center">
<button className="w-6 h-6 rounded bg-primary/20 border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></button>
</td>
<td className="p-2 text-center">
<button className="w-6 h-6 rounded border border-border-subtle text-text-muted flex items-center justify-center hover:bg-surface-container-highest transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
</td>
{/* System */}
<td className="p-2 border-l border-border-subtle text-center">
<button className="w-6 h-6 rounded bg-tertiary/20 border border-tertiary/50 text-tertiary flex items-center justify-center hover:bg-tertiary hover:text-on-tertiary transition-colors" title="Partial Access"><span className="material-symbols-outlined text-sm">horizontal_rule</span></button>
</td>
<td className="p-2 text-center">
<button className="w-6 h-6 rounded border border-border-subtle text-text-muted flex items-center justify-center hover:bg-surface-container-highest transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
</td>
</tr>
{/* Row 3: Operator (Standard) */}
<tr className="border-b border-border-subtle hover:bg-surface/50 group">
<td className="p-3 bg-surface-container-low/50 group-hover:bg-surface">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-tertiary"></div>
<div>
<div className="text-body-sm font-body-sm text-on-surface">일반 관제사</div>
<div className="text-[10px] text-text-muted">Viewing Only</div>
</div>
</div>
</td>
{/* Video */}
<td className="p-2 border-l border-border-subtle text-center">
<button className="w-6 h-6 rounded bg-primary/20 border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></button>
</td>
<td className="p-2 text-center">
<button className="w-6 h-6 rounded bg-primary/20 border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></button>
</td>
<td className="p-2 text-center">
<button className="w-6 h-6 rounded border border-border-subtle text-text-muted flex items-center justify-center hover:bg-surface-container-highest transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
</td>
<td className="p-2 text-center">
<button className="w-6 h-6 rounded border border-border-subtle text-text-muted flex items-center justify-center hover:bg-surface-container-highest transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
</td>
{/* PTZ */}
<td className="p-2 border-l border-border-subtle text-center">
<button className="w-6 h-6 rounded bg-tertiary/20 border border-tertiary/50 text-tertiary flex items-center justify-center hover:bg-tertiary hover:text-on-tertiary transition-colors" title="Time Restricted"><span className="material-symbols-outlined text-sm">schedule</span></button>
</td>
<td className="p-2 text-center">
<button className="w-6 h-6 rounded border border-border-subtle text-text-muted flex items-center justify-center hover:bg-surface-container-highest transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
</td>
<td className="p-2 text-center">
<button className="w-6 h-6 rounded border border-border-subtle text-text-muted flex items-center justify-center hover:bg-surface-container-highest transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
</td>
{/* System */}
<td className="p-2 border-l border-border-subtle text-center">
<button className="w-6 h-6 rounded border border-border-subtle text-text-muted flex items-center justify-center hover:bg-surface-container-highest transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
</td>
<td className="p-2 text-center">
<button className="w-6 h-6 rounded border border-border-subtle text-text-muted flex items-center justify-center hover:bg-surface-container-highest transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
</td>
</tr>
</tbody>
</table>
</div>
<div className="p-3 border-t border-border-subtle bg-surface-container-low flex justify-between items-center text-xs text-text-muted">
<div className="flex gap-4">
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-primary/50 border border-primary inline-block"></span> Granted</span>
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded border border-border-subtle inline-block"></span> Denied</span>
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-tertiary/50 border border-tertiary inline-block"></span> Conditional</span>
</div>
<span>Last modified: 14:32:01 UTC</span>
</div>
</div>
</div>

{/* System Users Panel */}
<div className="bg-surface border border-border-subtle rounded-lg flex flex-col overflow-hidden shadow-lg flex-1 min-h-[250px]">
  <div className="p-4 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
    <h2 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
      <span className="material-symbols-outlined text-primary text-lg">group</span> 시스템 사용자 관리
    </h2>
    <button className="px-3 py-1.5 bg-primary-container text-white rounded text-body-sm font-body-sm transition-colors flex items-center gap-1 hover:bg-primary" onClick={loadUsers}>
      <span className="material-symbols-outlined text-sm">refresh</span> 새로고침
    </button>
  </div>
  <div className="flex-1 overflow-auto bg-surface-container-lowest">
    {loading ? (
      <div className="flex items-center justify-center h-full text-text-muted">
        <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
      </div>
    ) : (
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container/50 border-b border-border-subtle">
            <th className="p-3 text-label-caps text-text-muted">ID</th>
            <th className="p-3 text-label-caps text-text-muted">사용자명</th>
            <th className="p-3 text-label-caps text-text-muted">소속 / 직책</th>
            <th className="p-3 text-label-caps text-text-muted text-right">권한 (Role)</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b border-border-subtle hover:bg-surface-container-high transition-colors">
              <td className="p-3 text-mono-data text-text-muted">#{user.id}</td>
              <td className="p-3 text-body-sm font-semibold text-on-surface">{user.username}</td>
              <td className="p-3 text-body-sm text-text-muted">{user.id === 1 ? '보안 통제실 / 실장' : '관제 센터 / 사원'}</td>
              <td className="p-3 text-right">
                <select 
                  className="bg-surface-container border border-border-subtle text-body-sm rounded px-2 py-1 focus:border-primary text-on-surface"
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  <option value="SystemAdmin">전역 관리자 (SystemAdmin)</option>
                  <option value="SecurityAdmin">사이트 관리자 (SecurityAdmin)</option>
                  <option value="Viewer">일반 관제사 (Viewer)</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
</div>
</div>

</main> </> );
};

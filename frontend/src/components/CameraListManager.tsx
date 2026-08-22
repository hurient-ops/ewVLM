import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCameraStore, CameraGroup, CameraDevice } from '../store/useCameraStore';

export const CameraListManager: React.FC = () => {
  const navigate = useNavigate();
  const { groups, cameras, changeCameraGroup, updateCamera } = useCameraStore();
  const [selectedGroupId, setSelectedGroupId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Slide-over state for editing
  const [editingCamera, setEditingCamera] = useState<CameraDevice | null>(null);

  const filteredCameras = useMemo(() => {
    return cameras.filter(cam => {
      const matchGroup = selectedGroupId === 'all' || cam.groupId === selectedGroupId;
      const matchSearch = 
        cam.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        cam.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cam.ipAddress.includes(searchQuery);
      return matchGroup && matchSearch;
    });
  }, [cameras, selectedGroupId, searchQuery]);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCamera) {
      updateCamera(editingCamera.id, editingCamera);
      setEditingCamera(null); // close panel
    }
  };

  return (
    <main className="flex-1 min-w-0 flex flex-col min-h-screen bg-background relative">
      {/* Page Header */}
      <div className="px-6 py-5 border-b border-border-subtle bg-surface flex justify-between items-end">
        <div>
          <div className="text-label-caps font-label-caps text-primary mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">list_alt</span> 카메라 현황
          </div>
          <h1 className="text-[22px] font-headline-md text-on-surface whitespace-nowrap">카메라 목록 및 그룹 관리</h1>
          <p className="text-text-muted mt-1 text-body-sm font-body-sm">등록된 카메라 자산을 조회하고 논리적 그룹을 구성합니다.</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Groups */}
        <div className="w-64 bg-surface border-r border-border-subtle flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-border-subtle bg-surface-container-low">
            <h3 className="text-title-sm font-title-sm text-text-primary">카메라 그룹</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setSelectedGroupId('all')}
                  className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-body-sm font-body-sm transition-colors ${
                    selectedGroupId === 'all' ? 'bg-primary/20 text-primary font-bold' : 'text-text-primary hover:bg-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">dataset</span>
                  전체 카메라
                  <span className="ml-auto text-xs text-text-muted">{cameras.length}</span>
                </button>
              </li>
              {groups.map(g => {
                const count = cameras.filter(c => c.groupId === g.id).length;
                return (
                  <li key={g.id}>
                    <button
                      onClick={() => setSelectedGroupId(g.id)}
                      className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-body-sm font-body-sm transition-colors ${
                        selectedGroupId === g.id ? 'bg-primary/20 text-primary font-bold' : 'text-text-primary hover:bg-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">folder</span>
                      {g.name}
                      <span className="ml-auto text-xs text-text-muted">{count}</span>
                    </button>
                  </li>
                );
              })}
              <li>
                <button
                  onClick={() => setSelectedGroupId('none')}
                  className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-body-sm font-body-sm transition-colors ${
                    selectedGroupId === 'none' ? 'bg-primary/20 text-primary font-bold' : 'text-text-primary hover:bg-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">folder_off</span>
                  미배정
                  <span className="ml-auto text-xs text-text-muted">{cameras.filter(c => c.groupId === null).length}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Content: Data Grid */}
        <div className="flex-1 flex flex-col min-w-0 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-72">
              <span className="material-symbols-outlined absolute left-3 top-2 text-text-muted text-[18px]">search</span>
              <input 
                type="text" 
                placeholder="카메라 이름, ID, IP 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container border border-border-subtle rounded-full pl-10 pr-4 py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <button 
              onClick={() => navigate('/camera-setup')}
              className="bg-primary text-on-primary px-4 py-2 rounded font-title-sm text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span> 신규 등록
            </button>
          </div>

          <div className="flex-1 bg-surface border border-border-subtle rounded-lg overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-border-subtle">
                    <th className="px-4 py-3 text-label-caps font-label-caps text-text-muted">ID</th>
                    <th className="px-4 py-3 text-label-caps font-label-caps text-text-muted">이름</th>
                    <th className="px-4 py-3 text-label-caps font-label-caps text-text-muted">IP 주소</th>
                    <th className="px-4 py-3 text-label-caps font-label-caps text-text-muted">그룹</th>
                    <th className="px-4 py-3 text-label-caps font-label-caps text-text-muted">상태</th>
                    <th className="px-4 py-3 text-label-caps font-label-caps text-text-muted">VLM 활성</th>
                    <th className="px-4 py-3 text-label-caps font-label-caps text-text-muted text-right">설정</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCameras.map(cam => (
                    <tr key={cam.id} className="border-b border-border-subtle hover:bg-surface-container/50 transition-colors cursor-pointer" onClick={() => setEditingCamera(cam)}>
                      <td className="px-4 py-3 text-mono-data font-mono-data text-on-surface">{cam.id}</td>
                      <td className="px-4 py-3 text-body-sm font-body-sm text-on-surface font-bold">{cam.name}</td>
                      <td className="px-4 py-3 text-mono-data font-mono-data text-text-muted">{cam.ipAddress}</td>
                      <td className="px-4 py-3 text-body-sm font-body-sm text-text-muted">
                        <select 
                          value={cam.groupId || 'none'} 
                          onChange={(e) => {
                            e.stopPropagation();
                            changeCameraGroup(cam.id, e.target.value === 'none' ? null : e.target.value);
                          }}
                          className="bg-background border border-border-subtle rounded px-2 py-1 text-xs outline-none"
                        >
                          <option value="none">미배정</option>
                          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {cam.status === 'online' && <span className="inline-flex items-center gap-1 text-xs text-tertiary bg-tertiary/10 px-2 py-0.5 rounded"><span className="w-1.5 h-1.5 bg-tertiary rounded-full"></span> 정상</span>}
                        {cam.status === 'offline' && <span className="inline-flex items-center gap-1 text-xs text-danger bg-danger/10 px-2 py-0.5 rounded"><span className="w-1.5 h-1.5 bg-danger rounded-full"></span> 단절</span>}
                        {cam.status === 'warning' && <span className="inline-flex items-center gap-1 text-xs text-warning bg-warning/10 px-2 py-0.5 rounded"><span className="w-1.5 h-1.5 bg-warning rounded-full"></span> 경고</span>}
                      </td>
                      <td className="px-4 py-3">
                        {cam.vlmEnabled ? (
                          <span className="material-symbols-outlined text-primary text-[18px]">smart_toy</span>
                        ) : (
                          <span className="material-symbols-outlined text-text-muted text-[18px]">block</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-text-muted hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredCameras.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-text-muted text-body-sm">
                        검색된 카메라가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Panel for Editing */}
      {editingCamera && (
        <div className="absolute inset-y-0 right-0 w-96 bg-surface border-l border-border-subtle shadow-2xl flex flex-col z-50 animate-in slide-in-from-right">
          <div className="px-4 py-4 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
            <h3 className="text-title-sm font-title-sm text-text-primary">카메라 정보 수정</h3>
            <button onClick={() => setEditingCamera(null)} className="text-text-muted hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <form id="editForm" onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-label-caps font-label-caps text-text-muted mb-1">카메라 ID</label>
                <input disabled type="text" value={editingCamera.id} className="w-full bg-surface-container-highest border border-border-subtle rounded px-3 py-2 text-mono-data text-on-surface opacity-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-label-caps font-label-caps text-text-muted mb-1">이름</label>
                <input 
                  type="text" 
                  value={editingCamera.name} 
                  onChange={(e) => setEditingCamera({...editingCamera, name: e.target.value})}
                  className="w-full bg-background border border-border-subtle rounded px-3 py-2 text-body-sm text-on-surface focus:border-primary outline-none" 
                />
              </div>
              <div>
                <label className="block text-label-caps font-label-caps text-text-muted mb-1">IP 주소</label>
                <input 
                  type="text" 
                  value={editingCamera.ipAddress} 
                  onChange={(e) => setEditingCamera({...editingCamera, ipAddress: e.target.value})}
                  className="w-full bg-background border border-border-subtle rounded px-3 py-2 text-mono-data text-on-surface focus:border-primary outline-none" 
                />
              </div>
              <div>
                <label className="block text-label-caps font-label-caps text-text-muted mb-1">해상도</label>
                <select 
                  value={editingCamera.resolution}
                  onChange={(e) => setEditingCamera({...editingCamera, resolution: e.target.value})}
                  className="w-full bg-background border border-border-subtle rounded px-3 py-2 text-mono-data text-on-surface focus:border-primary outline-none"
                >
                  <option value="4K">4K (3840x2160)</option>
                  <option value="QHD">QHD (2560x1440)</option>
                  <option value="FHD">FHD (1920x1080)</option>
                  <option value="HD">HD (1280x720)</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-subtle">
                <input 
                  type="checkbox" 
                  id="vlmToggle"
                  checked={editingCamera.vlmEnabled}
                  onChange={(e) => setEditingCamera({...editingCamera, vlmEnabled: e.target.checked})}
                  className="w-4 h-4 text-primary bg-background border-border-subtle rounded focus:ring-primary focus:ring-offset-background"
                />
                <label htmlFor="vlmToggle" className="text-body-sm text-on-surface cursor-pointer">VLM 실시간 분석 활성화</label>
              </div>
            </form>
          </div>
          <div className="p-4 border-t border-border-subtle bg-surface-container-low flex justify-end gap-2">
            <button onClick={() => setEditingCamera(null)} className="px-4 py-2 rounded text-body-sm font-bold text-text-muted hover:bg-surface-variant transition-colors">
              취소
            </button>
            <button type="submit" form="editForm" className="px-4 py-2 rounded text-body-sm font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors">
              저장
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

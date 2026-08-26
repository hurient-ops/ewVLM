import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCameraStore, CameraGroup, CameraDevice } from '../store/useCameraStore';

export const CameraListManager: React.FC = () => {
  const navigate = useNavigate();
  const { groups, cameras, changeCameraGroup, updateCamera, deleteCamera, fetchCameras, addGroup, deleteGroup } = useCameraStore();

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  
  // Slide-over state for editing
  const [editingCamera, setEditingCamera] = useState<CameraDevice | null>(null);

  const filteredCameras = useMemo(() => {
    return cameras.filter(cam => {
      const matchGroup = selectedGroupId === 'all' || cam.groupId === selectedGroupId || (selectedGroupId === 'none' && !cam.groupId);
      const matchSearch = 
        cam.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        cam.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cam.ipAddress.includes(searchQuery);
      return matchGroup && matchSearch;
    });
  }, [cameras, selectedGroupId, searchQuery]);

  const handleSaveEdit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (editingCamera) {
      await updateCamera(editingCamera.id, editingCamera);
      setEditingCamera(null); // close panel
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(`카메라 [${id}]를 정말 삭제하시겠습니까?`)) {
      await deleteCamera(id);
      if (editingCamera?.id === id) {
        setEditingCamera(null);
      }
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
          <div className="p-4 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
            <h3 className="text-title-sm font-title-sm text-text-primary">카메라 그룹</h3>
            <button onClick={() => setIsCreatingGroup(true)} className="text-primary hover:text-primary/80" title="새 그룹 추가">
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-1">
              {isCreatingGroup && (
                <li className="px-2 py-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={newGroupName} 
                      onChange={e => setNewGroupName(e.target.value)} 
                      placeholder="그룹 이름" 
                      className="w-full bg-surface-container border border-border-subtle rounded px-2 py-1 text-xs text-on-surface focus:border-primary outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newGroupName.trim()) {
                          addGroup({ id: `group-${Date.now()}`, name: newGroupName.trim(), description: '' });
                          setNewGroupName('');
                          setIsCreatingGroup(false);
                        } else if (e.key === 'Escape') {
                          setNewGroupName('');
                          setIsCreatingGroup(false);
                        }
                      }}
                    />
                  </div>
                </li>
              )}
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
                  <li key={g.id} className="group relative flex items-center">
                    <button
                      onClick={() => setSelectedGroupId(g.id)}
                      className={`flex-1 text-left px-3 py-2 rounded flex items-center gap-2 text-body-sm font-body-sm transition-colors ${
                        selectedGroupId === g.id ? 'bg-primary/20 text-primary font-bold' : 'text-text-primary hover:bg-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">folder</span>
                      <span className="truncate max-w-[100px]">{g.name}</span>
                      <span className="ml-auto text-xs text-text-muted mr-6">{count}</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if(window.confirm(`'${g.name}' 그룹을 삭제하시겠습니까? 속한 카메라는 미배정 처리됩니다.`)) {
                          deleteGroup(g.id);
                          if(selectedGroupId === g.id) setSelectedGroupId('all');
                        }
                      }}
                      className="absolute right-2 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="그룹 삭제"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
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
                    <tr key={cam.id} className="border-b border-border-subtle hover:bg-surface-container/50 transition-colors">
                      <td className="px-4 py-3 text-mono-data font-mono-data text-on-surface">{cam.id}</td>
                      <td className="px-4 py-3 text-body-sm font-body-sm text-on-surface font-bold">{cam.name}</td>
                      <td className="px-4 py-3 text-mono-data font-mono-data text-text-muted">
                        <div>{cam.ipAddress}</div>
                        <div className="text-[10px] text-tertiary mt-0.5 truncate max-w-[200px]" title={cam.rtspUrl}>{cam.rtspUrl || 'N/A'}</div>
                      </td>
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
                        <div className="flex justify-end gap-2">
                          <button onClick={(e) => { e.stopPropagation(); setEditingCamera(cam); }} className="text-text-muted hover:text-primary transition-colors" title="수정">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={(e) => handleDelete(e, cam.id)} className="text-text-muted hover:text-danger transition-colors" title="삭제">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
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
        <>
          <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setEditingCamera(null)} />
          <div className="fixed inset-y-0 right-0 w-96 bg-surface border-l border-border-subtle shadow-2xl flex flex-col z-50 animate-in slide-in-from-right">
          <div className="px-4 py-4 border-b border-border-subtle bg-surface-container-low flex justify-between items-center">
            <h3 className="text-title-sm font-title-sm text-text-primary">카메라 정보 수정</h3>
            <button onClick={() => setEditingCamera(null)} className="text-text-muted hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
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
                <label className="block text-label-caps font-label-caps text-text-muted mb-1">RTSP 주소</label>
                <input 
                  type="text" 
                  value={editingCamera.rtspUrl || ''} 
                  onChange={(e) => setEditingCamera({...editingCamera, rtspUrl: e.target.value})}
                  className="w-full bg-background border border-border-subtle rounded px-3 py-2 text-mono-data text-on-surface focus:border-primary outline-none mb-1" 
                />
                <p className="text-[10px] text-tertiary font-body-sm leading-tight">
                  💡 프로파일을 변경하시려면 주소 끝의 profile1(메인), profile2(서브) 부분을 직접 수정하세요.
                </p>
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
                  <option value="SD">SD (704x480)</option>
                  <option value="VGA">VGA (640x480)</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-subtle">
                <input 
                  type="checkbox" 
                  id="vlmToggle"
                  checked={!!editingCamera.vlmEnabled}
                  onChange={(e) => setEditingCamera({...editingCamera, vlmEnabled: e.target.checked})}
                  className="w-4 h-4 text-primary bg-background border-border-subtle rounded focus:ring-primary focus:ring-offset-background cursor-pointer"
                />
                <label htmlFor="vlmToggle" className="text-body-sm text-on-surface cursor-pointer select-none">VLM 실시간 분석 활성화</label>
              </div>
            </div>
            <div className="p-4 border-t border-border-subtle bg-surface-container-low flex justify-end gap-2">
              <button type="button" onClick={() => setEditingCamera(null)} className="px-4 py-2 rounded text-body-sm font-bold text-text-muted hover:bg-surface-variant transition-colors">
                취소
              </button>
              <button type="button" onClick={handleSaveEdit} className="px-4 py-2 rounded text-body-sm font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors">
                저장
              </button>
            </div>
          </div>
        </div>
        </>
      )}
    </main>
  );
};

import React, { useEffect, useState } from 'react';
import { API } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Shield, Users, UserCheck, UserX, Settings, MoreVertical } from 'lucide-react';

interface UserData {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

export const CameraSecurityPortal: React.FC = () => {
  const currentUser = useAuthStore(state => state.user);
  const isAdmin = currentUser?.role === 'admin';
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await API.getUsers();
      setUsers(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!isAdmin) return;
    try {
      await API.updateUserRole(userId, newRole);
      setActionMessage(`유저 ${userId}의 권한이 ${newRole}(으)로 변경되었습니다.`);
      fetchUsers();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (e) {
      console.error(e);
      setActionMessage('권한 변경에 실패했습니다.');
    }
  };

  const pendingUsers = users.filter(u => u.role === 'pending');
  const activeUsers = users.filter(u => u.role !== 'pending');

  if (!isAdmin) {
    return (
      <main className="flex-1 min-w-0 h-screen w-full flex flex-col bg-surface-container-lowest p-8 items-center justify-center">
        <Shield className="w-16 h-16 text-danger mb-4" />
        <h1 className="text-2xl font-bold text-on-surface">접근 거부됨</h1>
        <p className="text-text-muted mt-2">이 페이지는 최고 관리자(Admin) 권한이 필요합니다.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 min-w-0 h-screen w-full flex flex-col bg-surface-container-lowest">
      {/* Header */}
      <div className="px-container-padding py-4 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-border-subtle bg-surface/50 backdrop-blur-md sticky top-0 z-30">
        <div>
          <h1 className="font-display-lg text-on-surface flex items-center gap-3 text-headline-md">
            <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span> 
            보안 관리자 포탈 (사용자 및 권한 관리) 
          </h1>
          <p className="text-text-muted text-body-base font-body-base mt-1">시스템 접근 권한 승인 및 RBAC 정책 설정</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-container-padding flex flex-col gap-6">
        {actionMessage && (
          <div className="bg-primary/20 border border-primary/50 text-primary px-4 py-3 rounded flex items-center gap-2">
            <span className="material-symbols-outlined">info</span>
            {actionMessage}
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="bg-surface border border-border-subtle p-4 rounded flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="text-primary w-6 h-6" />
            </div>
            <div>
              <div className="text-text-muted text-label-caps">전체 등록 유저</div>
              <div className="text-2xl font-bold text-on-surface">{users.length}</div>
            </div>
          </div>
          <div className="bg-surface border border-border-subtle p-4 rounded flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center">
              <UserCheck className="text-tertiary w-6 h-6" />
            </div>
            <div>
              <div className="text-text-muted text-label-caps">활성 유저 (승인됨)</div>
              <div className="text-2xl font-bold text-on-surface">{activeUsers.length}</div>
            </div>
          </div>
          <div className="bg-surface border border-warning/30 p-4 rounded flex items-center gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-warning/5"></div>
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center relative z-10">
              <UserX className="text-warning w-6 h-6" />
            </div>
            <div className="relative z-10">
              <div className="text-warning text-label-caps">가입 승인 대기</div>
              <div className="text-2xl font-bold text-warning">{pendingUsers.length}</div>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        {pendingUsers.length > 0 && (
          <div className="bg-surface border border-warning/50 rounded flex flex-col overflow-hidden">
            <div className="p-4 border-b border-warning/30 bg-warning/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-warning animate-pulse">notification_important</span>
              <h3 className="font-bold text-warning">가입 승인 대기 ({pendingUsers.length}건)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-lowest border-b border-border-subtle">
                  <tr>
                    <th className="px-4 py-3 text-text-muted font-normal text-sm">계정 ID</th>
                    <th className="px-4 py-3 text-text-muted font-normal text-sm">신청 일시</th>
                    <th className="px-4 py-3 text-text-muted font-normal text-sm text-right">승인 액션</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map(u => (
                    <tr key={u.id} className="border-b border-border-subtle hover:bg-surface-container-highest">
                      <td className="px-4 py-3 font-mono text-on-surface">{u.username}</td>
                      <td className="px-4 py-3 text-text-muted">{new Date(u.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 flex justify-end gap-2">
                        <button onClick={() => handleRoleChange(u.id, 'operator')} className="bg-tertiary/20 text-tertiary px-3 py-1.5 rounded text-sm hover:bg-tertiary/30">운영자(Operator) 승인</button>
                        <button onClick={() => handleRoleChange(u.id, 'viewer')} className="bg-primary/20 text-primary px-3 py-1.5 rounded text-sm hover:bg-primary/30">조회자(Viewer) 승인</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Active Users Table */}
        <div className="bg-surface border border-border-subtle rounded flex flex-col overflow-hidden flex-1">
          <div className="p-4 border-b border-border-subtle bg-surface-dim flex justify-between items-center">
            <h3 className="font-bold text-on-surface">활성 사용자 목록</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left relative">
              <thead className="bg-surface sticky top-0 border-b border-border-subtle z-10">
                <tr>
                  <th className="px-4 py-3 text-text-muted font-normal text-sm">계정 ID</th>
                  <th className="px-4 py-3 text-text-muted font-normal text-sm">현재 권한 (Role)</th>
                  <th className="px-4 py-3 text-text-muted font-normal text-sm">가입 일시</th>
                  <th className="px-4 py-3 text-text-muted font-normal text-sm text-right">권한 변경</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="text-center py-8 text-text-muted">로딩 중...</td></tr>
                ) : activeUsers.map(u => (
                  <tr key={u.id} className="border-b border-border-subtle hover:bg-surface-container-highest">
                    <td className="px-4 py-4 font-mono text-on-surface flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center text-text-muted">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      {u.username}
                      {u.username === currentUser?.username && (
                        <span className="ml-2 bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">나</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        u.role === 'admin' ? 'bg-danger/20 text-danger border border-danger/30' :
                        u.role === 'operator' ? 'bg-tertiary/20 text-tertiary border border-tertiary/30' :
                        'bg-surface-variant text-text-muted border border-border-subtle'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-text-muted text-sm">{new Date(u.created_at).toLocaleString()}</td>
                    <td className="px-4 py-4 text-right">
                      {u.username !== currentUser?.username ? (
                        <select 
                          className="bg-surface-container-highest border border-border-subtle text-on-surface text-sm rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="admin">Admin</option>
                          <option value="operator">Operator</option>
                          <option value="viewer">Viewer</option>
                          <option value="pending">차단 (Pending)</option>
                        </select>
                      ) : (
                        <span className="text-text-muted text-sm">변경 불가</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
};

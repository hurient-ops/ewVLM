import React, { useState, useEffect } from 'react';

interface FeedbackItem {
  id: number;
  event_id: string;
  camera_id: string;
  feedback_type: string;
  original_caption: string;
  corrected_caption: string;
  corrected_class: string;
  image_path: string;
  operator_name: string;
  is_exported_to_dataset: number;
  created_at: string;
}

export const DatasetManagementPortal: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch('http://localhost:8000/api/v1/events/feedback/list?limit=100');
      if (resp.ok) {
        const data = await resp.json();
        setFeedbacks(data.feedbacks || []);
      }
    } catch (e) {
      console.error("Failed to fetch feedbacks:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleBuildDataset = async () => {
    setIsExporting(true);
    setExportMessage(null);
    try {
      const resp = await fetch('http://localhost:8000/api/v1/lora/local-dataset/build', {
        method: 'POST'
      });
      if (resp.ok) {
        const result = await resp.json();
        setExportMessage(`✅ LLaMA-Factory 데이터셋 생성 완료! (${result.total_samples}개 샘플 변환됨)`);
        fetchFeedbacks();
      } else {
        setExportMessage('⚠️ 데이터셋 빌드 실패: 백엔드 상태를 확인해주세요.');
      }
    } catch (e) {
      setExportMessage('❌ 데이터셋 빌드 통신 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const truePositives = feedbacks.filter(f => f.feedback_type === 'true_positive').length;
  const falsePositives = feedbacks.filter(f => f.feedback_type === 'false_positive').length;
  const corrected = feedbacks.filter(f => f.feedback_type === 'corrected_label').length;

  return (
    <div className="p-6 h-full flex flex-col gap-6 text-gray-100 font-sans overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#121724] border border-[#232C3F] p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px] text-indigo-400">dataset</span>
            <h1 className="text-xl font-bold text-white tracking-wide">폐쇄망 Active Learning 데이터셋 매니저</h1>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            관제사가 화면에서 판정한 오탐/정탐 데이터를 LLaMA-Factory 멀티모달 Vision 포맷으로 자동 변환합니다.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchFeedbacks}
            className="px-4 py-2 bg-[#1e2433] hover:bg-[#2b3347] text-gray-200 text-sm font-semibold rounded-lg border border-[#232C3F] flex items-center gap-2 transition-all"
          >
            <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
            새로고침
          </button>
          <button
            onClick={handleBuildDataset}
            disabled={isExporting || feedbacks.length === 0}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">build</span>
            {isExporting ? '데이터셋 빌드 중...' : 'LLaMA-Factory 포맷 빌드'}
          </button>
        </div>
      </div>

      {exportMessage && (
        <div className="p-4 bg-indigo-950/40 border border-indigo-500/50 rounded-lg text-sm text-indigo-200 flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-400">info</span>
          {exportMessage}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#121724] border border-[#232C3F] p-4 rounded-xl">
          <div className="text-xs text-gray-400 font-mono">총 수집 라벨</div>
          <div className="text-2xl font-black text-white mt-1">{feedbacks.length} <span className="text-xs font-normal text-gray-500">건</span></div>
          <div className="text-[11px] text-indigo-400 mt-1">로컬 SQLite 영구 보관</div>
        </div>
        <div className="bg-[#121724] border border-[#232C3F] p-4 rounded-xl">
          <div className="text-xs text-emerald-400 font-mono">정탐 (True Positive)</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{truePositives} <span className="text-xs font-normal text-gray-500">건</span></div>
          <div className="text-[11px] text-gray-500 mt-1">정상 감지 확정 케이스</div>
        </div>
        <div className="bg-[#121724] border border-[#232C3F] p-4 rounded-xl">
          <div className="text-xs text-rose-400 font-mono">오탐 (False Positive)</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{falsePositives} <span className="text-xs font-normal text-gray-500">건</span></div>
          <div className="text-[11px] text-gray-500 mt-1">네거티브 억제 샘플</div>
        </div>
        <div className="bg-[#121724] border border-[#232C3F] p-4 rounded-xl">
          <div className="text-xs text-amber-400 font-mono">수정 라벨 (Corrected)</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{corrected} <span className="text-xs font-normal text-gray-500">건</span></div>
          <div className="text-[11px] text-gray-500 mt-1">관제사 직접 보정 캡션</div>
        </div>
      </div>

      {/* Feedback Logs Table */}
      <div className="flex-1 bg-[#121724] border border-[#232C3F] rounded-xl flex flex-col overflow-hidden shadow-lg">
        <div className="p-4 border-b border-[#232C3F] flex justify-between items-center bg-[#151a28]">
          <h2 className="text-sm font-bold text-gray-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-400 text-[18px]">list_alt</span>
            실시간 수집된 관제 피드백 레코드 ({feedbacks.length})
          </h2>
          <span className="text-xs text-gray-400 font-mono">Auto-saved to feedback_logs</span>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {feedbacks.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-gray-500">
              <span className="material-symbols-outlined text-[42px] mb-2 text-gray-600">inbox</span>
              <p className="text-sm">아직 수집된 관제 피드백이 없습니다.</p>
              <p className="text-xs text-gray-600 mt-1">관제 화면에서 이벤트 확인 시 오탐/정탐 버튼을 누르면 자동으로 축적됩니다.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#181e2e] text-gray-400 sticky top-0 border-b border-[#232C3F]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">ID</th>
                  <th className="py-2.5 px-4 font-semibold">사건 ID</th>
                  <th className="py-2.5 px-4 font-semibold">카메라</th>
                  <th className="py-2.5 px-4 font-semibold">판정 유형</th>
                  <th className="py-2.5 px-4 font-semibold">원래 캡션</th>
                  <th className="py-2.5 px-4 font-semibold">보정 내용</th>
                  <th className="py-2.5 px-4 font-semibold">관제사</th>
                  <th className="py-2.5 px-4 font-semibold">일시</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2536]">
                {feedbacks.map((fb) => (
                  <tr key={fb.id} className="hover:bg-[#181f30] transition-colors">
                    <td className="py-2.5 px-4 font-mono text-gray-500">#{fb.id}</td>
                    <td className="py-2.5 px-4 font-mono font-medium text-indigo-300">{fb.event_id}</td>
                    <td className="py-2.5 px-4 text-gray-300">{fb.camera_id}</td>
                    <td className="py-2.5 px-4">
                      {fb.feedback_type === 'true_positive' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">정탐</span>
                      )}
                      {fb.feedback_type === 'false_positive' && (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px]">오탐</span>
                      )}
                      {fb.feedback_type === 'corrected_label' && (
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px]">라벨 보정</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-gray-400 max-w-xs truncate" title={fb.original_caption}>{fb.original_caption || '-'}</td>
                    <td className="py-2.5 px-4 text-gray-200 max-w-xs truncate" title={fb.corrected_caption}>{fb.corrected_caption || '-'}</td>
                    <td className="py-2.5 px-4 text-gray-400">{fb.operator_name}</td>
                    <td className="py-2.5 px-4 text-gray-500 font-mono text-[11px]">{fb.created_at ? new Date(fb.created_at).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

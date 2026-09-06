import React, { useState, useEffect } from "react";
import { API } from "../api/client";
import { useEventLogStore } from "../store/useEventLogStore";
import { WebRTCPlayer } from "./WebRTCPlayer";
import {
  Play,
  Pause,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  VideoOff,
  Layers,
} from "lucide-react";
interface MonitorSlot {
  id: number;
  cameraId: string | null;
  cameraName: string | null;
  status: "empty" | "linking" | "active" | "alert";
  fps: number;
  detections: string[];
}
interface MonitorCanvasProps {
  selectedCam: string | null;
  onActionTrigger: (msg: string) => void;
}
export default function MonitorCanvas({
  selectedCam,
  onActionTrigger,
}: MonitorCanvasProps) {
  const [slots, setSlots] = useState<MonitorSlot[]>([
    {
      id: 1,
      cameraId: "CAM-REAL-1787557630",
      cameraName: "외곽 1구역 펜스 북부",
      status: "active",
      fps: 30,
      detections: ["침입 시도 차단선 인접"],
    },
    {
      id: 2,
      cameraId: "CAM-REAL-1787579299",
      cameraName: "자재 창고 출입구",
      status: "active",
      fps: 29.8,
      detections: ["지게차 주행 상태"],
    },
    {
      id: 3,
      cameraId: null,
      cameraName: null,
      status: "empty",
      fps: 0,
      detections: [],
    },
    {
      id: 4,
      cameraId: null,
      cameraName: null,
      status: "empty",
      fps: 0,
      detections: [],
    },
  ]);
  const { logs } = useEventLogStore();
  const [activeLayout, setActiveLayout] = useState<4 | 1>(4);
  const [vlmModels, setVlmModels] = useState<string[]>([]);
  const [activeModels, setActiveModels] = useState<string[]>(["Llama 3.2 11B Vision Instruct"]);

  useEffect(() => {
    API.getVlmModels().then((data) => {
      setVlmModels(data.available || []);
      if (data.active && Array.isArray(data.active)) {
        setActiveModels(data.active);
      }
    }).catch(console.error);
  }, []);

  const handleModelToggle = async (model: string) => {
    let newModels;
    if (activeModels.includes(model)) {
      newModels = activeModels.filter(m => m !== model);
      if (newModels.length === 0) return; // Prevent empty selection
    } else {
      newModels = [...activeModels, model];
    }
    
    try {
      await API.setVlmModel(newModels);
      setActiveModels(newModels);
      onActionTrigger(`[SYSTEM] AI 모델이 앙상블 조합(${newModels.join(', ')})으로 교체되었습니다.`);
    } catch (err) {
      console.error(err);
      onActionTrigger(`[ERROR] AI 모델 다중 선택에 실패했습니다.`);
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent, slotId: number) => {
    e.preventDefault();
    const cameraId = e.dataTransfer.getData("cameraId");
    if (!cameraId) return;
    onActionTrigger(
      `[GSTREAMER] Slot ${slotId} ↔ ${cameraId} 파이프라인 링킹 트리거`,
    );
    // Update slot to simulation loading
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === slotId) {
          return {
            ...slot,
            cameraId: cameraId,
            cameraName:
              cameraId === "CAM-REAL-1787557630"
                ? "외곽 1구역 펜스 북부"
                : cameraId === "CAM-REAL-1787579299"
                  ? "자재 창고 출입구"
                  : cameraId === "CAM-03"
                    ? "중앙 변전실 내부"
                    : cameraId === "CAM-04"
                      ? "본관 메인 로비"
                      : "하역장 차량 진입로",
            status: "linking",
            fps: 0,
            detections: ["GStreamer NVMM 버퍼 수집 중..."],
          };
        }
        return slot;
      }),
    );
    // Settle down connection after 1.5s (Simulating FastAPI connection success)
    setTimeout(() => {
      setSlots((prev) =>
        prev.map((slot) => {
          if (slot.id === slotId) {
            onActionTrigger(
              `[SUCCESS] Slot ${slotId} ↔ ${cameraId} GStreamer 파이프라인 링크 정상 수립 완료`,
            );
            return {
              ...slot,
              status: "active",
              fps: 30.0,
              detections: ["정상 관제 구동 완료"],
            };
          }
          return slot;
        }),
      );
    }, 1500);
  };
  const triggerMockAlert = (slotId: number) => {
    // Disabled: Using real VLM backend events instead
  };

  useEffect(() => {
    if (logs.length > 0) {
      const latestLog = logs[logs.length - 1];
      if (latestLog.level === 'critical') {
        setSlots(prev => prev.map(slot => {
          if (slot.cameraId && slot.cameraId.toLowerCase() === latestLog.cameraId?.toLowerCase()) {
            return {
              ...slot,
              status: "alert",
              detections: [
                `⚠️ ${latestLog.message.substring(0, 30)}...`,
                `신뢰도: ${(latestLog.confidence * 100).toFixed(1)}%`
              ]
            };
          }
          return slot;
        }));
      }
    }
  }, [logs]);
  return (
    <div className="h-full flex flex-col space-y-4">
      {/* 화면 제어 옵션 탑 바 */}{" "}
      <div className="flex items-center justify-between">
        {" "}
        <div className="flex items-center space-x-2 bg-[#121724] p-1.5 rounded-lg border border-[#232C3F]">
          {" "}
          <button
            onClick={() => setActiveLayout(4)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${activeLayout === 4 ? "bg-[#3B82F6] text-white" : "text-[#8E9AA8] hover:text-white"}`}
          >
            {" "}
            4분할 화면{" "}
          </button>{" "}
          <button
            onClick={() => setActiveLayout(1)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${activeLayout === 1 ? "bg-[#3B82F6] text-white" : "text-[#8E9AA8] hover:text-white"}`}
          >
            {" "}
            전체 단일 화면{" "}
          </button>{" "}
        </div>{" "}
        <div className="flex items-center space-x-3">
          <div className="relative group text-xs flex items-center space-x-2">
            <span className="text-[#8E9AA8]">VLM 앙상블 ({activeModels.length}): </span>
            <div className="bg-[#070A13] border border-[#232C3F] text-white rounded px-2 py-1 text-[11px] font-mono cursor-pointer min-w-[150px] text-center">
              {activeModels.length > 0 ? (activeModels.length === 1 ? activeModels[0] : `${activeModels[0]} 외 ${activeModels.length - 1}개`) : '선택'}
            </div>
            <div className="absolute top-full right-0 mt-1 w-[260px] bg-[#121724] border border-[#232C3F] rounded shadow-lg hidden group-hover:block z-50 p-2">
              <div className="text-[10px] text-[#8E9AA8] mb-2 px-1">다중 선택 시 병렬 교차 검증을 수행합니다.</div>
              <div className="space-y-1">
                {vlmModels.map(model => (
                  <label key={model} className="flex items-center space-x-2 text-white cursor-pointer hover:bg-[#1E293B] p-1.5 rounded transition-colors">
                    <input 
                      type="checkbox" 
                      checked={activeModels.includes(model)}
                      onChange={() => handleModelToggle(model)}
                      className="rounded border-[#232C3F] bg-[#070A13] text-[#3B82F6] focus:ring-[#3B82F6]"
                    />
                    <span className="text-[11px] font-mono truncate">{model}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="text-xs text-[#8E9AA8] flex items-center space-x-1.5">
            {" "}
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>{" "}
            <span>CCTV RTSP 디코더: </span>{" "}
            <span className="text-white font-mono font-bold">
              NVIDIA NVDEC Hardware
            </span>{" "}
          </div>{" "}
        </div>
      </div>{" "}
      {/* 모니터 채널 그리드 */}{" "}
      <div
        className={`grid gap-4 flex-1 ${activeLayout === 4 ? "grid-cols-2" : "grid-cols-1"}`}
      >
        {" "}
        {slots.map((slot) => {
          const isSlotActive = slot.status === "active";
          const isSlotLinking = slot.status === "linking";
          const isSlotAlert = slot.status === "alert";
          const isSlotEmpty = slot.status === "empty";
          let borderTheme = "border-[#232C3F] bg-[#121724]";
          if (isSlotLinking)
            borderTheme = "border-yellow-500 bg-[#121724] animate-pulse";
          if (isSlotAlert) borderTheme = "border-[#EF4444] bg-[#1A0E1A]";
          return (
            <div
              key={slot.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, slot.id)}
              className={`rounded-xl border p-4 flex flex-col justify-between relative transition duration-300 ${borderTheme}`}
            >
              {" "}
              {/* 상단 메타 헤더 */}{" "}
              <div className="flex items-center justify-between">
                {" "}
                <div className="flex items-center space-x-2">
                  {" "}
                  <span className="bg-[#070A13] px-2 py-0.5 rounded text-xs font-mono font-bold text-[#3B82F6] border border-[#232C3F]">
                    {" "}
                    CH-0{slot.id}{" "}
                  </span>{" "}
                  {slot.cameraId && (
                    <span className="text-sm font-bold text-white">
                      {" "}
                      {slot.cameraName} ({slot.cameraId}){" "}
                    </span>
                  )}{" "}
                </div>{" "}
                {slot.fps > 0 && (
                  <span className="text-xs font-mono text-[#10B981]">
                    {" "}
                    {slot.fps.toFixed(1)} FPS{" "}
                  </span>
                )}{" "}
              </div>{" "}
              {/* 중앙 비디오 영역 플레이스홀더 (UI 시각 피드백 제공) */}{" "}
              <div className="my-4 flex-1 min-h-[140px] bg-[#070A13] rounded-lg border border-[#232C3F] flex flex-col items-center justify-center relative overflow-hidden">
                {" "}
                {isSlotEmpty && (
                  <div className="flex flex-col items-center space-y-2">
                    {" "}
                    <VideoOff className="w-10 h-10 text-[#232C3F]" />{" "}
                    <span className="text-xs text-[#8E9AA8]">
                      카메라를 드래그해서 드롭하세요
                    </span>{" "}
                  </div>
                )}{" "}
                {isSlotLinking && (
                  <div className="flex flex-col items-center space-y-2">
                    {" "}
                    <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>{" "}
                    <span className="text-xs text-yellow-500 font-mono">
                      FastAPI API 링킹 설정 중...
                    </span>{" "}
                  </div>
                )}{" "}
                {isSlotActive && (
                  <div className="absolute inset-0 flex flex-col justify-between overflow-hidden">
                    <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
                      <WebRTCPlayer streamUrl={`http://localhost:8889/${(slot.cameraId || 'cam-01').toLowerCase()}`} />
                    </div>
                    <div className="absolute top-0 w-full flex justify-between items-start p-4 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none">
                      <span className="bg-black/60 px-2 py-0.5 rounded text-[10px] text-green-400 font-bold border border-green-500/40">
                        ● LIVE STREAM
                      </span>
                    </div>
                  </div>
                )}
                {isSlotAlert && (
                  <div className="absolute inset-0 bg-[#290F0F]/90 flex flex-col items-center justify-center p-4">
                    {" "}
                    <ShieldAlert className="w-12 h-12 text-[#EF4444] animate-bounce" />{" "}
                    <span className="text-sm font-bold text-[#EF4444] mt-2">
                      🚨 VLM 정밀 탐지 이벤트 발동!
                    </span>{" "}
                    <span className="text-[11px] text-gray-400 text-center mt-1 leading-relaxed">
                      {" "}
                      Llama 3.2 11B 및 Upstage Solar 비동기 추론 엔진 실시간
                      추적 중{" "}
                    </span>{" "}
                  </div>
                )}{" "}
              </div>{" "}
              {/* 하단 탐지 정보 바 */}{" "}
              <div className="flex items-center justify-between border-t border-[#232C3F]/50 pt-3">
                {" "}
                <div className="text-xs flex items-center space-x-1.5 text-[#8E9AA8] truncate">
                  {" "}
                  <span className="font-bold text-white">AI 상태: </span>{" "}
                  {slot.detections.length > 0 ? (
                    <span className="text-yellow-400 truncate">
                      {slot.detections[0]}
                    </span>
                  ) : (
                    <span>인공지능 대기 상태</span>
                  )}{" "}
                </div>{" "}
                {slot.cameraId && (isSlotActive || isSlotAlert) && (
                  <div
                    className="text-[10px] bg-[#EF4444]/20 text-[#EF4444] px-3 py-1.5 rounded font-bold border border-[#EF4444]/40"
                  >
                    {" "}
                    가상 위협 트리거{" "}
                  </div>
                )}{" "}
              </div>{" "}
            </div>
          );
        })}{" "}
      </div>{" "}
    </div>
  );
}

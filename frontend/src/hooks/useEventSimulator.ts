import { useEffect } from 'react';
import { useEventLogStore } from '../store/useEventLogStore';

const MOCK_EVENTS = [
  { cameraId: 'CAM-01', cameraName: '외곽 1구역 펜스 북부', level: 'warning', message: '배회 감지 (10초 이상)', confidence: 0.85 },
  { cameraId: 'CAM-02', cameraName: '자재 창고 출입구', level: 'critical', message: '인가되지 않은 작업자 침입 감지', confidence: 0.95 },
  { cameraId: 'CAM-03', cameraName: '중앙 변전실 내부', level: 'critical', message: '연기/화재 발생 징후 감지', confidence: 0.99 },
  { cameraId: 'CAM-04', cameraName: '본관 메인 로비', level: 'info', message: 'VIP 차량(12가3456) 진입', confidence: 1.0 },
  { cameraId: 'CAM-05', cameraName: '지하 주차장 B1', level: 'critical', message: '작업자 미끄러짐 및 전도 낙상 감지', confidence: 0.92 },
  { cameraId: 'CAM-01', cameraName: '외곽 1구역 펜스 북부', level: 'critical', message: '안전 펜스 월담 징후 포착', confidence: 0.88 },
];

export const useEventSimulator = (intervalMs = 15000) => {
  const addLog = useEventLogStore((state) => state.addLog);

  useEffect(() => {
    const interval = setInterval(() => {
      // 랜덤하게 하나 픽
      const randomEvent = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
      addLog(randomEvent as any);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [addLog, intervalMs]);
};

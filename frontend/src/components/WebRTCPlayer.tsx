import React, { useState, useEffect, useRef } from 'react';

interface WebRTCPlayerProps {
  streamUrl: string; // The MJPEG stream URL (e.g. http://localhost:8890/stream/cam-01)
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
}

export const WebRTCPlayer: React.FC<WebRTCPlayerProps> = ({ streamUrl, className = '' }) => {
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Create a stable stream URL that bypasses cache but doesn't change on every React re-render
  const [activeUrl, setActiveUrl] = useState(`${streamUrl}?t=${Date.now()}`);

  useEffect(() => {
    // When the prop changes, generate a new cache-busting URL
    setActiveUrl(`${streamUrl}?t=${Date.now()}`);
  }, [streamUrl]);

  // 컴포넌트 언마운트 시 브라우저 소켓 강제 종료 (크롬 동시 연결 6개 제한 방어)
  useEffect(() => {
    const currentImg = imgRef.current;
    return () => {
      if (currentImg) {
        // 1x1 투명 GIF로 교체하여 브라우저가 즉시 기존 MJPEG HTTP 소켓을 끊도록 강제함
        currentImg.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      }
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (imgRef.current) {
          // 1x1 투명 GIF로 교체하여 브라우저가 즉시 기존 MJPEG HTTP 소켓을 끊도록 강제함
          imgRef.current.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
          // 50ms 후 새 연결 수립
          setTimeout(() => {
            setActiveUrl(`${streamUrl}?t=${Date.now()}`);
            setError(null);
          }, 50);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [streamUrl]);

  return (
    <div className={`relative bg-black flex items-center justify-center overflow-hidden ${className}`}>
      {error ? (
        <div className="absolute flex flex-col items-center justify-center text-red-500">
          <span className="material-symbols-outlined text-3xl mb-1">videocam_off</span>
          <span className="text-xs font-mono">{error}</span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={activeUrl}
          alt="Live Stream"
          className="w-full h-full object-cover"
          onError={() => setError("스트림 연결 실패")}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';

interface WebRTCPlayerProps {
  streamUrl: string; // The MJPEG stream URL (e.g. http://localhost:8890/stream/cam-01)
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
}

export const WebRTCPlayer: React.FC<WebRTCPlayerProps> = ({ streamUrl, className = '' }) => {
  const [error, setError] = useState<string | null>(null);

  // For MJPEG streams, we can simply use an <img> tag.
  return (
    <div className={`relative bg-black flex items-center justify-center overflow-hidden ${className}`}>
      {error ? (
        <div className="absolute flex flex-col items-center justify-center text-red-500">
          <span className="material-symbols-outlined text-3xl mb-1">videocam_off</span>
          <span className="text-xs font-mono">{error}</span>
        </div>
      ) : (
        <img
          src={streamUrl}
          alt="Live Stream"
          className="w-full h-full object-cover"
          onError={() => setError("스트림 연결 실패")}
        />
      )}
    </div>
  );
};

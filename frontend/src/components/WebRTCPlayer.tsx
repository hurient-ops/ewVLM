import React, { useState, useEffect, useRef } from 'react';

interface WebRTCPlayerProps {
  streamUrl: string; // The MediaMTX base URL (e.g. http://localhost:8889/cam-01/)
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
}

export const WebRTCPlayer: React.FC<WebRTCPlayerProps> = ({ streamUrl, className = '' }) => {
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    let active = true;
    setError(null);
    
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });

    pc.ontrack = (event) => {
      if (videoRef.current && event.streams[0]) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    const start = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Remove trailing slash if present, then add /whep
        const whepUrl = streamUrl.replace(/\/$/, '') + '/whep';

        const response = await fetch(whepUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/sdp' },
          body: offer.sdp
        });

        if (!response.ok) {
          throw new Error('스트림 연결 실패 (WHEP)');
        }

        const answerSdp = await response.text();
        await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
      } catch (err: any) {
        if (active) setError(err.message || '스트림 연결 실패');
      }
    };

    start();

    return () => {
      active = false;
      pc.close();
    };
  }, [streamUrl]);

  return (
    <div className={`relative bg-black flex items-center justify-center overflow-hidden ${className}`}>
      {error ? (
        <div className="absolute flex flex-col items-center justify-center text-red-500">
          <span className="material-symbols-outlined text-3xl mb-1">videocam_off</span>
          <span className="text-xs font-mono">{error}</span>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-fill"
        />
      )}
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';

interface WebRTCPlayerProps {
  streamUrl: string; // The MediaMTX WebRTC URL (e.g. http://localhost:8889/cam1)
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
}

export const WebRTCPlayer: React.FC<WebRTCPlayerProps> = ({ streamUrl, className = '', autoPlay = true, muted = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let pc: RTCPeerConnection | null = null;
    let isComponentMounted = true;

    const startWebRTC = async () => {
      try {
        pc = new RTCPeerConnection();

        pc.addTransceiver('video', { direction: 'recvonly' });
        pc.addTransceiver('audio', { direction: 'recvonly' });

        pc.ontrack = (event) => {
          if (video.srcObject !== event.streams[0]) {
            video.srcObject = event.streams[0];
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Send offer to MediaMTX WebRTC API
        const response = await fetch(`${streamUrl}/whep`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/sdp' },
          body: offer.sdp,
        });

        if (!response.ok) {
          throw new Error(`MediaMTX returned status ${response.status}`);
        }

        const answerSdp = await response.text();
        
        if (isComponentMounted) {
          await pc.setRemoteDescription({
            type: 'answer',
            sdp: answerSdp,
          });
        }
      } catch (err) {
        if (isComponentMounted) {
          console.error("WebRTC Error:", err);
          setError("스트림 연결 실패");
        }
      }
    };

    startWebRTC();

    return () => {
      isComponentMounted = false;
      if (pc) {
        pc.close();
      }
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
          autoPlay={autoPlay}
          muted={muted}
          playsInline
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

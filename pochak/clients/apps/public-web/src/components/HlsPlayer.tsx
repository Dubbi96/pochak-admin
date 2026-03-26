import { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
  src: string | null;
  poster?: string;
  autoPlay?: boolean;
}

export default function HlsPlayer({ src, poster, autoPlay = false }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setError(null);

    if (src.endsWith('.m3u8') && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setError('스트림 로드 실패');
      });
      if (autoPlay) hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = src;
      if (autoPlay) video.play();
    } else {
      // Regular MP4/WebM
      video.src = src;
      if (autoPlay) video.play();
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [src, autoPlay]);

  if (!src) {
    return (
      <div className="aspect-video bg-[#1A1A1A] rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#262626] flex items-center justify-center mb-3">
            <span className="text-[#00CC33] text-2xl">&#9654;</span>
          </div>
          <p className="text-[#A6A6A6] text-sm">영상을 준비 중입니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        controls
        playsInline
        muted
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

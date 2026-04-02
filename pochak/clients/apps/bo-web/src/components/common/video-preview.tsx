"use client";

import React, { useRef, useEffect } from "react";

interface VideoPreviewProps {
  src: string;
  poster?: string;
}

/**
 * Simple HTML5 video player.
 * Supports plain MP4 and HLS (.m3u8) natively on Safari.
 * On non-Safari browsers, .m3u8 URLs may not play without hls.js;
 * the component falls back gracefully with native <video> controls.
 */
export function VideoPreview({ src, poster }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset source when src changes
    video.pause();
    video.removeAttribute("src");
    video.load();

    video.src = src;
    video.load();
  }, [src]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        className="w-full aspect-video"
        controls
        autoPlay
        playsInline
        poster={poster}
        src={src}
      >
        <source src={src} type={src.endsWith(".m3u8") ? "application/x-mpegURL" : "video/mp4"} />
        브라우저가 비디오 재생을 지원하지 않습니다.
      </video>
    </div>
  );
}

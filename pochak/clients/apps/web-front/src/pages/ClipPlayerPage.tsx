import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  LuChevronUp, LuChevronDown, LuPlay, LuPause,
  LuVolume2, LuVolumeX, LuThumbsUp, LuMessageSquare,
  LuShare2, LuBookmark, LuExternalLink,
} from 'react-icons/lu';
import { ClipCard } from '@/components/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SectionHeader from '@/components/SectionHeader';
import ShareModal from '@/components/ShareModal';
import { useContents } from '@/hooks/useApi';

const SAMPLE_VIDEOS = [
  '/sample/video1.mp4',
  '/sample/video2.mp4',
];

export default function ClipPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);

  const { data: clipContents } = useContents('CLIP');

  /* ── find current clip and neighbors ───────────────────── */
  const currentIndex = clipContents.findIndex((c) => c.id === id);
  const clip = currentIndex >= 0 ? clipContents[currentIndex] : clipContents[0] ?? { id: '', title: '', type: 'CLIP' as const, competition: '', sport: '', date: '', viewCount: 0, tags: [] };
  const effectiveIndex = currentIndex >= 0 ? currentIndex : 0;
  const prevClip = effectiveIndex > 0 ? clipContents[effectiveIndex - 1] : null;
  const nextClip = effectiveIndex < clipContents.length - 1 ? clipContents[effectiveIndex + 1] : null;
  const videoSrc = SAMPLE_VIDEOS[effectiveIndex % SAMPLE_VIDEOS.length];

  /* ── player state ──────────────────────────────────────── */
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  /* ── auto-play on clip change ──────────────────────────── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    setProgress(0);
    setLiked(false);
    setBookmarked(false);
  }, [id]);

  /* ── progress bar update ───────────────────────────────── */
  useEffect(() => {
    const tick = () => {
      const v = videoRef.current;
      if (v && v.duration) setProgress(v.currentTime / v.duration);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* ── toggle play/pause ─────────────────────────────────── */
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
      setShowPlayIcon(true);
    } else {
      v.pause();
      setPlaying(false);
      setShowPlayIcon(true);
    }
    setTimeout(() => setShowPlayIcon(false), 600);
  }, []);

  /* ── keyboard navigation ───────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowUp' && prevClip) {
        e.preventDefault();
        navigate(`/clip/${prevClip.id}`);
      } else if (e.key === 'ArrowDown' && nextClip) {
        e.preventDefault();
        navigate(`/clip/${nextClip.id}`);
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        setMuted((p) => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prevClip, nextClip, navigate, togglePlay]);

  /* ── sync muted state ──────────────────────────────────── */
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  /* ── related clips (exclude current) ───────────────────── */
  const relatedClips = clipContents.filter((c) => c.id !== clip.id).slice(0, 6);

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden -mx-6 -mb-6">
      {/* ── Left: Video Area ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
        {/* Navigation arrows */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:pointer-events-none"
            disabled={!prevClip}
            onClick={() => prevClip && navigate(`/clip/${prevClip.id}`)}
          >
            <LuChevronUp className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:pointer-events-none"
            disabled={!nextClip}
            onClick={() => nextClip && navigate(`/clip/${nextClip.id}`)}
          >
            <LuChevronDown className="w-5 h-5" />
          </Button>
        </div>

        {/* 9:16 Video Container */}
        <div
          className="relative h-full aspect-[9/16] max-w-full bg-black rounded-lg overflow-hidden cursor-pointer"
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-cover"
            loop
            autoPlay
            playsInline
            muted={muted}
          />

          {/* Play/Pause flash indicator */}
          {showPlayIcon && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-fade-out">
              <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center">
                {playing ? <LuPlay className="w-7 h-7 text-white ml-1" /> : <LuPause className="w-7 h-7 text-white" />}
              </div>
            </div>
          )}

          {/* Mute/Unmute button */}
          <button
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            onClick={(e) => { e.stopPropagation(); setMuted((p) => !p); }}
          >
            {muted ? <LuVolumeX className="w-4 h-4" /> : <LuVolume2 className="w-4 h-4" />}
          </button>

          {/* Clip index indicator */}
          <div className="absolute top-4 left-4 z-20 bg-black/40 rounded-full px-3 py-1 text-[13px] text-white/80 font-mono">
            {effectiveIndex + 1} / {clipContents.length}
          </div>

          {/* Bottom gradient + info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-16 pointer-events-none z-10">
            <p className="text-white text-[15px] font-semibold leading-tight line-clamp-2">{clip.title}</p>
            <p className="text-white/60 text-[14px] mt-1">{clip.competition} | {clip.date}</p>
          </div>

          {/* Thin progress bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 z-20">
            <div
              className="h-full bg-primary transition-[width] duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Right: Info Panel ─────────────────────────────── */}
      <aside className="w-[360px] flex-shrink-0 border-l border-border-subtle bg-background overflow-y-auto hidden xl:block">
        <div className="p-4 flex flex-col gap-3">
          {/* Title card */}
          <div className="py-3">
            <h1 className="text-[16px] font-bold text-foreground leading-tight">{clip.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[14px] text-muted-foreground">{clip.competition}</span>
              <span className="text-[12px] text-muted-foreground/40">|</span>
              <span className="text-[14px] text-muted-foreground/60">{clip.date}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(clip.tags ?? ['야구', '유료', '해설']).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[13px]">#{tag}</Badge>
              ))}
            </div>
          </div>

          {/* YouTube-style action pills */}
          <div className="py-2 flex items-center gap-2 flex-wrap">
            <Button
              variant="action"
              size="sm"
              data-active={liked || undefined}
              onClick={() => setLiked(!liked)}
            >
              <LuThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} /> {liked ? 101 : 100}
            </Button>
            <Button variant="secondary" size="sm">
              <LuMessageSquare className="w-4 h-4" /> 23
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShareOpen(true)}>
              <LuShare2 className="w-4 h-4" /> 공유
            </Button>
            <ShareModal
              open={shareOpen}
              onClose={() => setShareOpen(false)}
              title={clip.title}
            />
            <Button
              variant="action"
              size="icon-sm"
              data-active={bookmarked || undefined}
              className="ml-auto"
              onClick={() => setBookmarked(!bookmarked)}
            >
              <LuBookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Description card */}
          <div className="py-3">
            <h3 className="text-[14px] font-semibold text-foreground mb-2">설명</h3>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              스포츠는 정해진 규칙과 공정성을 바탕으로 신체 능력, 기술, 전략, 정신력을 겨루는 인간 활동이다. 개인과 팀은 반복된 훈련과 경쟁을 통해 한계를 극복하고 성장한다.
            </p>
            <p className="text-[13px] text-muted-foreground/50 mt-2">조회수 {clip.viewCount?.toLocaleString()}</p>
          </div>

          {/* Source video link card */}
          <Link
            to="/contents/vod/v1"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border-subtle hover:bg-secondary/40 transition-colors group"
          >
            <div className="w-14 h-8 rounded bg-bg-surface-3 overflow-hidden flex-shrink-0">
              <img src={clip.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] text-foreground font-medium truncate">원본 영상 보기</p>
              <p className="text-[12px] text-muted-foreground truncate">동대문구 리틀야구 vs 군포시 리틀야구</p>
            </div>
            <LuExternalLink className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground flex-shrink-0" />
          </Link>

          {/* Related clips card */}
          <div className="py-3">
            <h3 className="text-[14px] font-semibold text-foreground mb-3">관련 클립</h3>
            <div className="grid grid-cols-2 gap-2">
              {relatedClips.map((c) => (
                <ClipCard key={c.id} id={c.id} title={c.title} viewCount={c.viewCount} thumbnailUrl={c.thumbnailUrl} />
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

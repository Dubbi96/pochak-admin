import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuPlay, LuPause, LuSkipBack, LuSkipForward,
  LuChevronLeft, LuSave, LuX, LuPlus, LuImage,
  LuType, LuMove, LuMaximize,
} from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

/* ── helpers ─────────────────────────────────────────────── */
const fmt = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`;
};

const VIDEO_URL = '/sample/video1.mp4';

type FitMode = 'fit' | 'fill';

/* ── component ───────────────────────────────────────────── */
export default function ClipEditorPage() {
  const navigate = useNavigate();

  /* refs */
  const videoRef = useRef<HTMLVideoElement>(null);
  const sourceVideoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const sourceContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  /* video state */
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  /* trim state */
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);
  const clipDuration = trimEnd - trimStart;

  /* drag state for timeline */
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);

  /* crop state - always 9:16 */
  const [fitMode, setFitMode] = useState<FitMode>('fit');
  // cropOffsetX: 0 = leftmost, 100 = rightmost of the draggable range
  const [cropOffsetX, setCropOffsetX] = useState(50);

  /* mouse drag for crop position */
  const [cropDragging, setCropDragging] = useState(false);
  const cropDragStartRef = useRef({ x: 0, offset: 0 });

  /* text overlay state */
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [topTextSize, setTopTextSize] = useState(18);
  const [bottomTextSize, setBottomTextSize] = useState(16);
  const [topTextBg, setTopTextBg] = useState(true);
  const [bottomTextBg, setBottomTextBg] = useState(true);

  /* clip settings */
  const sourceTitle = '동대문구 리틀야구 vs 군포시 리틀야구';
  const competitionInfo = '6회 MLB컵 리틀야구 U10 | 준결승';
  const [title, setTitle] = useState(`${sourceTitle} - 클립`);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState(['야구', '유료', '해설', 'MLB']);
  const [newTag, setNewTag] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  /* save modal */
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [thumbMsg, setThumbMsg] = useState('');

  /* sidebar tab */
  const [sidebarTab, setSidebarTab] = useState<'frame' | 'text' | 'info'>('frame');

  /* ── video metadata ─────────────────────────────────────── */
  const handleLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setTotalDuration(v.duration);
    setTrimEnd(Math.min(30, v.duration));
  }, []);

  /* ── play / pause - sync both videos ────────────────────── */
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    const sv = sourceVideoRef.current;
    if (!v) return;
    if (v.paused) {
      if (v.currentTime >= trimEnd || v.currentTime < trimStart) {
        v.currentTime = trimStart;
        if (sv) sv.currentTime = trimStart;
      }
      v.play().catch(() => {});
      if (sv) { sv.currentTime = v.currentTime; sv.play().catch(() => {}); }
      setPlaying(true);
    } else {
      v.pause();
      if (sv) sv.pause();
      setPlaying(false);
    }
  }, [trimStart, trimEnd]);

  /* ── rAF loop - sync source video ───────────────────────── */
  useEffect(() => {
    const tick = () => {
      const v = videoRef.current;
      const sv = sourceVideoRef.current;
      if (v && !v.paused) {
        setCurrentTime(v.currentTime);
        // sync source video
        if (sv && Math.abs(sv.currentTime - v.currentTime) > 0.3) {
          sv.currentTime = v.currentTime;
        }
        if (v.currentTime >= trimEnd) {
          v.pause();
          if (sv) sv.pause();
          v.currentTime = trimStart;
          if (sv) sv.currentTime = trimStart;
          setCurrentTime(trimStart);
          setPlaying(false);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [trimStart, trimEnd]);

  /* ── seek helpers - sync both ───────────────────────────── */
  const seekTo = useCallback((t: number) => {
    const v = videoRef.current;
    const sv = sourceVideoRef.current;
    if (!v) return;
    v.currentTime = t;
    if (sv) sv.currentTime = t;
    setCurrentTime(t);
  }, []);

  const skipBack = () => seekTo(Math.max(trimStart, currentTime - 5));
  const skipForward = () => seekTo(Math.min(trimEnd, currentTime + 5));
  const goToStart = () => seekTo(trimStart);
  const goToEnd = () => seekTo(trimEnd);
  const setAsStart = () => { if (currentTime < trimEnd - 1) setTrimStart(currentTime); };
  const setAsEnd = () => { if (currentTime > trimStart + 1) setTrimEnd(currentTime); };

  /* ── trim handle dragging ───────────────────────────────── */
  const handleMouseDown = (handle: 'start' | 'end') => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(handle);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const bar = timelineRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const time = ratio * totalDuration;
      if (dragging === 'start') setTrimStart(Math.min(time, trimEnd - 1));
      else setTrimEnd(Math.max(time, trimStart + 1));
    };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging, trimStart, trimEnd, totalDuration]);

  /* ── crop position drag on source video (horizontal) ───── */
  const handleCropMouseDown = (e: React.MouseEvent) => {
    if (fitMode !== 'fill') return;
    e.preventDefault();
    e.stopPropagation();
    setCropDragging(true);
    cropDragStartRef.current = { x: e.clientX, offset: cropOffsetX };
  };

  useEffect(() => {
    if (!cropDragging) return;
    const onMove = (e: MouseEvent) => {
      const container = sourceContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const deltaX = e.clientX - cropDragStartRef.current.x;
      // Scale delta by container width to get percentage
      const deltaPct = (deltaX / rect.width) * 150; // 150 for responsive feel
      const newOffset = Math.max(0, Math.min(100, cropDragStartRef.current.offset + deltaPct));
      setCropOffsetX(newOffset);
    };
    const onUp = () => setCropDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [cropDragging]);

  /* ── timeline click ─────────────────────────────────────── */
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).dataset.handle) return;
    const bar = timelineRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    seekTo(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * totalDuration);
  };

  /* ── tag helpers ────────────────────────────────────────── */
  const addTag = () => {
    const t = newTag.trim().replace(/^#/, '');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setNewTag('');
  };
  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  /* ── save flow ──────────────────────────────────────────── */
  const handleSave = () => {
    setSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      setSaveSuccess(true);
      setTimeout(() => { setSaving(false); setSaveSuccess(false); navigate('/my'); }, 1000);
    }, 2000);
  };

  const handleCaptureThumbnail = () => {
    setThumbMsg(`${fmt(currentTime)} 프레임이 썸네일로 설정되었습니다.`);
    setTimeout(() => setThumbMsg(''), 3000);
  };

  /* ── computed positions ─────────────────────────────────── */
  const pct = (v: number) => (totalDuration > 0 ? (v / totalDuration) * 100 : 0);
  const trimStartPct = pct(trimStart);
  const trimEndPct = pct(trimEnd);
  const playheadPct = pct(currentTime);

  /* ── 9:16 clip preview: crop box width as fraction of source ── */
  // 9:16 inside 16:9: the crop box covers (9/16)/(16/9) = 81/256 ≈ 31.64% of source width
  const cropBoxWidthPct = ((9 / 16) / (16 / 9)) * 100; // ~31.64%
  // The draggable range: left can go from 0 to (100 - cropBoxWidthPct)
  const maxLeftPct = 100 - cropBoxWidthPct;
  // cropOffsetX 0..100 maps to left 0..maxLeftPct
  const cropBoxLeftPct = (cropOffsetX / 100) * maxLeftPct;

  /* ── 9:16 video transform ───────────────────────────────── */
  const getClipVideoStyle = (): React.CSSProperties => {
    if (fitMode === 'fit') return { width: '100%', height: '100%', objectFit: 'contain' };
    // fill: use object-fit cover + object-position to control horizontal crop
    // object-position X maps cropOffsetX (0=left, 50=center, 100=right)
    return {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: `${cropOffsetX}% 50%`,
    };
  };

  /* ── render ─────────────────────────────────────────────── */
  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Top bar */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground transition-colors">
          <LuChevronLeft className="w-4 h-4" /> 돌아가기
        </button>
        <div className="h-4 w-px bg-border" />
        <div className="min-w-0">
          <h1 className="text-[15px] font-bold text-foreground truncate">{sourceTitle}</h1>
          <p className="text-[13px] text-muted-foreground truncate">{competitionInfo}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[13px] text-muted-foreground bg-card border border-border-subtle rounded px-2 py-1">클립 형식: 9:16 세로</span>
        </div>
      </div>

      <div className="flex gap-5 flex-col xl:flex-row">
        {/* ── Left: Videos + Controls + Timeline ─────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="flex gap-4">
            {/* Source video (16:9) - synced */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <p className="text-[13px] text-muted-foreground font-medium">원본 영상 (16:9)</p>
              <div
                ref={sourceContainerRef}
                className={`relative aspect-video bg-black rounded-lg overflow-hidden border border-border-subtle ${fitMode === 'fill' ? 'cursor-grab active:cursor-grabbing' : ''}`}
                onMouseDown={handleCropMouseDown}
                onClick={(e) => { if (!cropDragging) { e.stopPropagation(); togglePlay(); } }}
              >
                <video
                  ref={sourceVideoRef}
                  src={VIDEO_URL}
                  className="w-full h-full object-contain pointer-events-none"
                  preload="metadata"
                  playsInline
                  muted
                />

                {/* Crop region overlay for fill mode */}
                {fitMode === 'fill' && (
                  <>
                    {/* Dim left side */}
                    <div
                      className="absolute top-0 left-0 h-full bg-black/60 pointer-events-none z-10"
                      style={{ width: `${cropBoxLeftPct}%` }}
                    />
                    {/* Dim right side */}
                    <div
                      className="absolute top-0 right-0 h-full bg-black/60 pointer-events-none z-10"
                      style={{ width: `${100 - cropBoxLeftPct - cropBoxWidthPct}%` }}
                    />
                    {/* Crop box border */}
                    <div
                      className="absolute top-0 h-full border-2 border-green-500 pointer-events-none z-10"
                      style={{ left: `${cropBoxLeftPct}%`, width: `${cropBoxWidthPct}%` }}
                    />
                    {/* Drag hint */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 rounded-full px-3 py-1 text-[12px] text-green-400 pointer-events-none flex items-center gap-1 z-20">
                      <LuMove className="w-3 h-3" /> 좌우로 드래그하여 위치 조절
                    </div>
                  </>
                )}

                {/* Play overlay */}
                {!playing && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="w-12 h-12 rounded-full bg-black/50 border border-white/20 flex items-center justify-center">
                      <LuPlay className="w-5 h-5 text-white ml-0.5" />
                    </div>
                  </div>
                )}

                <div className="absolute top-2 left-2 bg-black/70 rounded px-2 py-0.5 text-[12px] text-white font-mono pointer-events-none z-20">
                  {fmt(currentTime)}
                </div>
              </div>
            </div>

            {/* 9:16 Clip Preview */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <p className="text-[13px] text-muted-foreground font-medium">클립 프리뷰 (9:16)</p>
              <div
                className="relative bg-black rounded-lg overflow-hidden border border-primary/30"
                style={{ width: 200, aspectRatio: '9/16' }}
                onClick={togglePlay}
              >
                <video
                  ref={videoRef}
                  src={VIDEO_URL}
                  className="pointer-events-none"
                  style={getClipVideoStyle()}
                  onLoadedMetadata={handleLoadedMetadata}
                  preload="metadata"
                  playsInline
                />

                {/* Top text overlay */}
                {topText && (
                  <div className="absolute top-0 left-0 right-0 z-10 flex justify-center p-2 pointer-events-none">
                    <span
                      className="text-white font-bold text-center leading-tight break-words max-w-[90%] whitespace-pre-wrap"
                      style={{
                        fontSize: Math.max(10, topTextSize * 0.65),
                        background: topTextBg ? 'rgba(0,0,0,0.6)' : 'none',
                        padding: topTextBg ? '3px 8px' : 0,
                        borderRadius: topTextBg ? 4 : 0,
                      }}
                    >
                      {topText}
                    </span>
                  </div>
                )}

                {/* Bottom text overlay */}
                {bottomText && (
                  <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center p-2 pointer-events-none">
                    <span
                      className="text-white font-bold text-center leading-tight break-words max-w-[90%] whitespace-pre-wrap"
                      style={{
                        fontSize: Math.max(10, bottomTextSize * 0.65),
                        background: bottomTextBg ? 'rgba(0,0,0,0.6)' : 'none',
                        padding: bottomTextBg ? '3px 8px' : 0,
                        borderRadius: bottomTextBg ? 4 : 0,
                      }}
                    >
                      {bottomText}
                    </span>
                  </div>
                )}

                {/* 9:16 badge */}
                <div className="absolute top-2 right-2 bg-primary/80 rounded px-1.5 py-0.5 text-[11px] text-primary-foreground font-mono pointer-events-none">
                  9:16
                </div>

                {/* Play overlay */}
                {!playing && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center">
                      <LuPlay className="w-4 h-4 text-white ml-0.5" />
                    </div>
                  </div>
                )}
              </div>

              {/* Fit mode toggle */}
              <div className="w-[200px] flex flex-col gap-2">
                <div className="flex rounded-lg overflow-hidden border border-border-subtle">
                  <button
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[12px] transition-colors ${fitMode === 'fit' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setFitMode('fit')}
                  >
                    <LuMaximize className="w-3 h-3" /> 전체 넣기
                  </button>
                  <button
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[12px] transition-colors ${fitMode === 'fill' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setFitMode('fill')}
                  >
                    <LuMove className="w-3 h-3" /> 화면 채우기
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground/60 text-center">
                  {fitMode === 'fit' ? '영상 전체가 보입니다 (위아래 여백)' : '원본 영상을 좌우로 드래그하여 위치 조절'}
                </p>
              </div>
            </div>
          </div>

          {/* ── Playback controls ────────────────────────────── */}
          <div className="bg-card rounded-lg border border-border-subtle p-3">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={goToStart}><LuSkipBack className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={skipBack}><span className="text-xs font-mono">-5s</span></Button>
              <Button size="sm" className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                {playing ? <LuPause className="w-5 h-5" /> : <LuPlay className="w-5 h-5 ml-0.5" />}
              </Button>
              <Button variant="outline" size="sm" onClick={skipForward}><span className="text-xs font-mono">+5s</span></Button>
              <Button variant="outline" size="sm" onClick={goToEnd}><LuSkipForward className="w-4 h-4" /></Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button variant="outline" size="sm" onClick={setAsStart}><span className="text-xs font-bold">[</span><span className="text-[12px] ml-1">시작점</span></Button>
              <Button variant="outline" size="sm" onClick={setAsEnd}><span className="text-[12px] mr-1">종료점</span><span className="text-xs font-bold">]</span></Button>
              <div className="w-px h-6 bg-border mx-1" />
              <span className="text-[14px] font-mono text-muted-foreground">{fmt(currentTime)} / {fmt(totalDuration)}</span>
            </div>
          </div>

          {/* ── Trim timeline ────────────────────────────────── */}
          <div className="py-3 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[14px] font-semibold text-foreground">구간 선택</h3>
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-muted-foreground font-mono">{fmt(trimStart)} ~ {fmt(trimEnd)}</span>
                <span className="text-[15px] text-primary font-mono font-bold">클립 {fmt(clipDuration)}</span>
              </div>
            </div>

            <div ref={timelineRef} className="relative h-[40px] bg-bg-surface-3 rounded-md cursor-pointer overflow-visible select-none" onClick={handleTimelineClick}>
              <div className="absolute inset-0 flex items-center px-1 rounded-md overflow-hidden">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="flex-1 mx-px bg-white/[0.06] rounded-sm" style={{ height: `${20 + Math.sin(i * 0.5) * 15 + Math.cos(i * 0.3) * 10}%` }} />
                ))}
              </div>
              <div className="absolute top-0 left-0 h-full bg-black/60 z-10 rounded-l-md" style={{ width: `${trimStartPct}%` }} />
              <div className="absolute top-0 right-0 h-full bg-black/60 z-10 rounded-r-md" style={{ width: `${100 - trimEndPct}%` }} />
              <div className="absolute top-0 h-full border-y-2 border-green-500/60 bg-green-500/[0.1] z-10" style={{ left: `${trimStartPct}%`, width: `${trimEndPct - trimStartPct}%` }} />
              <div data-handle="start" className="absolute top-0 h-full w-3 bg-green-500 rounded-l-sm cursor-ew-resize z-20 flex items-center justify-center hover:bg-green-400 transition-colors" style={{ left: `${trimStartPct}%` }} onMouseDown={handleMouseDown('start')}>
                <div className="w-0.5 h-4 bg-white/70 rounded-full" />
              </div>
              <div data-handle="end" className="absolute top-0 h-full w-3 bg-green-500 rounded-r-sm cursor-ew-resize z-20 flex items-center justify-center hover:bg-green-400 transition-colors" style={{ left: `calc(${trimEndPct}% - 12px)` }} onMouseDown={handleMouseDown('end')}>
                <div className="w-0.5 h-4 bg-white/70 rounded-full" />
              </div>
              <div className="absolute top-0 h-full w-0.5 bg-white z-30 pointer-events-none" style={{ left: `${playheadPct}%` }}>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full shadow" />
              </div>
            </div>

            <div className="relative h-5">
              <span className="absolute text-[12px] text-green-400 font-mono -translate-x-1/2" style={{ left: `${trimStartPct}%` }}>{fmt(trimStart)}</span>
              <span className="absolute text-[12px] text-green-400 font-mono -translate-x-1/2" style={{ left: `${trimEndPct}%` }}>{fmt(trimEnd)}</span>
            </div>
          </div>
        </div>

        {/* ── Right sidebar ─────────────────────────────────── */}
        <aside className="w-full xl:w-[300px] flex-shrink-0 flex flex-col gap-4">
          <div className="flex rounded-lg overflow-hidden border border-border-subtle">
            {([
              { id: 'frame' as const, label: '화면 설정', icon: LuImage },
              { id: 'text' as const, label: '텍스트', icon: LuType },
              { id: 'info' as const, label: '클립 정보', icon: LuSave },
            ]).map((tab) => (
              <button
                key={tab.id}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium transition-colors ${
                  sidebarTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setSidebarTab(tab.id)}
              >
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>

          {/* ── Frame tab ──────────────────────────────────── */}
          {sidebarTab === 'frame' && (
            <div className="flex flex-col gap-4">
              <div className="py-3 flex flex-col gap-3">
                <h3 className="text-[15px] font-bold text-foreground">썸네일 설정</h3>
                <Button variant="outline" className="w-full gap-2" onClick={handleCaptureThumbnail}>
                  <LuImage className="w-4 h-4" /> 현재 프레임 캡처
                </Button>
                {thumbMsg && <p className="text-[14px] text-green-400 animate-pulse">{thumbMsg}</p>}
              </div>
              <div className="py-3 flex flex-col gap-2">
                <h3 className="text-[15px] font-bold text-foreground">화면 크롭</h3>
                <p className="text-[13px] text-muted-foreground">
                  {fitMode === 'fit'
                    ? '16:9 원본 영상이 9:16 프레임 안에 전체 표시됩니다. 위아래 검정 여백이 생깁니다.'
                    : '16:9 원본 영상을 잘라서 9:16 화면을 채웁니다. 원본 영상을 마우스로 드래그하여 보이는 영역을 조절하세요.'}
                </p>
              </div>
            </div>
          )}

          {/* ── Text tab ───────────────────────────────────── */}
          {sidebarTab === 'text' && (
            <div className="flex flex-col gap-4">
              <div className="py-3 flex flex-col gap-3">
                <h3 className="text-[15px] font-bold text-foreground">상단 텍스트</h3>
                <textarea value={topText} onChange={(e) => setTopText(e.target.value)} placeholder="상단에 표시할 텍스트" rows={2} className="w-full rounded-lg border border-border bg-bg-surface-2 text-[14px] text-foreground placeholder:text-muted-foreground/70 resize-none p-2.5 outline-none focus:border-primary/55 focus:ring-1 focus:ring-primary/10 transition-colors" />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-[13px] text-muted-foreground whitespace-nowrap">크기</label>
                    <input type="range" min={12} max={32} value={topTextSize} onChange={(e) => setTopTextSize(Number(e.target.value))} className="flex-1 h-1.5 bg-pochak-border rounded-full appearance-none cursor-pointer accent-green-500" />
                    <span className="text-[12px] text-muted-foreground font-mono w-6 text-right">{topTextSize}</span>
                  </div>
                  <button className={`px-2 py-1 rounded text-[12px] border transition-colors ${topTextBg ? 'border-primary bg-primary/20 text-primary' : 'border-border text-muted-foreground'}`} onClick={() => setTopTextBg(!topTextBg)}>배경</button>
                </div>
              </div>
              <div className="py-3 flex flex-col gap-3">
                <h3 className="text-[15px] font-bold text-foreground">하단 텍스트</h3>
                <textarea value={bottomText} onChange={(e) => setBottomText(e.target.value)} placeholder="하단에 표시할 텍스트" rows={2} className="w-full rounded-lg border border-border bg-bg-surface-2 text-[14px] text-foreground placeholder:text-muted-foreground/70 resize-none p-2.5 outline-none focus:border-primary/55 focus:ring-1 focus:ring-primary/10 transition-colors" />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-[13px] text-muted-foreground whitespace-nowrap">크기</label>
                    <input type="range" min={12} max={32} value={bottomTextSize} onChange={(e) => setBottomTextSize(Number(e.target.value))} className="flex-1 h-1.5 bg-pochak-border rounded-full appearance-none cursor-pointer accent-green-500" />
                    <span className="text-[12px] text-muted-foreground font-mono w-6 text-right">{bottomTextSize}</span>
                  </div>
                  <button className={`px-2 py-1 rounded text-[12px] border transition-colors ${bottomTextBg ? 'border-primary bg-primary/20 text-primary' : 'border-border text-muted-foreground'}`} onClick={() => setBottomTextBg(!bottomTextBg)}>배경</button>
                </div>
              </div>
              <p className="text-[13px] text-muted-foreground/60 px-1">클립 프리뷰에서 실시간으로 텍스트가 표시됩니다.</p>
            </div>
          )}

          {/* ── Info tab ───────────────────────────────────── */}
          {sidebarTab === 'info' && (
            <div className="flex flex-col gap-4">
              <div className="py-3 flex flex-col gap-4">
                <h3 className="text-[15px] font-bold text-foreground">클립 정보</h3>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] text-muted-foreground">클립 제목</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="클립 제목을 입력하세요" className="h-9 text-[14px]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] text-muted-foreground">설명</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="클립에 대한 설명을 입력하세요" rows={3}
                    className="flex w-full rounded-lg border border-border bg-bg-surface-2 text-[14px] text-foreground placeholder:text-muted-foreground/70 transition-[border-color,background-color,box-shadow] duration-200 hover:border-border-hover focus-visible:outline-none focus-visible:border-primary/55 focus-visible:ring-4 focus-visible:ring-primary/10 resize-none p-3" />
                </div>
              </div>
              <div className="py-3 flex flex-col gap-3">
                <h3 className="text-[15px] font-bold text-foreground">태그</h3>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1.5">#{tag}<button onClick={() => removeTag(tag)} className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"><LuX className="w-3 h-3" /></button></Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); addTag(); } }} placeholder="태그 추가" className="h-8 text-[14px] flex-1" />
                  <Button variant="outline" size="sm" onClick={addTag} className="h-8 px-2"><LuPlus className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <div className="py-3 flex flex-col gap-3">
                <h3 className="text-[15px] font-bold text-foreground">공개 설정</h3>
                <div className="flex flex-col gap-2">
                  {(['public', 'private'] as const).map((opt) => (
                    <button key={opt} className="flex items-center gap-3 cursor-pointer group" onClick={() => setVisibility(opt)}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${visibility === opt ? 'border-primary bg-primary' : 'border-border group-hover:border-border-hover'}`}>
                        {visibility === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className={`text-[14px] ${visibility === opt ? 'text-foreground' : 'text-muted-foreground'}`}>{opt === 'public' ? '전체공개' : '나만보기'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button className="w-full bg-green-600 hover:bg-green-700 gap-2" onClick={handleSave}><LuSave className="w-4 h-4" /> 저장</Button>
            <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>취소</Button>
          </div>
        </aside>
      </div>

      {/* Saving overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-8 text-center flex flex-col gap-4 min-w-[300px]">
            {!saveSuccess ? (
              <>
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[15px] text-foreground font-semibold">클립 저장 중...</p>
                <p className="text-[14px] text-muted-foreground">잠시만 기다려주세요</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-[15px] text-foreground font-semibold">클립이 저장되었습니다!</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

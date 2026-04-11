interface BadgeProps {
  variant: 'live' | 'vod' | 'clip' | 'free' | 'ad' | 'scheduled';
  className?: string;
}

const config: Record<string, { label: string; className: string }> = {
  live:      { label: 'LIVE',   className: 'bg-pochak-live text-white font-bold tracking-wider' },
  vod:       { label: 'VOD',    className: 'bg-white/[0.08] text-white/80 border border-white/[0.06]' },
  clip:      { label: 'CLIP',   className: 'bg-white/[0.08] text-white/80 border border-white/[0.06]' },
  free:      { label: '무료',   className: 'bg-pochak-info/90 text-white font-semibold' },
  ad:        { label: 'AD',     className: 'bg-black/50 text-white/40' },
  scheduled: { label: '예정',   className: 'bg-white/[0.06] text-white/60 border border-white/[0.06]' },
};

export default function Badge({ variant, className = '' }: BadgeProps) {
  const c = config[variant] ?? config.vod;
  return (
    <span className={`inline-flex items-center h-[18px] px-1.5 rounded text-[10px] uppercase tracking-[0.06em] font-semibold leading-none select-none ${c.className} ${className}`}>
      {c.label}
    </span>
  );
}

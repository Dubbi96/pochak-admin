import { MoreHorizontal } from 'lucide-react';

/* ── Sub-tab pill chips ──────────────────────────────────────── */
export function SubTabChips<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: T; label: string }[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <div className="flex gap-2 mb-6">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
            active === t.key
              ? 'bg-[#00CC33] text-[#1A1A1A]'
              : 'bg-[#262626] text-[#A6A6A6] hover:text-white'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ── Three-dot menu button (for cards) ───────────────────────── */
export function DotMenu() {
  return (
    <button className="text-[#A6A6A6] hover:text-white transition-colors">
      <MoreHorizontal className="h-4 w-4" />
    </button>
  );
}

/* ── Duration formatter ──────────────────────────────────────── */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

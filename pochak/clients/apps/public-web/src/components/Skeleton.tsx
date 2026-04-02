/**
 * Phase 8: Skeleton loaders for public-web loading states.
 */

export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video bg-[#262626] rounded-lg" />
      <div className="mt-3 h-4 bg-[#262626] rounded w-3/4" />
      <div className="mt-2 h-3 bg-[#262626] rounded w-1/2" />
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[21/8] w-full bg-[#262626] rounded-lg" />
      <div className="mt-3 h-0.5 bg-[#404040] rounded-full" />
    </div>
  );
}

export function CompetitionCardSkeleton() {
  return (
    <div className="animate-pulse flex-shrink-0 w-[260px] bg-[#262626] rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-3 space-y-2">
          <div className="h-5 bg-[#404040] rounded w-3/4" />
          <div className="h-4 bg-[#404040] rounded w-1/2" />
          <div className="h-4 bg-[#404040] rounded w-2/3 mt-2" />
        </div>
        <div className="w-12 h-12 rounded-lg bg-[#404040]" />
      </div>
    </div>
  );
}

export function LiveCardSkeleton() {
  return (
    <div className="animate-pulse flex-shrink-0 w-[240px]">
      <div className="bg-[#262626] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="w-7 h-7 rounded bg-[#404040]" />
          <div className="w-12 h-5 rounded bg-[#404040]" />
        </div>
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#404040]" />
          <div className="w-6 h-4 bg-[#404040] rounded" />
          <div className="w-10 h-10 rounded-full bg-[#404040]" />
        </div>
      </div>
      <div className="mt-2 px-1 space-y-1.5">
        <div className="h-4 bg-[#262626] rounded w-full" />
        <div className="h-3 bg-[#262626] rounded w-2/3" />
      </div>
    </div>
  );
}

export function ClipCardSkeleton() {
  return (
    <div className="animate-pulse flex-shrink-0 w-[180px]">
      <div className="aspect-[9/16] bg-[#262626] rounded-lg" />
      <div className="mt-2 h-3 bg-[#262626] rounded w-3/4" />
      <div className="mt-1 h-3 bg-[#262626] rounded w-1/2" />
    </div>
  );
}

export function HVideoCardSkeleton() {
  return (
    <div className="animate-pulse flex-shrink-0 w-[280px]">
      <div className="aspect-video bg-[#262626] rounded-lg" />
      <div className="mt-2 h-4 bg-[#262626] rounded w-full" />
      <div className="mt-1 h-3 bg-[#262626] rounded w-2/3" />
    </div>
  );
}

/** Row of skeleton cards for section loading */
export function SectionSkeleton({ count = 4, variant = 'horizontal' }: { count?: number; variant?: 'horizontal' | 'clip' }) {
  const cards = Array.from({ length: count });
  if (variant === 'clip') {
    return (
      <div className="flex gap-5 overflow-hidden">
        {cards.map((_, i) => (
          <ClipCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className="flex gap-5 overflow-hidden">
      {cards.map((_, i) => (
        <HVideoCardSkeleton key={i} />
      ))}
    </div>
  );
}

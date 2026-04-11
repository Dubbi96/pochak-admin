/* Skeleton / shimmer loading components */

export function SkeletonBox({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function BannerSkeleton() {
  return (
    <div className="animate-fade-in">
      <SkeletonBox className="w-full h-[400px] xl:h-[460px] rounded-2xl" />
      <div className="flex justify-center gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <SkeletonBox key={i} className="w-2 h-2 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[220px]">
      <SkeletonBox className="aspect-video rounded-xl" />
      <div className="mt-3 flex gap-3">
        <SkeletonBox className="w-9 h-9 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-3 w-3/4 mt-2" />
          <SkeletonBox className="h-3 w-1/2 mt-1.5" />
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return <VideoCardSkeleton />;
}

export function ClipCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[155px]">
      <SkeletonBox className="aspect-[3/4] rounded-xl" />
    </div>
  );
}

export function ClipSkeleton() {
  return <ClipCardSkeleton />;
}

export function TeamCardSkeleton() {
  return (
    <div className="flex-shrink-0 flex flex-col items-center w-[140px] py-3 px-2">
      <SkeletonBox className="w-[88px] h-[88px] rounded-full" />
      <SkeletonBox className="h-3 w-20 mt-3" />
      <SkeletonBox className="h-3 w-16 mt-1.5" />
    </div>
  );
}

export function GridSkeleton({ count = 8, type = 'video' }: { count?: number; type?: 'video' | 'clip' | 'team' }) {
  if (type === 'clip') {
    return (
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <ClipCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <SkeletonBox className="aspect-video rounded-xl" />
          <div className="mt-3 flex gap-3">
            <SkeletonBox className="w-9 h-9 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-3 w-3/4 mt-2" />
              <SkeletonBox className="h-3 w-1/2 mt-1.5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HScrollRowSkeleton({ count = 5, type = 'video' }: { count?: number; type?: 'video' | 'clip' | 'team' }) {
  const Component = type === 'clip' ? ClipCardSkeleton : type === 'team' ? TeamCardSkeleton : VideoCardSkeleton;
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-pochak-border" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-[14px] text-pochak-text-secondary tracking-wider uppercase">Loading</p>
      </div>
    </div>
  );
}

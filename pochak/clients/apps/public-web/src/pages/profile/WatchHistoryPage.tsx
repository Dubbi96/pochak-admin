import { useState } from 'react';
import HVideoCard from '@/components/HVideoCard';
import VClipCard from '@/components/VClipCard';
import { pochakVodContents, pochakClips } from '@/services/webApi';
import { SubTabChips, DotMenu, formatDuration } from './shared';

export default function WatchHistoryPage() {
  const [sub, setSub] = useState<'video' | 'clip'>('video');

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">시청내역</h1>

      <SubTabChips
        tabs={[
          { key: 'video' as const, label: '영상' },
          { key: 'clip' as const, label: '클립' },
        ]}
        active={sub}
        onChange={setSub}
      />

      {sub === 'video' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {[...pochakVodContents, ...pochakVodContents].slice(0, 24).map((v, i) => (
            <div key={`${v.id}-${i}`} className="relative">
              <HVideoCard
                title={v.title}
                sub={v.competition ?? ''}
                duration={v.duration ? formatDuration(v.duration) : undefined}
                tags={v.tags.slice(0, 4)}
                thumbnailUrl={v.thumbnailUrl}
                linkTo={`/contents/vod/${v.id}`}
                className="w-full"
              />
              <div className="absolute top-2 right-2 z-10">
                <DotMenu />
              </div>
            </div>
          ))}
        </div>
      )}

      {sub === 'clip' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {[...pochakClips, ...pochakClips, ...pochakClips, ...pochakClips].slice(0, 32).map((clip, i) => (
            <div key={`${clip.id}-${i}`} className="relative">
              <VClipCard
                title={clip.title}
                viewCount={clip.viewCount}
                linkTo={`/clip/${clip.id}`}
                className="w-full"
              />
              <div className="absolute top-2 right-2 z-10">
                <DotMenu />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

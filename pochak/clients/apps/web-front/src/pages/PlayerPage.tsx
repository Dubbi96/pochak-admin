import { useParams } from 'react-router-dom';
import VideoPlayer from '@/components/VideoPlayer';
import type { TimelineEvent, Chapter } from '@/components/VideoPlayer';

// Mock stream URLs for development
const MOCK_STREAMS: Record<string, { url: string; isLive: boolean; title: string }> = {
  live: {
    url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    isLive: true,
    title: 'LIVE 중계',
  },
  vod: {
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    isLive: false,
    title: 'VOD 다시보기',
  },
};

const MOCK_EVENTS: TimelineEvent[] = [
  { id: 'e1', time: 120, label: '골! 홈팀 선제골', type: 'GOAL', teamName: '홈팀' },
  { id: 'e2', time: 300, label: '파울', type: 'FOUL', teamName: '원정팀' },
  { id: 'e3', time: 600, label: '하이라이트 장면', type: 'HIGHLIGHT' },
  { id: 'e4', time: 900, label: '선수 교체', type: 'SUBSTITUTION', teamName: '홈팀' },
];

const MOCK_CHAPTERS: Chapter[] = [
  { id: 'c1', title: '전반전', startTime: 0, endTime: 2700, type: 'HALF' },
  { id: 'c2', title: '하프타임', startTime: 2700, endTime: 3600, type: 'BREAK' },
  { id: 'c3', title: '후반전', startTime: 3600, endTime: 6300, type: 'HALF' },
];

export default function PlayerPage() {
  const { type, id } = useParams<{ type: string; id: string }>();

  const streamKey = type === 'live' ? 'live' : 'vod';
  const stream = MOCK_STREAMS[streamKey];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Title */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>
          {stream.title}
        </h1>
        {id && (
          <p style={{ fontSize: '14px', color: '#A6A6A6', marginTop: '4px' }}>
            콘텐츠 ID: {id}
          </p>
        )}
      </div>

      {/* Video Player */}
      <VideoPlayer
        src={stream.url}
        isLive={stream.isLive}
        autoPlay={stream.isLive}
        events={stream.isLive ? [] : MOCK_EVENTS}
        chapters={stream.isLive ? [] : MOCK_CHAPTERS}
        onTimeUpdate={(current, duration) => {
          void current;
          void duration;
        }}
        onEnded={() => {
          // Handle video end
        }}
      />
    </div>
  );
}

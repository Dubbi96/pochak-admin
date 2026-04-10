import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Edit3 } from 'lucide-react';
import TabBar from '@/components/TabBar';
import HScrollRow from '@/components/HScrollRow';
import SectionHeader from '@/components/SectionHeader';
import HVideoCard from '@/components/HVideoCard';
import VClipCard from '@/components/VClipCard';
import {
  fetchMyProfile,
  pochakVodContents,
  pochakClips,
  pochakCompetitions,
  pochakChannels,
} from '@/services/webApi';
import type { UserProfile } from '@/services/webApi';

/* ── Tab definitions ────────────────────────────────────────── */
type TabKey = 'home' | 'history' | 'myclip' | 'reservation' | 'favorites';
const tabItems: { key: TabKey; label: string }[] = [
  { key: 'home', label: '홈' },
  { key: 'history', label: '시청이력' },
  { key: 'myclip', label: '내클립' },
  { key: 'reservation', label: '시청예약' },
  { key: 'favorites', label: '즐겨찾기' },
];

/* ── Helpers ─────────────────────────────────────────────────── */

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 3))}@${domain}`;
}

/* ── 홈 Tab ──────────────────────────────────────────────────── */
function HomeTab() {
  return (
    <div className="space-y-10">
      {/* 최근 본 영상 */}
      <section>
        <SectionHeader prefix="최근 본" highlight="영상" linkTo="/my/history" showSort />
        <HScrollRow scrollAmount={300}>
          {pochakVodContents.slice(0, 6).map((v) => (
            <div key={v.id} className="flex-shrink-0 w-[280px]">
              <HVideoCard
                title={v.title}
                sub={v.competition ?? ''}
                duration={v.duration ? formatDuration(v.duration) : undefined}
                tags={v.tags.slice(0, 4)}
                thumbnailUrl={v.thumbnailUrl}
                linkTo={`/contents/vod/${v.id}`}
                className="w-full"
              />
            </div>
          ))}
        </HScrollRow>
      </section>

      {/* 최근 본 클립 */}
      <section>
        <SectionHeader prefix="최근 본" highlight="클립" linkTo="/my/history" showSort />
        <HScrollRow scrollAmount={200}>
          {pochakClips.slice(0, 8).map((clip) => (
            <VClipCard
              key={clip.id}
              title={clip.title}
              viewCount={clip.viewCount}
              linkTo={`/clip/${clip.id}`}
            />
          ))}
        </HScrollRow>
      </section>

      {/* 내 클립 */}
      <section>
        <SectionHeader prefix="내" highlight="클립" linkTo="/my/myclip" showSort />
        <HScrollRow scrollAmount={200}>
          {pochakClips.slice(2, 8).map((clip) => (
            <VClipCard
              key={clip.id}
              title={clip.title}
              viewCount={clip.viewCount}
              linkTo={`/clip/${clip.id}`}
            />
          ))}
        </HScrollRow>
      </section>

      {/* 즐겨찾는 대회 */}
      <section>
        <SectionHeader prefix="즐겨찾는" highlight="대회" linkTo="/my/favorites" showSort />
        <HScrollRow scrollAmount={260}>
          {pochakCompetitions.slice(0, 4).map((comp) => (
            <Link
              key={comp.id}
              to={`/competition/${comp.id}`}
              className="flex-shrink-0 w-[220px] group cursor-pointer"
            >
              <div
                className="aspect-[3/2] rounded-xl flex items-center justify-center group-hover:ring-1 group-hover:ring-[#00CC33] transition-all overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${comp.logoColor}CC, ${comp.logoColor}66)`,
                }}
              >
                <span className="text-white text-2xl font-black drop-shadow-lg">{comp.logoText}</span>
              </div>
              <p className="mt-2 text-[15px] font-semibold text-white leading-tight line-clamp-1 group-hover:text-[#00CC33] transition-colors">
                {comp.name}
              </p>
              <p className="text-[13px] text-[#A6A6A6] mt-0.5">{comp.dateRange}</p>
            </Link>
          ))}
        </HScrollRow>
      </section>

      {/* 즐겨찾는 팀/클럽 */}
      <section>
        <SectionHeader prefix="즐겨찾는" highlight="팀/클럽" linkTo="/my/favorites" showSort />
        <HScrollRow scrollAmount={200}>
          {pochakChannels.slice(0, 9).map((ch) => (
            <div key={ch.id} className="flex-shrink-0 flex flex-col items-center gap-1.5 w-[100px]">
              <div
                className="w-[80px] h-[80px] rounded-full flex items-center justify-center text-lg font-bold text-white border-2 border-[#4D4D4D]"
                style={{ backgroundColor: ch.color }}
              >
                {ch.initial}
              </div>
              <p className="text-[13px] text-white text-center truncate w-full">{ch.name}</p>
              <p className="text-[11px] text-[#A6A6A6] text-center truncate w-full">{ch.subtitle}</p>
            </div>
          ))}
        </HScrollRow>
      </section>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function MyPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  useEffect(() => {
    fetchMyProfile().then((data) => {
      if (data) setProfile(data);
      else setProfileError(true);
    }).catch(() => { setProfileError(true); });
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto overflow-x-hidden">
      {/* ── Sticky header: Profile + Tabs ─────────────────────── */}
      <div className="sticky top-[70px] z-30 bg-[#1A1A1A]">
        <section className="flex items-center gap-5 px-6 pt-8 pb-4">
          <div className="flex-shrink-0 flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[#262626] border-2 border-[#4D4D4D]">
            <User className="h-10 w-10 text-[#A6A6A6]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[20px] font-semibold text-white">{profileError ? '데이터를 불러올 수 없습니다' : (profile?.nickname || '홍길동')}</p>
              <button className="text-[#A6A6A6] hover:text-white transition-colors" onClick={() => navigate('/account')}>
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[15px] text-[#A6A6A6] mt-1">{profile ? maskEmail(profile.email) : ''}</p>
          </div>
        </section>

        <div className="px-6">
          <TabBar tabs={tabItems} activeTab={activeTab} onTabChange={(tab: TabKey) => {
            switch (tab) {
              case 'home': setActiveTab('home'); break;
              case 'history': navigate('/my/history'); break;
              case 'myclip': navigate('/my/clips'); break;
              case 'reservation': navigate('/my/reservations'); break;
              case 'favorites': navigate('/my/favorites'); break;
            }
          }} />
        </div>
      </div>

      {/* ── Tab content (stable layout, overflow-hidden prevents width shift) ── */}
      <div className="px-6 pt-6 pb-8 min-h-[calc(100vh-320px)] overflow-x-hidden">
        {activeTab === 'home' && <HomeTab />}
      </div>
    </div>
  );
}

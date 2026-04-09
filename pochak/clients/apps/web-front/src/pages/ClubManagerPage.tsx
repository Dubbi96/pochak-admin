import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  LuUsers,
  LuActivity,
  LuUserPlus,
  LuFileText,
  LuSearch,
  LuMessageSquare,
  LuTrophy,
  LuLogIn,
  LuHeart,
  LuTrash2,
} from 'react-icons/lu';
import FilterChip from '@/components/FilterChip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useClubDetail, useClubMembers } from '@/hooks/useApi';

const tabs = ['대시보드', '멤버 관리', '설정', '게시글 관리'] as const;
type Tab = (typeof tabs)[number];

const recentActivities = [
  { icon: LuMessageSquare, name: '김민준', action: '게시글에 댓글을 남겼습니다', time: '5분 전' },
  { icon: LuLogIn, name: '이서연', action: '클럽에 가입했습니다', time: '1시간 전' },
  { icon: LuTrophy, name: '박지호', action: '경기 결과를 등록했습니다', time: '2시간 전' },
  { icon: LuHeart, name: '최수아', action: '게시글에 좋아요를 눌렀습니다', time: '3시간 전' },
  { icon: LuFileText, name: '정우진', action: '새 게시글을 작성했습니다', time: '5시간 전' },
];

const sportCategories = ['축구', '야구', '농구', '배구', '풋살', '테니스', '배드민턴', '기타'];

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    MANAGER: '매니저',
    PLAYER: '멤버',
    COACH: '코치',
    STAFF: '스태프',
  };
  return map[role] ?? role;
}

/* ── Page Component ── */

export default function ClubManagerPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: club } = useClubDetail(id);
  const { data: clubMembers, loading: membersLoading } = useClubMembers(id);

  const [activeTab, setActiveTab] = useState<Tab>('대시보드');
  const [memberSearch, setMemberSearch] = useState('');
  const [clubName, setClubName] = useState('');
  const [clubDesc, setClubDesc] = useState('');
  const [sportCategory, setSportCategory] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (club) {
      setClubName(club.name);
      setClubDesc(club.customization?.introText ?? club.description ?? '');
      setSportCategory(club.sportName ?? '');
    }
  }, [club]);

  const pendingCount = clubMembers.filter((m) => m.approvalStatus === 'PENDING').length;
  const approvedMembers = clubMembers.filter((m) => m.approvalStatus === 'APPROVED');

  const statsCards = [
    { label: '총 멤버', value: `${club?.memberCount ?? 0}명`, icon: LuUsers, color: 'rgba(16,185,92,0.15)', iconColor: 'text-primary' },
    { label: '이번 주 활동', value: '–', icon: LuActivity, color: 'rgba(59,130,246,0.15)', iconColor: 'text-blue-400' },
    { label: '새 가입 신청', value: `${pendingCount}건`, icon: LuUserPlus, color: 'rgba(251,146,60,0.15)', iconColor: 'text-orange-400' },
    { label: '게시글', value: '–', icon: LuFileText, color: 'rgba(168,85,247,0.15)', iconColor: 'text-purple-400' },
  ];

  const filteredMembers = approvedMembers.filter(
    (m) => !memberSearch || (m.nickname ?? String(m.userId)).includes(memberSearch)
  );

  return (
    <div className="md:px-6 lg:px-8 flex flex-col gap-6">
      {/* Page title */}
      <h1 className="text-[22px] font-bold tracking-[-0.03em] text-white">클럽 관리</h1>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-white/[0.06]">
        {tabs.map((tab) => (
          <FilterChip
            key={tab}
            label={tab}
            selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            size="md"
          />
        ))}
      </div>

      {/* ── 대시보드 ── */}
      {activeTab === '대시보드' && (
        <div className="flex flex-col gap-6">
          {/* Stats cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-border-subtle bg-pochak-bg-elevated p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-white/50">{card.label}</span>
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: card.color }}
                  >
                    <card.icon className={`h-4.5 w-4.5 ${card.iconColor}`} />
                  </div>
                </div>
                <p className="text-[24px] font-bold tracking-[-0.02em] text-white">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="rounded-xl border border-border-subtle bg-pochak-bg-elevated p-5">
            <h2 className="text-[16px] font-semibold text-white mb-4">최근 활동</h2>
            <div className="flex flex-col gap-0">
              {recentActivities.map((activity, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 py-3.5 px-1 ${
                    i < recentActivities.length - 1 ? 'border-b border-border-subtle' : ''
                  }`}
                >
                  <div className="h-9 w-9 rounded-full bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                    <activity.icon className="h-4 w-4 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-white/85">
                      <span className="font-medium text-white">{activity.name}</span>
                      <span className="text-white/50 ml-1.5">{activity.action}</span>
                    </p>
                  </div>
                  <span className="text-[13px] text-white/30 flex-shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 멤버 관리 ── */}
      {activeTab === '멤버 관리' && (
        <div className="flex flex-col gap-5">
          {/* Search */}
          <div className="relative max-w-[360px]">
            <LuSearch className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="멤버 검색"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              style={{ paddingLeft: 48 }}
            />
          </div>

          {/* Member table */}
          <div className="rounded-xl border border-border-subtle overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_100px_130px_160px] gap-2 px-5 py-3 bg-white/[0.02] border-b border-border-subtle">
              <span className="text-[13px] font-medium text-white/40">멤버</span>
              <span className="text-[13px] font-medium text-white/40">역할</span>
              <span className="text-[13px] font-medium text-white/40">가입일</span>
              <span className="text-[13px] font-medium text-white/40 text-right">관리</span>
            </div>

            {membersLoading && (
              <div className="px-5 py-12 text-center text-[14px] text-white/40">로딩 중...</div>
            )}

            {/* Member rows */}
            {!membersLoading && filteredMembers.map((member, i) => {
              const displayName = member.nickname ?? `사용자 ${member.userId}`;
              const initial = displayName.charAt(0);
              const roleText = roleLabel(member.role);
              const joinedDate = member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('ko-KR') : '-';
              return (
                <div
                  key={member.membershipId}
                  className={`grid grid-cols-[1fr_100px_130px_160px] gap-2 items-center px-5 py-3.5 ${
                    i < filteredMembers.length - 1 ? 'border-b border-border-subtle' : ''
                  } hover:bg-white/[0.02] transition-colors`}
                >
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/[0.08] flex items-center justify-center text-[13px] font-medium text-white/60 flex-shrink-0">
                      {initial}
                    </div>
                    <span className="text-[14px] font-medium text-white/85">{displayName}</span>
                  </div>

                  {/* Role */}
                  <span
                    className={`text-[13px] font-medium ${
                      member.role === 'MANAGER' ? 'text-primary' : 'text-white/45'
                    }`}
                  >
                    {roleText}
                  </span>

                  {/* Joined */}
                  <span className="text-[13px] text-white/40">{joinedDate}</span>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="text-[13px] text-white/50 hover:text-white">
                      역할변경
                    </Button>
                    <Button variant="ghost" size="sm" className="text-[13px] text-red-400/70 hover:text-red-400 hover:bg-red-400/10">
                      강퇴
                    </Button>
                  </div>
                </div>
              );
            })}

            {!membersLoading && filteredMembers.length === 0 && (
              <div className="px-5 py-12 text-center text-[14px] text-white/40">
                {memberSearch ? '검색 결과가 없습니다.' : '멤버가 없습니다.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 설정 ── */}
      {activeTab === '설정' && (
        <div className="max-w-[560px] flex flex-col gap-6">
          {/* Club name */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-white/70">클럽 이름</label>
            <Input
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="클럽 이름을 입력하세요"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-white/70">클럽 소개</label>
            <textarea
              value={clubDesc}
              onChange={(e) => setClubDesc(e.target.value)}
              placeholder="클럽 소개를 입력하세요"
              rows={4}
              className="w-full rounded-lg border border-border bg-bg-surface-2 px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/70 transition-[border-color,background-color,box-shadow] duration-200 hover:border-border-hover focus-visible:outline-none focus-visible:border-primary/55 focus-visible:ring-4 focus-visible:ring-primary/10 resize-none"
            />
          </div>

          {/* Sport category */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-white/70">종목</label>
            <select
              value={sportCategory}
              onChange={(e) => setSportCategory(e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-bg-surface-2 px-4 text-[15px] text-foreground outline-none transition-[border-color,background-color,box-shadow] duration-200 hover:border-border-hover focus-visible:border-primary/55 focus-visible:ring-4 focus-visible:ring-primary/10"
            >
              {sportCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-pochak-bg-elevated px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-medium text-white/85">클럽 공개 여부</span>
              <span className="text-[13px] text-white/40">
                {isPublic ? '모든 사용자가 클럽을 검색하고 가입할 수 있습니다.' : '초대를 통해서만 가입할 수 있습니다.'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-white/50">{isPublic ? '공개' : '비공개'}</span>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </div>

          {/* Save button */}
          <div className="pt-2">
            <Button variant="outline" className="px-6">
              저장
            </Button>
          </div>
        </div>
      )}

      {/* ── 게시글 관리 ── */}
      {activeTab === '게시글 관리' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border-subtle overflow-hidden">
            <div className="px-5 py-12 text-center text-[14px] text-white/40">
              게시글 관리 기능은 준비 중입니다.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

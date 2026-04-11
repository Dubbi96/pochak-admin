import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import FilterChip from '@/components/FilterChip';
import ProfileSidebar from '@/components/ProfileSidebar';

const settingsTabs = ['알림설정', '즐겨찾는 항목 알림', '서비스기본설정', '환경설정'] as const;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>('알림설정');
  const [subTab, setSubTab] = useState<'서비스알림' | '마케팅, 광고 알림'>('서비스알림');
  const [settings, setSettings] = useState({
    nightAlert: true, matchReminder: true, clipCreated: true, clipLike: true,
    compNews: true, productNews: true, giftArrival: true,
    cityFacility: true, clubJoin: true, clubRecommend: true,
    serviceOp: true, notice: true, event: true,
    mktSms: false, mktEmail: false, mktPush: false, personalAd: true,
    mute: true, preview: true, autoPlay: true, pip: true, autoStop: true, wifiOnly: true,
    publicClip: true, productInfo: true, newGift: true,
  });

  const toggle = (key: string) => setSettings((p) => ({ ...p, [key]: !p[key as keyof typeof p] }));

  return (
    <div className="flex gap-8">
      <ProfileSidebar />
      <div className="flex-1 min-w-0 max-w-[620px]">
      <h1 className="text-2xl font-bold text-foreground mb-6">설정</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          {settingsTabs.map((tab) => (
            <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="알림설정">
          <div className="flex gap-0 mb-6 border-b border-white/[0.06]">
            {(['서비스알림', '마케팅, 광고 알림'] as const).map((t) => (
              <FilterChip
                key={t}
                label={t}
                selected={subTab === t}
                onClick={() => setSubTab(t)}
              />
            ))}
          </div>
          {subTab === '서비스알림' ? (
            <div className="flex flex-col gap-6">
              <SettingGroup title="알림 시간대" items={[{ label: '야간 서비스 알림 (21시 ~ 08시)', key: 'nightAlert' as const }]} settings={settings} toggle={toggle} />
              <SettingGroup title="포착TV" items={[
                { label: '시청예약 경기 미리알림 (10분전)', key: 'matchReminder' as const },
                { label: '클립 생성 완료', key: 'clipCreated' as const },
                { label: '내 클립 \'좋아요\'', key: 'clipLike' as const },
                { label: '추천 대회 소식', key: 'compNews' as const },
                { label: '이용 상품 소식', key: 'productNews' as const },
                { label: '새 선물 도착', key: 'giftArrival' as const },
              ]} settings={settings} toggle={toggle} />
              <SettingGroup title="포착 City" items={[{ label: '관심, 추천 시설 소식', key: 'cityFacility' as const }]} settings={settings} toggle={toggle} />
              <SettingGroup title="포착Club" items={[
                { label: '가입 클럽 소식', key: 'clubJoin' as const },
                { label: '추천 클럽 소식', key: 'clubRecommend' as const },
              ]} settings={settings} toggle={toggle} />
              <SettingGroup title="서비스 알림" items={[
                { label: '서비스 운영', key: 'serviceOp' as const },
                { label: '공지사항', key: 'notice' as const },
                { label: '이벤트', key: 'event' as const },
              ]} settings={settings} toggle={toggle} />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <SettingGroup title="마케팅 정보 수신" subtitle="약관 동의하기" items={[
                { label: 'SMS 수신', key: 'mktSms' as const },
                { label: '이메일 수신', key: 'mktEmail' as const },
                { label: '앱 푸시 수신', key: 'mktPush' as const },
              ]} settings={settings} toggle={toggle} />
              <SettingGroup title="개인정보 수집 이용" items={[
                { label: '맞춤형 광고 설정', key: 'personalAd' as const },
              ]} settings={settings} toggle={toggle} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="서비스기본설정">
          <div className="flex flex-col gap-6">
            <SettingGroup title="콘텐츠 시청" items={[
              { label: '음소거', key: 'mute' as const }, { label: '미리보기', key: 'preview' as const },
              { label: '자동재생', key: 'autoPlay' as const }, { label: 'PIP모드 활성', key: 'pip' as const },
              { label: '자동재생 중단', key: 'autoStop' as const }, { label: 'Wi-Fi 환경에서만 재생', key: 'wifiOnly' as const },
            ]} settings={settings} toggle={toggle} />
            <SettingGroup title="클립 공개 범위" items={[
              { label: '전체공개', key: 'publicClip' as const },
              { label: '이용 상품 소식', key: 'productInfo' as const },
              { label: '새 선물 도착', key: 'newGift' as const },
            ]} settings={settings} toggle={toggle} />
          </div>
        </TabsContent>

        <TabsContent value="환경설정">
          <div className="flex flex-col gap-6">
            <div className="mb-3/40 pb-2">
              <h3 className="text-[15px] font-semibold text-foreground">환경설정</h3>
            </div>
            <div className="flex min-h-[48px] items-center justify-between px-1">
              <p className="text-[14px] font-medium text-foreground">이용국가</p>
              <select className="rounded-md h-9 bg-bg-surface-1 border border-border-subtle px-3 text-[14px] text-foreground outline-none">
                <option>대한민국</option>
              </select>
            </div>
            <div className="flex min-h-[48px] items-center justify-between px-1">
              <p className="text-[14px] font-medium text-foreground">디자인</p>
              <select className="rounded-md h-9 bg-bg-surface-1 border border-border-subtle px-3 text-[14px] text-foreground outline-none">
                <option>다크모드</option>
                <option>라이트모드</option>
              </select>
            </div>
            <div className="flex min-h-[48px] items-center justify-between px-1">
              <p className="text-[14px] text-muted-foreground">앱 버전</p>
              <span className="text-[14px] text-muted-foreground">v1.0.0 <a href="#" className="text-primary ml-1">업데이트</a></span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="즐겨찾는 항목 알림">
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <p className="text-[15px]">즐겨찾는 항목이 없습니다.</p>
            <p className="text-[14px] text-pochak-text-tertiary mt-1">팀이나 대회를 즐겨찾기에 추가하세요.</p>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

function SettingGroup({ title, subtitle, items, settings, toggle }: {
  title: string; subtitle?: string;
  items: Array<{ label: string; description?: string; key: keyof typeof settings }>;
  settings: Record<string, boolean>;
  toggle: (key: string) => void;
}) {
  return (
    <div>
      <div className="mb-3/40 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
          {subtitle && <span className="text-[14px] text-pochak-text-tertiary">{subtitle}</span>}
        </div>
      </div>
      <div>
        {items.map(({ label, description, key }) => (
          <div key={key} className="flex min-h-[48px] items-center justify-between px-1">
            <div>
              <p className="text-[14px] font-medium text-foreground">{label}</p>
              {description && <p className="mt-0.5 text-[14px] text-muted-foreground">{description}</p>}
            </div>
            <Switch checked={!!settings[key]} onCheckedChange={() => toggle(key)} />
          </div>
        ))}
      </div>
    </div>
  );
}

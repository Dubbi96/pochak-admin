import { useState } from 'react';
import { Bell, ChevronDown } from 'lucide-react';

/* ── localStorage persistence helpers ──────────────────────────────────────── */
const SETTINGS_KEY = 'pochak_settings';

function loadSettings(): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch { return {}; }
}

function saveSettings(settings: Record<string, unknown>) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function updateSetting(key: string, value: unknown) {
  const current = loadSettings();
  current[key] = value;
  saveSettings(current);
}
import TabBar from '@/components/TabBar';

/* ── Toggle switch component ────────────────────────────────────────────────── */
function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
        enabled ? 'bg-[#00CC33]' : 'bg-[#4D4D4D]'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

/* ── Toggle row ─────────────────────────────────────────────────────────────── */
function ToggleRow({
  label,
  enabled,
  onChange,
}: {
  label: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-white">{label}</span>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}

/* ── Section wrapper ────────────────────────────────────────────────────────── */
function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-[13px] text-[#A6A6A6] font-semibold uppercase tracking-wide mb-1">
        {title}
      </h3>
      <div className="divide-y divide-[#333]">{children}</div>
    </div>
  );
}

/* ── Pill sub-tabs ──────────────────────────────────────────────────────────── */
function PillTabs<T extends string>({
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
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            active === tab.key
              ? 'bg-[#00CC33] text-white'
              : 'bg-[#262626] text-[#A6A6A6] hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ── Dropdown ───────────────────────────────────────────────────────────────── */
function DropdownRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options?: string[];
  onChange?: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between py-3 relative">
      <span className="text-sm text-white">{label}</span>
      <div className="relative">
        <button
          className="flex items-center gap-1.5 text-sm text-[#A6A6A6] hover:text-white transition-colors"
          onClick={() => setOpen((v) => !v)}
        >
          {value}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && options && (
          <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] bg-[#262626] border border-[#4D4D4D] rounded-lg shadow-xl overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt}
                className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                  opt === value ? 'text-[#00CC33]' : 'text-[#A6A6A6] hover:bg-[#333] hover:text-white'
                }`}
                onClick={() => {
                  onChange?.(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Favorite item row ──────────────────────────────────────────────────────── */
function FavoriteItemRow({
  name,
  detail,
  color,
  short,
  notifyEnabled,
  onNotifyChange,
}: {
  name: string;
  detail: string;
  color: string;
  short: string;
  notifyEnabled: boolean;
  onNotifyChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
        style={{ backgroundColor: color }}
      >
        {short}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{name}</p>
        <p className="text-[12px] text-[#A6A6A6]">{detail}</p>
      </div>
      <Toggle enabled={notifyEnabled} onChange={onNotifyChange} />
    </div>
  );
}

/* ── Tab keys ───────────────────────────────────────────────────────────────── */
type SettingsTab = 'notifications' | 'favorites' | 'service' | 'preferences';
const settingsTabs: { key: SettingsTab; label: string }[] = [
  { key: 'notifications', label: '알림설정' },
  { key: 'favorites', label: '즐겨찾는 항목 알림' },
  { key: 'service', label: '서비스기본설정' },
  { key: 'preferences', label: '환경설정' },
];

type NotifSubTab = 'service' | 'marketing';
type FavSubTab = 'team' | 'competition';

/* ══════════════════════════════════════════════════════════════════════════════
   Settings Page
   ══════════════════════════════════════════════════════════════════════════════ */

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('notifications');
  const [notifSubTab, setNotifSubTab] = useState<NotifSubTab>('service');
  const [favSubTab, setFavSubTab] = useState<FavSubTab>('team');

  /* ── Notification toggles state ───────────────────────────────────────── */
  const [notif, setNotif] = useState(() => {
    const saved = loadSettings();
    return {
      nightAlarm: (saved.nightAlarm as boolean) ?? false,
      reserveReminder: (saved.reserveReminder as boolean) ?? true,
      clipComplete: (saved.clipComplete as boolean) ?? true,
      clipLike: (saved.clipLike as boolean) ?? true,
      recommendCompetition: (saved.recommendCompetition as boolean) ?? true,
      productNews: (saved.productNews as boolean) ?? true,
      newGift: (saved.newGift as boolean) ?? true,
      cityInterest: (saved.cityInterest as boolean) ?? true,
      clubJoined: (saved.clubJoined as boolean) ?? true,
      clubRecommend: (saved.clubRecommend as boolean) ?? true,
      serviceOps: (saved.serviceOps as boolean) ?? true,
      notice: (saved.notice as boolean) ?? true,
      event: (saved.event as boolean) ?? true,
      marketingSms: (saved.marketingSms as boolean) ?? false,
      marketingEmail: (saved.marketingEmail as boolean) ?? false,
      marketingPush: (saved.marketingPush as boolean) ?? false,
      customAd: (saved.customAd as boolean) ?? true,
    };
  });

  const toggleNotif = (key: keyof typeof notif) => {
    setNotif((prev) => {
      const newVal = !prev[key];
      updateSetting(key, newVal);
      return { ...prev, [key]: newVal };
    });
  };

  /* ── Service defaults toggles ─────────────────────────────────────────── */
  const [serviceCfg, setServiceCfg] = useState(() => {
    const saved = loadSettings();
    return {
      mute: (saved.mute as boolean) ?? false,
      preview: (saved.preview as boolean) ?? true,
      autoplay: (saved.autoplay as boolean) ?? true,
      pip: (saved.pip as boolean) ?? true,
      autoStop: (saved.autoStop as boolean) ?? false,
      wifiOnly: (saved.wifiOnly as boolean) ?? false,
      scopePublic: (saved.scopePublic as boolean) ?? true,
      scopeProduct: (saved.scopeProduct as boolean) ?? true,
      scopeGift: (saved.scopeGift as boolean) ?? true,
    };
  });

  const toggleService = (key: keyof typeof serviceCfg) => {
    setServiceCfg((prev) => {
      const newVal = !prev[key];
      updateSetting(key, newVal);
      return { ...prev, [key]: newVal };
    });
  };

  /* ── Preferences state ───────────────────────────────────────────────── */
  const [country, setCountry] = useState(() => {
    const saved = loadSettings();
    return (saved.country as string) ?? '대한민국';
  });
  const [theme, setTheme] = useState(() => {
    const saved = loadSettings();
    return (saved.theme as string) ?? '다크모드';
  });

  /* ── Favorites notification ───────────────────────────────────────────── */
  const defaultFavTeams = [
    { id: '1', name: '파주시민축구단', detail: '축구 · U12', color: '#0066CC', short: '파주', notify: true },
    { id: '2', name: '인천 유나이티드 FC U10', detail: '축구 · U10', color: '#1A237E', short: '인천', notify: true },
    { id: '3', name: 'KT 위즈 주니어', detail: '야구 · 유소년', color: '#E51728', short: 'KT', notify: false },
  ];

  const defaultFavComps = [
    { id: '1', name: '제6회 MLB컵 전국리틀야구대회', detail: '야구 · 2026.01~02', color: '#CC0000', short: 'MLB', notify: true },
    { id: '2', name: '화랑대기 전국유소년축구대회', detail: '축구 · 2025.10~12', color: '#FF6F00', short: '화랑', notify: true },
  ];

  const [favTeams, setFavTeams] = useState(() => {
    const saved = loadSettings();
    const savedTeamNotify = (saved.favTeamNotify ?? {}) as Record<string, boolean>;
    return defaultFavTeams.map((t) => ({
      ...t,
      notify: savedTeamNotify[t.id] ?? t.notify,
    }));
  });

  const [favComps, setFavComps] = useState(() => {
    const saved = loadSettings();
    const savedCompNotify = (saved.favCompNotify ?? {}) as Record<string, boolean>;
    return defaultFavComps.map((c) => ({
      ...c,
      notify: savedCompNotify[c.id] ?? c.notify,
    }));
  });

  const toggleFavTeam = (id: string) => {
    setFavTeams((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, notify: !t.notify } : t));
      const notifyMap: Record<string, boolean> = {};
      next.forEach((t) => { notifyMap[t.id] = t.notify; });
      updateSetting('favTeamNotify', notifyMap);
      return next;
    });
  };

  const toggleFavComp = (id: string) => {
    setFavComps((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, notify: !c.notify } : c));
      const notifyMap: Record<string, boolean> = {};
      next.forEach((c) => { notifyMap[c.id] = c.notify; });
      updateSetting('favCompNotify', notifyMap);
      return next;
    });
  };

  return (
    <div>
        <h1 className="text-2xl font-bold text-white mb-6">설정</h1>

        <TabBar tabs={settingsTabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-6">
          {/* ── 알림설정 ─────────────────────────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <>
              <PillTabs
                tabs={[
                  { key: 'service' as NotifSubTab, label: '서비스알림' },
                  { key: 'marketing' as NotifSubTab, label: '마케팅, 광고 알림' },
                ]}
                active={notifSubTab}
                onChange={setNotifSubTab}
              />

              {notifSubTab === 'service' && (
                <>
                  <SettingsSection title="알림 시간대">
                    <ToggleRow
                      label="야간 서비스 알림 (21시 ~ 08시)"
                      enabled={notif.nightAlarm}
                      onChange={() => toggleNotif('nightAlarm')}
                    />
                  </SettingsSection>

                  <SettingsSection title="포착TV">
                    <ToggleRow
                      label="시청예약 경기 미리알림(10분전)"
                      enabled={notif.reserveReminder}
                      onChange={() => toggleNotif('reserveReminder')}
                    />
                    <ToggleRow
                      label="클립 생성 완료"
                      enabled={notif.clipComplete}
                      onChange={() => toggleNotif('clipComplete')}
                    />
                    <ToggleRow
                      label="내 클립 '좋아요'"
                      enabled={notif.clipLike}
                      onChange={() => toggleNotif('clipLike')}
                    />
                    <ToggleRow
                      label="추천 대회 소식"
                      enabled={notif.recommendCompetition}
                      onChange={() => toggleNotif('recommendCompetition')}
                    />
                    <ToggleRow
                      label="이용 상품 소식"
                      enabled={notif.productNews}
                      onChange={() => toggleNotif('productNews')}
                    />
                    <ToggleRow
                      label="새 선물 도착"
                      enabled={notif.newGift}
                      onChange={() => toggleNotif('newGift')}
                    />
                  </SettingsSection>

                  <SettingsSection title="포착 City">
                    <ToggleRow
                      label="관심, 추천 시설 소식"
                      enabled={notif.cityInterest}
                      onChange={() => toggleNotif('cityInterest')}
                    />
                  </SettingsSection>

                  <SettingsSection title="포착Club">
                    <ToggleRow
                      label="가입 클럽 소식"
                      enabled={notif.clubJoined}
                      onChange={() => toggleNotif('clubJoined')}
                    />
                    <ToggleRow
                      label="추천 클럽 소식"
                      enabled={notif.clubRecommend}
                      onChange={() => toggleNotif('clubRecommend')}
                    />
                  </SettingsSection>

                  <SettingsSection title="서비스 알림">
                    <ToggleRow
                      label="서비스 운영"
                      enabled={notif.serviceOps}
                      onChange={() => toggleNotif('serviceOps')}
                    />
                    <ToggleRow
                      label="공지사항"
                      enabled={notif.notice}
                      onChange={() => toggleNotif('notice')}
                    />
                    <ToggleRow
                      label="이벤트"
                      enabled={notif.event}
                      onChange={() => toggleNotif('event')}
                    />
                  </SettingsSection>
                </>
              )}

              {notifSubTab === 'marketing' && (
                <>
                  <SettingsSection title="마케팅 정보 수신">
                    <div className="py-2">
                      <p className="text-[12px] text-[#A6A6A6] mb-2">약관 동의하기</p>
                    </div>
                    <ToggleRow
                      label="SMS 수신"
                      enabled={notif.marketingSms}
                      onChange={() => toggleNotif('marketingSms')}
                    />
                    <ToggleRow
                      label="이메일 수신"
                      enabled={notif.marketingEmail}
                      onChange={() => toggleNotif('marketingEmail')}
                    />
                    <ToggleRow
                      label="앱 푸시 수신"
                      enabled={notif.marketingPush}
                      onChange={() => toggleNotif('marketingPush')}
                    />
                  </SettingsSection>

                  <SettingsSection title="개인정보 수집 이용">
                    <ToggleRow
                      label="맞춤형 광고 설정"
                      enabled={notif.customAd}
                      onChange={() => toggleNotif('customAd')}
                    />
                  </SettingsSection>
                </>
              )}
            </>
          )}

          {/* ── 즐겨찾는 항목 알림 ──────────────────────────────────────────── */}
          {activeTab === 'favorites' && (
            <>
              <PillTabs
                tabs={[
                  { key: 'team' as FavSubTab, label: '팀/클럽' },
                  { key: 'competition' as FavSubTab, label: '대회' },
                ]}
                active={favSubTab}
                onChange={setFavSubTab}
              />

              {favSubTab === 'team' && (
                <div className="divide-y divide-[#333]">
                  {favTeams.map((team) => (
                    <FavoriteItemRow
                      key={team.id}
                      name={team.name}
                      detail={team.detail}
                      color={team.color}
                      short={team.short}
                      notifyEnabled={team.notify}
                      onNotifyChange={() => toggleFavTeam(team.id)}
                    />
                  ))}
                  {favTeams.length === 0 && (
                    <div className="py-12 text-center text-[#A6A6A6] text-sm">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      즐겨찾는 팀/클럽이 없습니다.
                    </div>
                  )}
                </div>
              )}

              {favSubTab === 'competition' && (
                <div className="divide-y divide-[#333]">
                  {favComps.map((comp) => (
                    <FavoriteItemRow
                      key={comp.id}
                      name={comp.name}
                      detail={comp.detail}
                      color={comp.color}
                      short={comp.short}
                      notifyEnabled={comp.notify}
                      onNotifyChange={() => toggleFavComp(comp.id)}
                    />
                  ))}
                  {favComps.length === 0 && (
                    <div className="py-12 text-center text-[#A6A6A6] text-sm">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      즐겨찾는 대회가 없습니다.
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── 서비스기본설정 ──────────────────────────────────────────────── */}
          {activeTab === 'service' && (
            <>
              <SettingsSection title="콘텐츠 시청">
                <ToggleRow
                  label="음소거"
                  enabled={serviceCfg.mute}
                  onChange={() => toggleService('mute')}
                />
                <ToggleRow
                  label="미리보기"
                  enabled={serviceCfg.preview}
                  onChange={() => toggleService('preview')}
                />
                <ToggleRow
                  label="자동재생"
                  enabled={serviceCfg.autoplay}
                  onChange={() => toggleService('autoplay')}
                />
                <ToggleRow
                  label="PIP모드 활성"
                  enabled={serviceCfg.pip}
                  onChange={() => toggleService('pip')}
                />
                <ToggleRow
                  label="자동재생 중단"
                  enabled={serviceCfg.autoStop}
                  onChange={() => toggleService('autoStop')}
                />
                <ToggleRow
                  label="Wi-Fi 환경에서만 재생"
                  enabled={serviceCfg.wifiOnly}
                  onChange={() => toggleService('wifiOnly')}
                />
              </SettingsSection>

              <SettingsSection title="클립 공개 범위">
                <ToggleRow
                  label="전체공개"
                  enabled={serviceCfg.scopePublic}
                  onChange={() => toggleService('scopePublic')}
                />
                <ToggleRow
                  label="이용 상품 소식"
                  enabled={serviceCfg.scopeProduct}
                  onChange={() => toggleService('scopeProduct')}
                />
                <ToggleRow
                  label="새 선물 도착"
                  enabled={serviceCfg.scopeGift}
                  onChange={() => toggleService('scopeGift')}
                />
              </SettingsSection>
            </>
          )}

          {/* ── 환경설정 ───────────────────────────────────────────────────── */}
          {activeTab === 'preferences' && (
            <div className="divide-y divide-[#333]">
              <DropdownRow label="이용국가" value={country} options={['대한민국', '미국', '일본', '중국']} onChange={(v) => { setCountry(v); updateSetting('country', v); }} />
              <DropdownRow label="디자인" value={theme} options={['다크모드', '라이트모드', '시스템 설정']} onChange={(v) => { setTheme(v); updateSetting('theme', v); }} />
            </div>
          )}
        </div>
    </div>
  );
}

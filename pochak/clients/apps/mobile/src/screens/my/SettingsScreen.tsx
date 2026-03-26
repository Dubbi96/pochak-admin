import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {useTranslation} from 'react-i18next';
import {colors} from '../../theme';
import {useNavigation} from '@react-navigation/native';
import {changeLanguage} from '../../i18n';

const GREEN = colors.green;
const BG = colors.bg;
const SURFACE = colors.surface;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;
const GRAY_DARK = colors.grayDark;

type SettingsTab = 'notification' | 'favorites' | 'serviceDefault' | 'environment';
type NotifSubTab = 'service' | 'marketing';
type FavSubTab = 'teamClub' | 'competition';

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  indent?: boolean;
}

function ToggleRow({label, value, onValueChange, indent = false}: ToggleRowProps) {
  return (
    <View style={[styles.toggleRow, indent && styles.toggleRowIndent]}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{false: GRAY_DARK, true: GREEN}}
        thumbColor={WHITE}
        ios_backgroundColor={GRAY_DARK}
      />
    </View>
  );
}

interface FavoriteTeamItemProps {
  name: string;
  sport: string;
  division: string;
  notifOn: boolean;
  onToggle: () => void;
}

function FavoriteTeamItem({name, sport, division, notifOn, onToggle}: FavoriteTeamItemProps) {
  return (
    <View style={styles.favoriteItem}>
      <View style={styles.favoriteLeft}>
        <MaterialIcons
          name={notifOn ? 'bookmark' : 'bookmark-border'}
          size={20}
          color={notifOn ? GREEN : GRAY}
          style={styles.bookmarkIcon}
        />
        <View style={styles.favoriteLogoPlaceholder}>
          <Text style={styles.favoriteLogoText}>T</Text>
        </View>
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteName}>{name}</Text>
          <Text style={styles.favoriteMeta}>
            {sport} | {division}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={onToggle}>
        <MaterialIcons
          name={notifOn ? 'notifications' : 'notifications-off'}
          size={22}
          color={notifOn ? GREEN : GRAY}
        />
      </TouchableOpacity>
    </View>
  );
}

interface FavoriteCompItemProps {
  name: string;
  dates: string;
  sport: string;
  tag: string;
  notifOn: boolean;
  onToggle: () => void;
}

function FavoriteCompItem({
  name,
  dates,
  sport,
  tag,
  notifOn,
  onToggle,
}: FavoriteCompItemProps) {
  return (
    <View style={styles.favoriteItem}>
      <View style={styles.favoriteLeft}>
        <MaterialIcons
          name={notifOn ? 'bookmark' : 'bookmark-border'}
          size={20}
          color={notifOn ? GREEN : GRAY}
          style={styles.bookmarkIcon}
        />
        <View style={styles.favoriteLogoPlaceholder}>
          <Text style={styles.favoriteLogoText}>C</Text>
        </View>
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteName}>{name}</Text>
          <Text style={styles.favoriteMeta}>{dates}</Text>
          <View style={styles.favoriteTagsRow}>
            <Text style={styles.favoriteTag}>{sport}</Text>
            <Text style={styles.favoriteTag}>{tag}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={onToggle}>
        <MaterialIcons
          name={notifOn ? 'notifications' : 'notifications-off'}
          size={22}
          color={notifOn ? GREEN : GRAY}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function SettingsScreen() {
  const {t, i18n} = useTranslation();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<SettingsTab>('notification');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [notifSubTab, setNotifSubTab] = useState<NotifSubTab>('service');
  const [favSubTab, setFavSubTab] = useState<FavSubTab>('teamClub');

  // Service notification toggles
  const [nightNotif, setNightNotif] = useState(false);
  const [watchReminder, setWatchReminder] = useState(true);
  const [clipComplete, setClipComplete] = useState(true);
  const [clipLike, setClipLike] = useState(true);
  const [recCompetition, setRecCompetition] = useState(true);
  const [productNews, setProductNews] = useState(true);
  const [newGift, setNewGift] = useState(true);
  const [facilityNews, setFacilityNews] = useState(true);
  const [joinedClubNews, setJoinedClubNews] = useState(true);
  const [recClubNews, setRecClubNews] = useState(true);
  const [serviceOps, setServiceOps] = useState(true);
  const [announcement, setAnnouncement] = useState(true);
  const [eventNotif, setEventNotif] = useState(true);

  // Marketing toggles
  const [smsNotif, setSmsNotif] = useState(false);
  const [emailNotif, setEmailNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(false);
  const [adPersonalize, setAdPersonalize] = useState(true);

  // Favorite notification toggles
  const [teamNotifs, setTeamNotifs] = useState<Record<string, boolean>>({
    team1: true,
    team2: true,
    team3: false,
  });
  const [compNotifs, setCompNotifs] = useState<Record<string, boolean>>({
    comp1: true,
    comp2: false,
  });

  const tabs: {key: SettingsTab; label: string}[] = [
    {key: 'notification', label: t('settings.notification')},
    {key: 'favorites', label: t('settings.favorites')},
    {key: 'serviceDefault', label: t('settings.serviceDefault')},
    {key: 'environment', label: t('settings.environment')},
  ];

  const handleLanguageChange = (code: 'ko' | 'en') => {
    changeLanguage(code);
    setShowLangPicker(false);
  };

  const renderEnvironmentTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Language Setting */}
      <View style={styles.settingSection}>
        <Text style={styles.settingSectionTitle}>{t('settings.language')}</Text>
        <TouchableOpacity
          style={styles.languageRow}
          onPress={() => setShowLangPicker(!showLangPicker)}>
          <Text style={styles.toggleLabel}>
            {i18n.language === 'ko' ? t('settings.languageKo') : t('settings.languageEn')}
          </Text>
          <MaterialIcons
            name={showLangPicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={22}
            color={GRAY_LIGHT}
          />
        </TouchableOpacity>
        {showLangPicker && (
          <View style={styles.langPickerContainer}>
            <TouchableOpacity
              style={[
                styles.langPickerOption,
                i18n.language === 'ko' && styles.langPickerOptionActive,
              ]}
              onPress={() => handleLanguageChange('ko')}>
              <Text
                style={[
                  styles.langPickerText,
                  i18n.language === 'ko' && styles.langPickerTextActive,
                ]}>
                {t('settings.languageKo')}
              </Text>
              {i18n.language === 'ko' && (
                <MaterialIcons name="check" size={18} color={GREEN} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.langPickerOption,
                i18n.language === 'en' && styles.langPickerOptionActive,
              ]}
              onPress={() => handleLanguageChange('en')}>
              <Text
                style={[
                  styles.langPickerText,
                  i18n.language === 'en' && styles.langPickerTextActive,
                ]}>
                {t('settings.languageEn')}
              </Text>
              {i18n.language === 'en' && (
                <MaterialIcons name="check" size={18} color={GREEN} />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );

  const renderNotificationTab = () => {
    if (notifSubTab === 'service') {
      return (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Notification time */}
          <View style={styles.settingSection}>
            <Text style={styles.settingSectionTitle}>알림 시간대</Text>
            <ToggleRow
              label="야간 서비스 알림 (21시~08시)"
              value={nightNotif}
              onValueChange={setNightNotif}
            />
          </View>

          {/* POCHAK TV */}
          <View style={styles.settingSection}>
            <Text style={styles.settingSectionTitle}>포착TV</Text>
            <ToggleRow
              label="시청예약 경기 미리알림(10분전)"
              value={watchReminder}
              onValueChange={setWatchReminder}
            />
            <ToggleRow
              label="클립생성완료"
              value={clipComplete}
              onValueChange={setClipComplete}
            />
            <ToggleRow
              label="내클립 '좋아요'"
              value={clipLike}
              onValueChange={setClipLike}
            />
            <ToggleRow
              label="추천대회소식"
              value={recCompetition}
              onValueChange={setRecCompetition}
            />
            <ToggleRow
              label="이용상품소식"
              value={productNews}
              onValueChange={setProductNews}
            />
            <ToggleRow
              label="새선물도착"
              value={newGift}
              onValueChange={setNewGift}
            />
          </View>

          {/* POCHAK City */}
          <View style={styles.settingSection}>
            <Text style={styles.settingSectionTitle}>포착 City</Text>
            <ToggleRow
              label="관심, 추천 시설 소식"
              value={facilityNews}
              onValueChange={setFacilityNews}
            />
          </View>

          {/* POCHAK Club */}
          <View style={styles.settingSection}>
            <Text style={styles.settingSectionTitle}>포착Club</Text>
            <ToggleRow
              label="가입클럽소식"
              value={joinedClubNews}
              onValueChange={setJoinedClubNews}
            />
            <ToggleRow
              label="추천클럽소식"
              value={recClubNews}
              onValueChange={setRecClubNews}
            />
          </View>

          {/* Service notifications */}
          <View style={styles.settingSection}>
            <Text style={styles.settingSectionTitle}>서비스 알림</Text>
            <ToggleRow
              label="서비스운영"
              value={serviceOps}
              onValueChange={setServiceOps}
            />
            <ToggleRow
              label="공지사항"
              value={announcement}
              onValueChange={setAnnouncement}
            />
            <ToggleRow
              label="이벤트"
              value={eventNotif}
              onValueChange={setEventNotif}
            />
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      );
    }

    // Marketing sub-tab
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.settingSection}>
          <View style={styles.marketingHeader}>
            <Text style={styles.settingSectionTitle}>마케팅 정보 수신</Text>
            <TouchableOpacity>
              <Text style={styles.termsLink}>약관 동의하기</Text>
            </TouchableOpacity>
          </View>
          <ToggleRow
            label="SMS 수신"
            value={smsNotif}
            onValueChange={setSmsNotif}
          />
          <ToggleRow
            label="이메일 수신"
            value={emailNotif}
            onValueChange={setEmailNotif}
          />
          <ToggleRow
            label="앱 푸시 수신"
            value={pushNotif}
            onValueChange={setPushNotif}
          />
        </View>

        <View style={styles.settingSection}>
          <Text style={styles.settingSectionTitle}>개인정보 수집 이용</Text>
          <ToggleRow
            label="맞춤형 광고 설정"
            value={adPersonalize}
            onValueChange={setAdPersonalize}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  const renderFavoritesTab = () => {
    const mockTeams = [
      {key: 'team1', name: '서울FC 유소년', sport: '축구', division: 'U-12'},
      {key: 'team2', name: '성남 마라톤클럽', sport: '마라톤', division: '일반'},
      {key: 'team3', name: '용인 유도관', sport: '유도', division: 'U-15'},
    ];

    const mockComps = [
      {
        key: 'comp1',
        name: '2026 전국유소년축구대회',
        dates: '2026.03.15 ~ 2026.03.20',
        sport: '축구',
        tag: '유료',
      },
      {
        key: 'comp2',
        name: '서울마라톤 2026',
        dates: '2026.04.10 ~ 2026.04.10',
        sport: '마라톤',
        tag: '무료',
      },
    ];

    if (favSubTab === 'teamClub') {
      return (
        <ScrollView showsVerticalScrollIndicator={false}>
          {mockTeams.map(team => (
            <FavoriteTeamItem
              key={team.key}
              name={team.name}
              sport={team.sport}
              division={team.division}
              notifOn={teamNotifs[team.key] ?? false}
              onToggle={() =>
                setTeamNotifs(prev => ({
                  ...prev,
                  [team.key]: !prev[team.key],
                }))
              }
            />
          ))}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {mockComps.map(comp => (
          <FavoriteCompItem
            key={comp.key}
            name={comp.name}
            dates={comp.dates}
            sport={comp.sport}
            tag={comp.tag}
            notifOn={compNotifs[comp.key] ?? false}
            onToggle={() =>
              setCompNotifs(prev => ({
                ...prev,
                [comp.key]: !prev[comp.key],
              }))
            }
          />
        ))}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  const renderPlaceholder = (text: string) => (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Tab Bar (horizontal scroll) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScrollView}
          contentContainerStyle={styles.tabScrollContent}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.key)}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sub-tabs for notification and favorites */}
        {activeTab === 'notification' && (
          <View style={styles.subTabs}>
            <TouchableOpacity
              style={[
                styles.subTabButton,
                notifSubTab === 'service' && styles.subTabButtonActive,
              ]}
              onPress={() => setNotifSubTab('service')}>
              <Text
                style={[
                  styles.subTabText,
                  notifSubTab === 'service' && styles.subTabTextActive,
                ]}>
                서비스 알림
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.subTabButton,
                notifSubTab === 'marketing' && styles.subTabButtonActive,
              ]}
              onPress={() => setNotifSubTab('marketing')}>
              <Text
                style={[
                  styles.subTabText,
                  notifSubTab === 'marketing' && styles.subTabTextActive,
                ]}>
                마케팅, 광고 알림
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'favorites' && (
          <View style={styles.subTabs}>
            <TouchableOpacity
              style={[
                styles.subTabButton,
                favSubTab === 'teamClub' && styles.subTabButtonActive,
              ]}
              onPress={() => setFavSubTab('teamClub')}>
              <Text
                style={[
                  styles.subTabText,
                  favSubTab === 'teamClub' && styles.subTabTextActive,
                ]}>
                팀/클럽
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.subTabButton,
                favSubTab === 'competition' && styles.subTabButtonActive,
              ]}
              onPress={() => setFavSubTab('competition')}>
              <Text
                style={[
                  styles.subTabText,
                  favSubTab === 'competition' && styles.subTabTextActive,
                ]}>
                대회
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'notification' && renderNotificationTab()}
          {activeTab === 'favorites' && renderFavoritesTab()}
          {activeTab === 'serviceDefault' &&
            renderPlaceholder('서비스기본설정 - 준비 중입니다.')}
          {activeTab === 'environment' && renderEnvironmentTab()}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
  headerPlaceholder: {
    width: 40,
  },
  // Tab bar
  tabScrollView: {
    maxHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_DARK,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    gap: 4,
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: GREEN,
  },
  tabText: {
    color: GRAY,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: GREEN,
  },
  // Sub-tabs
  subTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  subTabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GRAY_DARK,
  },
  subTabButtonActive: {
    backgroundColor: WHITE,
    borderColor: WHITE,
  },
  subTabText: {
    color: GRAY_LIGHT,
    fontSize: 13,
    fontWeight: '600',
  },
  subTabTextActive: {
    color: '#000000',
  },
  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  // Toggle row
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  toggleRowIndent: {
    paddingLeft: 16,
  },
  toggleLabel: {
    color: WHITE,
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  // Setting sections
  settingSection: {
    marginBottom: 20,
  },
  settingSectionTitle: {
    color: GRAY_LIGHT,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    paddingTop: 8,
  },
  // Marketing
  marketingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  termsLink: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '600',
  },
  // Favorite items
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  favoriteLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookmarkIcon: {
    marginRight: 8,
  },
  favoriteLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GRAY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  favoriteLogoText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteName: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  favoriteMeta: {
    color: GRAY_LIGHT,
    fontSize: 12,
    marginTop: 2,
  },
  favoriteTagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  favoriteTag: {
    color: GRAY_LIGHT,
    fontSize: 11,
    backgroundColor: GRAY_DARK,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  // Placeholder
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: GRAY,
    fontSize: 14,
  },
  bottomSpacer: {
    height: 40,
  },
  // Language picker
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  langPickerContainer: {
    backgroundColor: SURFACE,
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  langPickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  langPickerOptionActive: {
    backgroundColor: '#262626',
  },
  langPickerText: {
    color: GRAY_LIGHT,
    fontSize: 14,
  },
  langPickerTextActive: {
    color: WHITE,
    fontWeight: '600',
  },
});

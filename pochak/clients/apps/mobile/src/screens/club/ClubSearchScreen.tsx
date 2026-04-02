import React, {useState} from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../theme';
import {
  Club,
  TeamCard,
  clubSearchTabs,
  mockSearchClubs,
  mockTeamCards,
} from '../../services/clubApi';

const DEFAULT_CLUB_COUNT = 3;
const EXPANDED_CLUB_COUNT = 8;

// ─── Club Search Screen ───────────────────────────────────

export default function ClubSearchScreen() {
  const [selectedTab, setSelectedTab] = useState('전체');
  const [searchText, setSearchText] = useState('');
  const [expandedClubs, setExpandedClubs] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string) => {
    setFavorites(prev => ({...prev, [id]: !prev[id]}));
  };

  const displayedClubs = expandedClubs
    ? mockSearchClubs.slice(0, EXPANDED_CLUB_COUNT)
    : mockSearchClubs.slice(0, DEFAULT_CLUB_COUNT);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TouchableOpacity activeOpacity={0.7} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={18} color={colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="클럽, 팀 검색"
            placeholderTextColor={colors.gray}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.gray}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}>
          {clubSearchTabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.tabActive]}
              onPress={() => setSelectedTab(tab)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        {/* Team Section */}
        {(selectedTab === '전체' || selectedTab === '팀') && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionTitle}>팀</Text>
            </View>
            <FlatList
              data={mockTeamCards}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.teamListContainer}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <TeamCardView
                  item={item}
                  isFavorite={favorites[item.id] ?? item.isFavorite}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                />
              )}
            />
          </View>
        )}

        {/* Club Section */}
        {(selectedTab === '전체' || selectedTab === '클럽') && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionTitle}>클럽</Text>
            </View>
            {displayedClubs.map(club => (
              <ClubListItem
                key={club.id}
                item={club}
                isFavorite={favorites[club.id] ?? club.isFavorite}
                onToggleFavorite={() => toggleFavorite(club.id)}
              />
            ))}
            {!expandedClubs &&
              mockSearchClubs.length > DEFAULT_CLUB_COUNT && (
                <TouchableOpacity
                  style={styles.moreButton}
                  onPress={() => setExpandedClubs(true)}
                  activeOpacity={0.7}>
                  <Text style={styles.moreButtonText}>더보기</Text>
                  <MaterialIcons
                    name="expand-more"
                    size={18}
                    color={colors.green}
                  />
                </TouchableOpacity>
              )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Team Card ────────────────────────────────────────────

function TeamCardView({
  item,
  isFavorite,
  onToggleFavorite,
}: {
  item: TeamCard;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <View style={styles.teamCard}>
      <Image
        source={{uri: item.logoUrl}}
        style={styles.teamLogo}
        resizeMode="cover"
      />
      <Text style={styles.teamName} numberOfLines={1}>
        {item.name}
      </Text>
      <TouchableOpacity onPress={onToggleFavorite} activeOpacity={0.7}>
        <MaterialIcons
          name={isFavorite ? 'star' : 'star-border'}
          size={18}
          color={isFavorite ? '#FFD600' : colors.gray}
        />
      </TouchableOpacity>
    </View>
  );
}

// ─── Club List Item ───────────────────────────────────────

function ClubListItem({
  item,
  isFavorite,
  onToggleFavorite,
}: {
  item: Club;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <TouchableOpacity style={styles.clubItem} activeOpacity={0.7}>
      <Image
        source={{uri: item.logoUrl}}
        style={styles.clubLogo}
        resizeMode="cover"
      />
      <View style={styles.clubInfo}>
        <Text style={styles.clubName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.clubDesc} numberOfLines={1}>
          {item.description}
        </Text>
        <View style={styles.clubMetaRow}>
          <Text style={styles.clubSport}>{item.sport}</Text>
          <Text style={styles.clubDot}>·</Text>
          <Text style={styles.clubMembers}>{item.memberCount}명</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.favButton}
        onPress={onToggleFavorite}
        activeOpacity={0.7}>
        <MaterialIcons
          name={isFavorite ? 'star' : 'star-border'}
          size={22}
          color={isFavorite ? '#FFD600' : colors.gray}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 12,
  },
  bottomSpacer: {
    height: 40,
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 52,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.white,
    marginLeft: 8,
    paddingVertical: 0,
  },

  // Tabs
  tabsWrapper: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  tabsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: colors.surface,
  },
  tabActive: {
    backgroundColor: colors.green,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.grayLight,
  },
  tabTextActive: {
    color: '#000',
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionDivider: {
    width: 3,
    height: 18,
    backgroundColor: colors.green,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },

  // Team Cards (horizontal scroll, 4 per view)
  teamListContainer: {
    paddingHorizontal: 16,
  },
  teamCard: {
    width: 80,
    alignItems: 'center',
    marginRight: 12,
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.grayDark,
    marginBottom: 6,
  },
  teamName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 4,
  },

  // Club List
  clubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  clubLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.grayDark,
    marginRight: 12,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 3,
  },
  clubDesc: {
    fontSize: 12,
    color: colors.grayLight,
    marginBottom: 4,
  },
  clubMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubSport: {
    fontSize: 11,
    color: colors.green,
    fontWeight: '600',
  },
  clubDot: {
    fontSize: 11,
    color: colors.gray,
    marginHorizontal: 4,
  },
  clubMembers: {
    fontSize: 11,
    color: colors.gray,
  },
  favButton: {
    padding: 8,
  },

  // More Button
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginTop: 4,
  },
  moreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.green,
    marginRight: 4,
  },
});

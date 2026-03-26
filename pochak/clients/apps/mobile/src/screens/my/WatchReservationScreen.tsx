import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  SectionList,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../theme';
import {mockReservations, WatchReservationItem} from '../../services/myApi';

const GREEN = colors.green;
const BG = colors.bg;
const SURFACE = colors.surface;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;
const GRAY_DARK = colors.grayDark;

// Group reservations by dDay
function groupByDDay(items: WatchReservationItem[]) {
  const groups: Record<string, WatchReservationItem[]> = {};
  items.forEach(item => {
    if (!groups[item.dDay]) {
      groups[item.dDay] = [];
    }
    groups[item.dDay].push(item);
  });
  return Object.entries(groups).map(([dDay, data]) => ({
    title: dDay,
    date: data[0].date,
    data,
  }));
}

function ReservationCard({item}: {item: WatchReservationItem}) {
  const isLive = item.status === '진행중';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <MaterialIcons name="sports" size={18} color={GREEN} />
          <Text style={styles.sportBadge}>{item.sport}</Text>
          <View
            style={[
              styles.statusBadge,
              isLive ? styles.statusLive : styles.statusUpcoming,
            ]}>
            <Text
              style={[
                styles.statusText,
                isLive ? styles.statusTextLive : styles.statusTextUpcoming,
              ]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.matchName}>{item.matchName}</Text>

      <View style={styles.infoRow}>
        <MaterialIcons name="access-time" size={14} color={GRAY_LIGHT} />
        <Text style={styles.infoText}>{item.time}</Text>
      </View>
      <View style={styles.infoRow}>
        <MaterialIcons name="place" size={14} color={GRAY_LIGHT} />
        <Text style={styles.infoText}>{item.stadium}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.cancelButton} activeOpacity={0.7}>
          <Text style={styles.cancelButtonText}>예약 취소</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function WatchReservationScreen() {
  const sections = groupByDDay(mockReservations);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>시청예약</Text>
        <View style={{width: 24}} />
      </View>

      {/* Reservation List */}
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={({item}) => <ReservationCard item={item} />}
        renderSectionHeader={({section}) => (
          <View style={styles.sectionHeader}>
            <View style={styles.dDayBadge}>
              <Text style={styles.dDayText}>{section.title}</Text>
            </View>
            <Text style={styles.sectionDate}>{section.date}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        SectionSeparatorComponent={() => <View style={{height: 8}} />}
        ItemSeparatorComponent={() => <View style={{height: 10}} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WHITE,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  dDayBadge: {
    backgroundColor: GREEN,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 10,
  },
  dDayText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
  },
  sectionDate: {
    fontSize: 15,
    fontWeight: '700',
    color: WHITE,
  },
  // Card
  card: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: GREEN,
    marginLeft: 6,
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusLive: {
    backgroundColor: 'rgba(255,0,0,0.2)',
  },
  statusUpcoming: {
    backgroundColor: 'rgba(0,200,83,0.15)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextLive: {
    color: '#E51728',
  },
  statusTextUpcoming: {
    color: GREEN,
  },
  matchName: {
    fontSize: 15,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 10,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: GRAY_LIGHT,
    marginLeft: 6,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: GRAY_DARK,
    paddingTop: 12,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: GRAY,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  cancelButtonText: {
    fontSize: 13,
    color: GRAY_LIGHT,
    fontWeight: '600',
  },
});

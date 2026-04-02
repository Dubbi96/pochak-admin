import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import {colors} from '../../theme';
import type {TimelineEvent} from './ControlOverlay';

const EVENT_TYPE_COLORS: Record<string, string> = {
  GOAL: '#4CAF50',
  FOUL: '#FFD600',
  CARD: '#FF1744',
  HIGHLIGHT: '#FFFFFF',
  SUBSTITUTION: '#2196F3',
  PERIOD: '#00CC33',
  CUSTOM: '#9C27B0',
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`;
}

const EVENT_TYPE_ICONS: Record<string, {name: string; pack: 'ionicons' | 'mci'}> = {
  GOAL: {name: 'soccer', pack: 'mci'},
  SUBSTITUTION: {name: 'swap-horizontal', pack: 'mci'},
  HIGHLIGHT: {name: 'star', pack: 'ionicons'},
  FOUL: {name: 'alert-circle-outline', pack: 'ionicons'},
  CARD: {name: 'card', pack: 'mci'},
  CUSTOM: {name: 'play', pack: 'ionicons'},
};

interface TimelineCardListProps {
  events: TimelineEvent[];
  onSeekTo: (seconds: number) => void;
}

function TimelineCard({
  event,
  onPress,
}: {
  event: TimelineEvent;
  onPress: () => void;
}) {
  const eventColor = EVENT_TYPE_COLORS[event.type] ?? '#FFFFFF';
  const iconInfo = EVENT_TYPE_ICONS[event.type] ?? EVENT_TYPE_ICONS.CUSTOM;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      {/* Thumbnail — event type icon + colored background */}
      <View style={[styles.thumbnailContainer, {backgroundColor: eventColor}]}>
        <View style={styles.thumbnailIconWrap}>
          {iconInfo.pack === 'mci' ? (
            <MaterialCommunityIcons
              name={iconInfo.name as any}
              size={28}
              color="rgba(255,255,255,0.9)"
            />
          ) : (
            <Ionicons
              name={iconInfo.name as any}
              size={28}
              color="rgba(255,255,255,0.9)"
            />
          )}
        </View>
        {/* Event type badge */}
        <View style={[styles.typeBadge, {backgroundColor: 'rgba(0,0,0,0.4)'}]}>
          <Text style={styles.typeBadgeText}>{event.type}</Text>
        </View>
      </View>
      {/* Label + timestamp */}
      <Text style={styles.cardLabel} numberOfLines={2}>
        {event.label}
      </Text>
      <Text style={styles.cardTimestamp}>{formatTime(event.time)}</Text>
    </TouchableOpacity>
  );
}

const TimelineCardList: React.FC<TimelineCardListProps> = ({
  events,
  onSeekTo,
}) => {
  // Filter out PERIOD events — only show actionable events
  const actionableEvents = events.filter(e => e.type !== 'PERIOD');

  if (actionableEvents.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>타임라인</Text>
      <FlatList
        data={actionableEvents}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({item}) => (
          <TimelineCard event={item} onPress={() => onSeekTo(item.time)} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    width: 140,
  },
  thumbnailContainer: {
    width: 140,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 6,
    position: 'relative',
  },
  thumbnailIconWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    lineHeight: 16,
    marginBottom: 2,
  },
  cardTimestamp: {
    fontSize: 11,
    color: colors.green,
    fontWeight: '600',
  },
});

export default TimelineCardList;

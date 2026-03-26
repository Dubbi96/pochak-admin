import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../theme';
import type {TimelineEvent, Chapter} from './ControlOverlay';

const EVENT_TYPE_COLORS: Record<string, string> = {
  GOAL: '#4CAF50',
  FOUL: '#FFD600',
  CARD: '#FF1744',
  HIGHLIGHT: '#FFFFFF',
  SUBSTITUTION: '#2196F3',
};

function getEventColor(eventType: string): string {
  return EVENT_TYPE_COLORS[eventType.toUpperCase()] ?? '#FFFFFF';
}

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

const CHAPTER_TYPE_COLORS: Record<string, string> = {
  HALF: '#00CC33',
  BREAK: '#FFC107',
  HIGHLIGHT: '#E51728',
  CUSTOM: '#9C27B0',
};

function getChapterTypeColor(type: string): string {
  return CHAPTER_TYPE_COLORS[type] ?? colors.grayLight;
}

interface TimelineEventsSheetProps {
  visible: boolean;
  events: TimelineEvent[];
  chapters?: Chapter[];
  onSeekTo: (seconds: number) => void;
  onClose: () => void;
}

const TimelineEventsSheet: React.FC<TimelineEventsSheetProps> = ({
  visible,
  events,
  chapters,
  onSeekTo,
  onClose,
}) => {
  const sortedEvents = [...events].sort(
    (a, b) => a.time - b.time,
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>타임라인</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <MaterialIcons name="close" size={22} color={colors.grayLight} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.eventList}
            showsVerticalScrollIndicator={false}>
            {/* Chapters section */}
            {chapters && chapters.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>경기 구간</Text>
                {chapters.map(ch => (
                  <TouchableOpacity
                    key={ch.id}
                    style={styles.eventRow}
                    onPress={() => {
                      onSeekTo(ch.startTime);
                      onClose();
                    }}
                    activeOpacity={0.7}>
                    <View
                      style={[
                        styles.chapterBadge,
                        {backgroundColor: getChapterTypeColor(ch.type)},
                      ]}
                    />
                    <Text style={styles.eventTimestamp}>
                      {formatTime(ch.startTime)}
                    </Text>
                    <Text style={styles.eventDescription} numberOfLines={1}>
                      {ch.title}
                    </Text>
                    <Text style={styles.chapterDuration}>
                      {formatTime(ch.endTime - ch.startTime)}
                    </Text>
                  </TouchableOpacity>
                ))}
                {sortedEvents.length > 0 && (
                  <Text style={styles.sectionTitle}>이벤트</Text>
                )}
              </>
            )}

            {/* Events section */}
            {sortedEvents.length === 0 && (!chapters || chapters.length === 0) ? (
              <Text style={styles.emptyText}>이벤트가 없습니다</Text>
            ) : (
              sortedEvents.map(event => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventRow}
                  onPress={() => {
                    onSeekTo(event.time);
                    onClose();
                  }}
                  activeOpacity={0.7}>
                  <View
                    style={[
                      styles.eventDot,
                      {backgroundColor: getEventColor(event.type)},
                    ]}
                  />
                  <Text style={styles.eventTimestamp}>
                    {formatTime(event.time)}
                  </Text>
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {event.label}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
    paddingHorizontal: 16,
    maxHeight: '60%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  eventList: {
    flexGrow: 0,
  },
  emptyText: {
    color: colors.grayLight,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.grayDark,
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  eventTimestamp: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '600',
    width: 60,
    marginRight: 8,
  },
  eventDescription: {
    color: colors.white,
    fontSize: 14,
    flex: 1,
  },
  sectionTitle: {
    color: colors.grayLight,
    fontSize: 13,
    fontWeight: '700',
    paddingVertical: 8,
    paddingTop: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.grayDark,
    marginBottom: 4,
  },
  chapterBadge: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 12,
  },
  chapterDuration: {
    color: colors.grayLight,
    fontSize: 12,
    marginLeft: 8,
  },
});

export default TimelineEventsSheet;

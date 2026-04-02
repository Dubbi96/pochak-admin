import React, {useCallback, useMemo, useState} from 'react';
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MaterialIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../theme';
import {
  NotificationItem,
  NotificationTab,
  NotificationType,
  NOTIFICATION_TABS,
  formatRelativeTime,
  getTypesForTab,
  mockNotifications,
} from '../../services/notificationApi';

// ─── Icon mapping ───────────────────────────────────────

const NOTIFICATION_ICON_MAP: Record<NotificationType, keyof typeof MaterialIcons.glyphMap> = {
  SYSTEM: 'info',
  MARKETING: 'campaign',
  RESERVATION: 'event',
  MATCH: 'sports',
  PURCHASE: 'shopping-cart',
  GIFT: 'card-giftcard',
};

const NOTIFICATION_ICON_COLOR: Record<NotificationType, string> = {
  SYSTEM: '#4488FF',
  MARKETING: '#FF6D00',
  RESERVATION: colors.green,
  MATCH: '#E51728',
  PURCHASE: '#AB47BC',
  GIFT: '#FFC107',
};

// ─── Notification Row ───────────────────────────────────

function NotificationRow({
  item,
  onPress,
}: {
  item: NotificationItem;
  onPress: () => void;
}) {
  const iconName = NOTIFICATION_ICON_MAP[item.type];
  const iconColor = NOTIFICATION_ICON_COLOR[item.type];

  return (
    <TouchableOpacity
      style={[styles.notifRow, !item.isRead && styles.notifRowUnread]}
      onPress={onPress}
      activeOpacity={0.7}>
      {/* Unread dot */}
      {!item.isRead && <View style={styles.unreadDot} />}

      {/* Icon */}
      <View style={[styles.notifIconWrap, {backgroundColor: iconColor + '22'}]}>
        <MaterialIcons name={iconName} size={22} color={iconColor} />
      </View>

      {/* Content */}
      <View style={styles.notifContent}>
        <Text style={styles.notifTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.notifBody} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.notifTime}>
          {formatRelativeTime(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ────────────────────────────────────────

export default function NotificationScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<NotificationTab>('전체');

  const filteredNotifications = useMemo(() => {
    const types = getTypesForTab(activeTab);
    if (!types) return mockNotifications;
    return mockNotifications.filter(n => types.includes(n.type));
  }, [activeTab]);

  const handleNotificationPress = useCallback((_item: NotificationItem) => {
    // placeholder navigation
    // e.g. navigation.navigate(item.navigateTo)
  }, []);

  const renderNotification = useCallback(
    ({item}: {item: NotificationItem}) => (
      <NotificationRow
        item={item}
        onPress={() => handleNotificationPress(item)}
      />
    ),
    [handleNotificationPress],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <MaterialIcons name="chevron-left" size={28} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림</Text>
        <View style={styles.backButton} />
      </View>

      {/* Tab Chips */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}>
          {NOTIFICATION_TABS.map(tab => {
            const isActive = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.tabChipText,
                    isActive && styles.tabChipTextActive,
                  ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notification List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="notifications-none"
              size={48}
              color={colors.gray}
            />
            <Text style={styles.emptyText}>알림이 없습니다</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 48,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },

  // Tabs
  tabContainer: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.grayDark,
  },
  tabChipActive: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.grayLight,
  },
  tabChipTextActive: {
    color: '#000',
  },

  // List
  listContent: {
    paddingTop: 4,
    paddingBottom: 32,
  },

  // Notification Row
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  notifRowUnread: {
    backgroundColor: colors.surface,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green,
    position: 'absolute',
    left: 8,
    top: 20,
  },
  notifIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 3,
  },
  notifBody: {
    fontSize: 13,
    color: colors.gray,
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 11,
    color: colors.gray,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 12,
  },
});

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../theme';

type Member = {
  id: string;
  nickname: string;
  email: string;
  role: 'admin' | 'family';
};

const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    nickname: '포착이',
    email: 'pochak@pochak.com',
    role: 'admin',
  },
  {
    id: '2',
    nickname: '가족1',
    email: 'family1@pochak.com',
    role: 'family',
  },
];

const MAX_MEMBERS = 5;

export default function FamilyAccountScreen() {
  const navigation = useNavigation();

  const handleAddMember = () => {
    Alert.alert('멤버 추가', `최대 ${MAX_MEMBERS}명까지 추가 가능합니다.`);
  };

  const handleDeleteMember = (member: Member) => {
    Alert.alert(
      '멤버 삭제',
      `${member.nickname}님을 가족 계정에서 삭제하시겠습니까?`,
      [
        {text: '취소', style: 'cancel'},
        {text: '삭제', style: 'destructive'},
      ],
    );
  };

  const renderAvatar = (member: Member) => {
    const isAdmin = member.role === 'admin';
    return (
      <View
        style={[
          styles.avatar,
          {backgroundColor: isAdmin ? colors.green : colors.grayDark},
        ]}>
        <Text style={styles.avatarText}>
          {member.nickname.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>가족 계정</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Plan info card */}
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>대가족 무제한 시청권</Text>
          <Text style={styles.planCount}>
            {MOCK_MEMBERS.length}/{MAX_MEMBERS}명
          </Text>
        </View>

        {/* Member list */}
        <View style={styles.memberSection}>
          <Text style={styles.sectionLabel}>멤버</Text>
          {MOCK_MEMBERS.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                아직 가족 멤버가 없습니다.{'\n'}아래 버튼을 눌러 멤버를
                추가하세요.
              </Text>
            </View>
          ) : (
            MOCK_MEMBERS.map(member => (
              <View key={member.id} style={styles.memberRow}>
                {renderAvatar(member)}
                <View style={styles.memberInfo}>
                  <View style={styles.memberNameRow}>
                    <Text style={styles.memberNickname}>
                      {member.nickname}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        member.role === 'admin'
                          ? styles.badgeAdmin
                          : styles.badgeFamily,
                      ]}>
                      <Text style={styles.badgeText}>
                        {member.role === 'admin' ? '관리자' : '가족'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                </View>
                {member.role === 'family' && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteMember(member)}>
                    <Text style={styles.deleteButtonText}>삭제</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        {/* Add member button */}
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={handleAddMember}>
          <MaterialIcons name="add" size={20} color={colors.green} />
          <Text style={styles.addButtonText}>멤버 추가</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  planCount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.green,
  },
  memberSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  memberNickname: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeAdmin: {
    backgroundColor: colors.green,
  },
  badgeFamily: {
    backgroundColor: colors.grayDark,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  memberEmail: {
    fontSize: 13,
    color: colors.gray,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.error,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.green,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.green,
    marginLeft: 6,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
});

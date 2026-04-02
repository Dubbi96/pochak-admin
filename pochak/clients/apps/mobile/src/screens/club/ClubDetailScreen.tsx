import React, {useState, useEffect, useCallback} from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
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
  ClubClip,
  ClubMember,
  ClubVideo,
  mockClubDetail,
} from '../../services/clubApi';
import {
  toggleFollow,
  getFollowerCount,
  isFollowing,
} from '../../services/followApi';

export default function ClubDetailScreen() {
  const club = mockClubDetail;
  const [joinStatus, setJoinStatus] = useState(club.joinStatus);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    isFollowing('club', club.id).then(setFollowing);
    getFollowerCount('club', club.id).then(setFollowerCount);
  }, [club.id]);

  const handleToggleFollow = useCallback(async () => {
    const prev = following;
    const prevCount = followerCount;
    setFollowing(!prev);
    setFollowerCount(prev ? prevCount - 1 : prevCount + 1);
    try {
      const result = await toggleFollow('club', club.id);
      setFollowing(result);
    } catch {
      setFollowing(prev);
      setFollowerCount(prevCount);
    }
  }, [following, followerCount, club.id]);

  const handleJoin = () => {
    if (joinStatus !== 'none') return;
    switch (club.joinPolicy) {
      case 'OPEN':
        setJoinStatus('joined');
        Alert.alert('가입 완료', '클럽에 가입되었습니다.');
        break;
      case 'APPROVAL':
        setJoinStatus('pending');
        Alert.alert('가입 신청', '가입 신청이 완료되었습니다. 승인을 기다려주세요.');
        break;
      case 'INVITE_ONLY':
        setInviteModalVisible(true);
        break;
    }
  };

  const handleInviteCodeSubmit = () => {
    if (inviteCode.trim().length === 0) {
      Alert.alert('오류', '초대 코드를 입력해주세요.');
      return;
    }
    // Mock validation
    setInviteModalVisible(false);
    setInviteCode('');
    setJoinStatus('joined');
    Alert.alert('가입 완료', '초대 코드가 확인되었습니다. 클럽에 가입되었습니다.');
  };

  const isMember = joinStatus === 'joined';

  const joinButtonLabel = (() => {
    switch (club.joinPolicy) {
      case 'OPEN': return '가입하기';
      case 'APPROVAL': return '가입 신청';
      case 'INVITE_ONLY': return '초대 코드 입력';
    }
  })();

  const roleColor = (role: string) => {
    switch (role) {
      case '회장':
        return colors.green;
      case '부회장':
        return '#2196F3';
      case '운영진':
        return '#FF6D00';
      default:
        return colors.gray;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          클럽 상세
        </Text>
        <TouchableOpacity activeOpacity={0.7} style={styles.shareButton}>
          <Ionicons name="share-outline" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerWrap}>
          <Image
            source={{uri: club.bannerUrl}}
            style={styles.banner}
            resizeMode="cover"
          />
          <View style={styles.logoWrap}>
            <Image
              source={{uri: club.logoUrl}}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Club Info */}
        <View style={styles.infoSection}>
          <Text style={styles.clubName}>{club.name}</Text>
          <View style={styles.infoRow}>
            <View style={styles.sportBadge}>
              <Text style={styles.sportBadgeText}>{club.sport}</Text>
            </View>
            <View style={styles.memberBadge}>
              <MaterialIcons name="people" size={14} color={colors.gray} />
              <Text style={styles.memberCount}>{club.memberCount}명</Text>
            </View>
            <Text style={styles.regionText}>{club.region}</Text>
          </View>
          <Text style={styles.description}>{club.description}</Text>

          {/* Follow row */}
          <View style={styles.followRow}>
            <View style={styles.followerInfo}>
              <MaterialIcons name="people" size={14} color={colors.grayLight} />
              <Text style={styles.followerCountText}>
                팔로워 {followerCount.toLocaleString()}명
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.followButton,
                following && styles.followingBtn,
              ]}
              onPress={handleToggleFollow}
              activeOpacity={0.8}>
              {following && (
                <MaterialIcons
                  name="check"
                  size={14}
                  color={colors.green}
                  style={{marginRight: 4}}
                />
              )}
              <Text
                style={[
                  styles.followButtonText,
                  following && styles.followingBtnText,
                ]}>
                {following ? '팔로잉' : '팔로우'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* CUG Badge */}
          {club.isCUG && (
            <View style={styles.cugBadgeRow}>
              <MaterialIcons name="lock" size={14} color="#FF6D00" />
              <Text style={styles.cugBadgeText}>폐쇄형 클럽 (CUG)</Text>
            </View>
          )}

          {/* Join Button */}
          {joinStatus === 'none' && (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={handleJoin}
              activeOpacity={0.8}>
              {club.joinPolicy === 'INVITE_ONLY' && (
                <MaterialIcons name="vpn-key" size={18} color="#000" style={{marginRight: 6}} />
              )}
              <Text style={styles.joinButtonText}>{joinButtonLabel}</Text>
            </TouchableOpacity>
          )}
          {joinStatus === 'pending' && (
            <View style={styles.pendingButton}>
              <Text style={styles.pendingButtonText}>승인 대기중</Text>
            </View>
          )}
          {joinStatus === 'joined' && (
            <View style={styles.joinedButton}>
              <MaterialIcons name="check-circle" size={18} color={colors.green} />
              <Text style={styles.joinedButtonText}>가입됨</Text>
            </View>
          )}
        </View>

        {/* Members */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>멤버</Text>
            <Text style={styles.sectionCount}>{club.members.length}명</Text>
          </View>
          {club.members.map(member => (
            <MemberRow key={member.id} member={member} roleColor={roleColor} />
          ))}
        </View>

        {/* Videos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>경기 영상</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.sectionMore}>전체보기</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={club.videos}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            keyExtractor={item => item.id}
            renderItem={({item}) => <VideoCard item={item} locked={club.isCUG && !isMember} />}
          />
        </View>

        {/* Clips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>클립</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.sectionMore}>전체보기</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={club.clips}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            keyExtractor={item => item.id}
            renderItem={({item}) => <ClipCard item={item} locked={club.isCUG && !isMember} />}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Invite Code Modal */}
      <Modal
        visible={inviteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInviteModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>초대 코드 입력</Text>
            <Text style={styles.modalDesc}>
              이 클럽은 초대 전용입니다. 초대 코드를 입력해주세요.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="초대 코드"
              placeholderTextColor={colors.gray}
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setInviteModalVisible(false);
                  setInviteCode('');
                }}
                activeOpacity={0.7}>
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleInviteCodeSubmit}
                activeOpacity={0.8}>
                <Text style={styles.modalConfirmText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Member Row ───────────────────────────────────────────

function MemberRow({
  member,
  roleColor,
}: {
  member: ClubMember;
  roleColor: (role: string) => string;
}) {
  return (
    <View style={styles.memberRow}>
      <Image
        source={{uri: member.avatarUrl}}
        style={styles.memberAvatar}
        resizeMode="cover"
      />
      <View style={styles.memberInfo}>
        <View style={styles.memberNameRow}>
          <Text style={styles.memberName}>{member.name}</Text>
          <View
            style={[
              styles.roleBadge,
              {backgroundColor: roleColor(member.role)},
            ]}>
            <Text style={styles.roleBadgeText}>{member.role}</Text>
          </View>
        </View>
        {member.position && (
          <Text style={styles.memberPosition}>{member.position}</Text>
        )}
      </View>
    </View>
  );
}

// ─── Video Card ───────────────────────────────────────────

function VideoCard({item, locked}: {item: ClubVideo; locked: boolean}) {
  const isLocked = locked && item.visibility === 'MEMBERS_ONLY';
  return (
    <TouchableOpacity
      style={styles.videoCard}
      activeOpacity={0.8}
      onPress={() => {
        if (isLocked) {
          Alert.alert('회원 전용', '이 콘텐츠는 클럽 회원만 시청할 수 있습니다.');
        }
      }}>
      <View style={styles.videoThumbnailWrap}>
        <Image
          source={{uri: item.thumbnailUrl}}
          style={[styles.videoThumbnail, isLocked && {opacity: 0.4}]}
          resizeMode="cover"
        />
        {isLocked && (
          <View style={styles.lockOverlay}>
            <MaterialIcons name="lock" size={24} color={colors.white} />
            <Text style={styles.lockOverlayText}>회원 전용</Text>
          </View>
        )}
        <View style={styles.videoDuration}>
          <Text style={styles.videoDurationText}>{item.duration}</Text>
        </View>
      </View>
      <Text style={styles.videoTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.videoMeta}>
        {item.date} · 조회 {item.viewCount.toLocaleString()}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Clip Card ────────────────────────────────────────────

function ClipCard({item, locked}: {item: ClubClip; locked: boolean}) {
  const isLocked = locked && item.visibility === 'MEMBERS_ONLY';
  return (
    <TouchableOpacity
      style={styles.clipCard}
      activeOpacity={0.8}
      onPress={() => {
        if (isLocked) {
          Alert.alert('회원 전용', '이 콘텐츠는 클럽 회원만 시청할 수 있습니다.');
        }
      }}>
      <View style={styles.clipThumbnailWrap}>
        <Image
          source={{uri: item.thumbnailUrl}}
          style={[styles.clipThumbnail, isLocked && {opacity: 0.4}]}
          resizeMode="cover"
        />
        {isLocked && (
          <View style={styles.lockOverlay}>
            <MaterialIcons name="lock" size={20} color={colors.white} />
            <Text style={styles.lockOverlayText}>회원 전용</Text>
          </View>
        )}
        <View style={styles.clipDuration}>
          <Text style={styles.clipDurationText}>{item.duration}</Text>
        </View>
      </View>
      <Text style={styles.clipTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.clipViews}>
        {item.viewCount.toLocaleString()}회
      </Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacer: {
    height: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  shareButton: {
    padding: 4,
  },

  // Banner
  bannerWrap: {
    height: 200,
    marginBottom: 40,
  },
  banner: {
    width: '100%',
    height: 180,
  },
  logoWrap: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.bg,
    padding: 3,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    backgroundColor: colors.grayDark,
  },

  // Info
  infoSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  clubName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportBadge: {
    backgroundColor: colors.green,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 10,
  },
  sportBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  memberCount: {
    fontSize: 13,
    color: colors.grayLight,
    marginLeft: 4,
  },
  regionText: {
    fontSize: 13,
    color: colors.gray,
  },
  description: {
    fontSize: 14,
    color: colors.grayLight,
    lineHeight: 22,
    marginBottom: 18,
  },

  // Follow
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  followerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  followerCountText: {
    fontSize: 13,
    color: colors.grayLight,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.green,
  },
  followingBtn: {
    backgroundColor: colors.green + '1A',
  },
  followButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.green,
  },
  followingBtnText: {
    color: colors.green,
  },

  // CUG Badge
  cugBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FF6D00' + '1A',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  cugBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6D00',
  },

  // Join Button
  joinButton: {
    flexDirection: 'row',
    backgroundColor: colors.green,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  pendingButton: {
    backgroundColor: colors.grayDark,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pendingButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.grayLight,
  },
  joinedButton: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.green,
  },
  joinedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.green,
    marginLeft: 6,
  },

  // Section
  section: {
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  sectionCount: {
    fontSize: 14,
    color: colors.gray,
  },
  sectionMore: {
    fontSize: 13,
    color: colors.green,
    fontWeight: '600',
  },
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 8,
  },

  // Members
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  memberAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.grayDark,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginRight: 8,
  },
  roleBadge: {
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  memberPosition: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 3,
  },

  // Video
  videoCard: {
    width: 200,
    marginRight: 12,
  },
  videoThumbnailWrap: {
    width: '100%',
    height: 112,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  videoDurationText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 3,
  },
  videoMeta: {
    fontSize: 11,
    color: colors.gray,
  },

  // Clip
  clipCard: {
    width: 120,
    marginRight: 12,
  },
  clipThumbnailWrap: {
    width: '100%',
    height: 160,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: colors.surface,
  },
  clipThumbnail: {
    width: '100%',
    height: '100%',
  },
  clipDuration: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  clipDurationText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  clipTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  clipViews: {
    fontSize: 10,
    color: colors.gray,
  },

  // Lock overlay
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 6,
  },
  lockOverlayText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    marginTop: 2,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 13,
    color: colors.grayLight,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: colors.bg,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.grayDark,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.grayDark,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.grayLight,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.green,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
});

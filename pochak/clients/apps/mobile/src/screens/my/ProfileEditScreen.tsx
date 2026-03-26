import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../theme';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import apiClient from '../../api/client';

const GREEN = colors.green;
const BG = colors.bg;
const SURFACE = colors.surface;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;
const GRAY_DARK = colors.grayDark;

// ── Types ─────────────────────────────────────────────────────────

interface UserProfile {
  loginId: string;
  nickname: string;
  email: string;
  phone: string;
  name: string;
  birthDate: string;
  profileImageUrl: string;
  interests: string;
  regions: string;
  purpose: string;
}

const MOCK_PROFILE: UserProfile = {
  loginId: 'pochak2026',
  nickname: 'pochak2026',
  email: 'kimpochak@hogak.co.kr',
  phone: '010-0000-0000',
  name: '홍길동',
  birthDate: '2000.01.01',
  profileImageUrl: '',
  interests: '축구, 마라톤, 유도',
  regions: '대한민국 서울시, 대한민국 성남시, 대한민국 용인시',
  purpose: '내 경기영상을 보고 싶어요 !',
};

// ── API helpers ───────────────────────────────────────────────────

async function getProfile(): Promise<UserProfile> {
  try {
    const res = await apiClient.get('/user/profile');
    return res.data.data || res.data;
  } catch {
    return {...MOCK_PROFILE};
  }
}

async function updateProfile(
  data: Partial<UserProfile>,
): Promise<UserProfile> {
  try {
    const res = await apiClient.put('/user/profile', data);
    return res.data.data || res.data;
  } catch {
    // Mock: merge updates into mock profile
    Object.assign(MOCK_PROFILE, data);
    return {...MOCK_PROFILE};
  }
}

// ── Editable InfoRow ──────────────────────────────────────────────

interface InfoRowProps {
  label: string;
  value: string;
  editable?: boolean;
  editing?: boolean;
  onPress?: () => void;
  onChangeText?: (text: string) => void;
  error?: string;
}

function InfoRow({
  label,
  value,
  editable = false,
  editing = false,
  onPress,
  onChangeText,
  error,
}: InfoRowProps) {
  if (editing && onChangeText) {
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <View style={styles.editInputContainer}>
          <TextInput
            style={styles.editInput}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor={GRAY}
            autoCapitalize="none"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </View>
    );
  }

  const content = (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoRight}>
        <Text style={styles.infoValue} numberOfLines={1}>
          {value}
        </Text>
        {editable && (
          <MaterialIcons
            name="chevron-right"
            size={18}
            color={GRAY}
            style={styles.infoChevron}
          />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

// ── Main Screen ───────────────────────────────────────────────────

export default function ProfileEditScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
      setNickname(data.nickname);
      setEmail(data.email);
      setPhone(data.phone);
      setProfileImageUrl(data.profileImageUrl);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요.';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '올바른 이메일을 입력해주세요.';
    }
    if (!phone.trim() || !/^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone)) {
      newErrors.phone = '올바른 휴대폰번호를 입력해주세요.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const updated = await updateProfile({
        nickname,
        email,
        phone,
        profileImageUrl,
      });
      setProfile(updated);
      setIsEditing(false);
      Alert.alert('완료', '프로필이 수정되었습니다.');
    } catch {
      Alert.alert('오류', '프로필 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setNickname(profile.nickname);
      setEmail(profile.email);
      setPhone(profile.phone);
      setProfileImageUrl(profile.profileImageUrl);
    }
    setErrors({});
    setIsEditing(false);
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>프로필 편집</Text>
          {isEditing ? (
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={GREEN} />
              ) : (
                <Text style={styles.saveButton}>저장</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.editButton}>편집</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {nickname ? nickname.charAt(0).toUpperCase() : 'P'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            {isEditing ? (
              <View>
                <TextInput
                  style={styles.profileNameInput}
                  value={nickname}
                  onChangeText={setNickname}
                  placeholderTextColor={GRAY}
                  placeholder="닉네임"
                />
                {errors.nickname ? (
                  <Text style={styles.errorText}>{errors.nickname}</Text>
                ) : null}
              </View>
            ) : (
              <View style={styles.profileNameRow}>
                <Text style={styles.profileName}>{profile.nickname}</Text>
              </View>
            )}
            <Text style={styles.profileEmail}>{profile.email}</Text>
          </View>
        </View>

        {/* Password Change */}
        <TouchableOpacity
          style={styles.passwordChangeRow}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('PasswordChange')}>
          <Text style={styles.passwordChangeText}>비밀번호 변경</Text>
          <MaterialIcons name="chevron-right" size={20} color={GRAY} />
        </TouchableOpacity>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>개인정보</Text>
          <View style={styles.sectionContent}>
            <InfoRow label="이름" value={profile.name} />
            <InfoRow label="생년월일" value={profile.birthDate} />
            <InfoRow
              label="휴대폰번호"
              value={phone}
              editing={isEditing}
              onChangeText={setPhone}
              error={errors.phone}
            />
            <InfoRow
              label="이메일"
              value={email}
              editable={!isEditing}
              editing={isEditing}
              onChangeText={setEmail}
              onPress={isEditing ? undefined : () => setIsEditing(true)}
              error={errors.email}
            />
          </View>
        </View>

        {/* Profile Image URL (only when editing) */}
        {isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>프로필 이미지</Text>
            <View style={styles.sectionContent}>
              <View style={styles.infoRow}>
                <TextInput
                  style={styles.editInputFull}
                  value={profileImageUrl}
                  onChangeText={setProfileImageUrl}
                  placeholder="이미지 URL을 입력하세요"
                  placeholderTextColor={GRAY}
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>
        )}

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>추가정보</Text>
          <View style={styles.sectionContent}>
            <InfoRow
              label="관심지역"
              value={profile.regions}
              editable
              onPress={() => Alert.alert('알림', '수정 기능은 준비 중입니다.')}
            />
            <InfoRow
              label="관심종목"
              value={profile.interests}
              editable
              onPress={() => Alert.alert('알림', '수정 기능은 준비 중입니다.')}
            />
            <InfoRow
              label="서비스이용계기"
              value={profile.purpose}
              editable
              onPress={() => Alert.alert('알림', '수정 기능은 준비 중입니다.')}
            />
          </View>
        </View>

        {/* Cancel button when editing */}
        {isEditing && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.7}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
  saveButton: {
    color: GREEN,
    fontSize: 15,
    fontWeight: '700',
  },
  editButton: {
    color: GRAY_LIGHT,
    fontSize: 15,
    fontWeight: '600',
  },
  // Profile
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: WHITE,
    fontSize: 28,
    fontWeight: '900',
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
  profileNameInput: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: GREEN,
    paddingVertical: 4,
  },
  profileEmail: {
    color: GRAY_LIGHT,
    fontSize: 13,
    marginTop: 2,
  },
  // Password Change
  passwordChangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  passwordChangeText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '600',
  },
  // Sections
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: GRAY_LIGHT,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    paddingLeft: 4,
  },
  sectionContent: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    overflow: 'hidden',
  },
  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  infoLabel: {
    color: GRAY,
    fontSize: 14,
    minWidth: 80,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  infoValue: {
    color: WHITE,
    fontSize: 14,
    maxWidth: 220,
    textAlign: 'right',
  },
  infoChevron: {
    marginLeft: 8,
  },
  // Edit mode
  editInputContainer: {
    flex: 1,
    marginLeft: 8,
  },
  editInput: {
    color: WHITE,
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: GREEN,
    paddingVertical: 4,
    textAlign: 'right',
  },
  editInputFull: {
    color: WHITE,
    fontSize: 14,
    flex: 1,
    paddingVertical: 4,
  },
  errorText: {
    color: '#E51728',
    fontSize: 11,
    marginTop: 4,
  },
  cancelButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: GRAY_DARK,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: GRAY_LIGHT,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});

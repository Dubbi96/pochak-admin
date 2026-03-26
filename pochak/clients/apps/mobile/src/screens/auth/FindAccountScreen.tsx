import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../theme';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {AuthStackParamList} from '../../navigation/types';
import GreenButton from '../../components/common/GreenButton';

const GREEN = colors.green;
const BG = colors.bg;
const SURFACE = colors.surface;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;
const GRAY_DARK = colors.grayDark;

type MainTab = 'findId' | 'resetPassword';
type FindIdMethod = 'email' | 'phone';

export default function FindAccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [activeTab, setActiveTab] = useState<MainTab>('findId');
  const [findIdMethod, setFindIdMethod] = useState<FindIdMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userId, setUserId] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetScreen, setIsResetScreen] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const mockAccounts = [
    {id: 'pochak2024', email: 'kim****@hogak.co.kr'},
    {id: 'pochak2025', email: 'kim****@hogak.co.kr'},
    {id: 'pochak2026', email: 'kim****@hogak.co.kr'},
  ];

  // Find Account Result View
  if (showResult) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowResult(false)}>
              <Ionicons name="arrow-back" size={24} color={WHITE} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>아이디 조회 결과</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <ScrollView style={styles.resultContainer} showsVerticalScrollIndicator={false}>
            {mockAccounts.map((account, index) => (
              <TouchableOpacity key={index} style={styles.accountRow} activeOpacity={0.7}>
                <View style={styles.accountLeft}>
                  <View style={styles.accountAvatar}>
                    <Text style={styles.accountAvatarText}>P</Text>
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountId}>{account.id}</Text>
                    <Text style={styles.accountEmail}>{account.email}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={GRAY} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.bottomAction}>
            <TouchableOpacity
              style={styles.grayButton}
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.grayButtonText}>메인으로</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Password Reset Input View
  if (isResetScreen) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsResetScreen(false)}>
              <Ionicons name="arrow-back" size={24} color={WHITE} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>비밀번호 재설정</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <View style={styles.resetContent}>
            <Text style={styles.resetSubtitle}>새로운 비밀번호를 입력해주세요</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="비밀번호"
                placeholderTextColor={GRAY}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={GRAY}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="비밀번호 확인"
                placeholderTextColor={GRAY}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={GRAY}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomAction}>
            <GreenButton title="재설정" onPress={() => navigation.navigate('Login')} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>아이디/비밀번호 찾기</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'findId' && styles.tabActive]}
            onPress={() => setActiveTab('findId')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'findId' && styles.tabTextActive,
              ]}>
              아이디 찾기
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'resetPassword' && styles.tabActive]}
            onPress={() => setActiveTab('resetPassword')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'resetPassword' && styles.tabTextActive,
              ]}>
              비밀번호 재설정
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {activeTab === 'findId' ? (
            <>
              <View style={styles.subButtons}>
                <TouchableOpacity
                  style={[
                    styles.subButton,
                    findIdMethod === 'email' && styles.subButtonActive,
                  ]}
                  onPress={() => setFindIdMethod('email')}>
                  <Text
                    style={[
                      styles.subButtonText,
                      findIdMethod === 'email' && styles.subButtonTextActive,
                    ]}>
                    이메일로 찾기
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.subButton,
                    findIdMethod === 'phone' && styles.subButtonActive,
                  ]}
                  onPress={() => setFindIdMethod('phone')}>
                  <Text
                    style={[
                      styles.subButtonText,
                      findIdMethod === 'phone' && styles.subButtonTextActive,
                    ]}>
                    본인인증 찾기
                  </Text>
                </TouchableOpacity>
              </View>

              {findIdMethod === 'email' ? (
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>이메일</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="이메일을 입력해주세요"
                      placeholderTextColor={GRAY}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>연락처 본인 인증</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="연락처를 입력해주세요"
                      placeholderTextColor={GRAY}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                    <TouchableOpacity>
                      <Text style={styles.verifyText}>인증하기</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>아이디</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="아이디를 입력해주세요"
                    placeholderTextColor={GRAY}
                    value={userId}
                    onChangeText={setUserId}
                    autoCapitalize="none"
                  />
                </View>

                <Text style={[styles.formLabel, {marginTop: 16}]}>
                  연락처 본인 인증
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="연락처를 입력해주세요"
                    placeholderTextColor={GRAY}
                    value={resetPhone}
                    onChangeText={setResetPhone}
                    keyboardType="phone-pad"
                  />
                  <TouchableOpacity>
                    <Text style={styles.verifyText}>인증하기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.bottomAction}>
          <GreenButton
            title={activeTab === 'findId' ? '조회하기' : '비밀번호 재설정'}
            onPress={() => {
              if (activeTab === 'findId') {
                setShowResult(true);
              } else {
                setIsResetScreen(true);
              }
            }}
          />
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
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: GRAY_DARK,
    marginHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: GREEN,
  },
  tabText: {
    color: GRAY,
    fontSize: 15,
    fontWeight: '600',
  },
  tabTextActive: {
    color: GREEN,
  },
  subButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  subButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GRAY_DARK,
    alignItems: 'center',
  },
  subButtonActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  subButtonText: {
    color: GRAY_LIGHT,
    fontSize: 13,
    fontWeight: '600',
  },
  subButtonTextActive: {
    color: '#000000',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  formSection: {
    marginBottom: 16,
  },
  formLabel: {
    color: GRAY_LIGHT,
    fontSize: 13,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GRAY_DARK,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    color: WHITE,
    fontSize: 15,
    padding: 0,
  },
  verifyText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  eyeIcon: {
    marginLeft: 8,
  },
  bottomAction: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
  },
  resultContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountAvatarText: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '900',
  },
  accountInfo: {
    marginLeft: 12,
  },
  accountId: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '600',
  },
  accountEmail: {
    color: GRAY_LIGHT,
    fontSize: 12,
    marginTop: 2,
  },
  grayButton: {
    alignSelf: 'center',
    backgroundColor: GRAY_DARK,
    borderRadius: 24,
    paddingHorizontal: 40,
    paddingVertical: 12,
  },
  grayButtonText: {
    color: GRAY_LIGHT,
    fontSize: 14,
    fontWeight: '600',
  },
  resetContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  resetSubtitle: {
    color: GRAY_LIGHT,
    fontSize: 14,
    marginBottom: 24,
  },
});

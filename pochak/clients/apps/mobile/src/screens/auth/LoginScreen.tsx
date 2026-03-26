import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../api/authService';
import { changeLanguage } from '../../i18n';
import { GATEWAY_URL } from '../../api/client';

const BG = '#1A1A1A';
const SURFACE = '#262626';
const GREEN = '#00CC33';
const WHITE = '#FFFFFF';
const GRAY = '#A6A6A6';
const GRAY_LIGHT = '#A6A6A6';
const BORDER = '#4D4D4D';
const ERROR_RED = '#E51728';

const LoginScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigation = useNavigation<any>();
  const login = useAuthStore(state => state.login);
  const setTokens = useAuthStore(state => state.setTokens);

  const toggleLanguage = () => {
    const next = i18n.language === 'ko' ? 'en' : 'ko';
    changeLanguage(next);
  };

  const handleKakaoLogin = async () => {
    const kakaoRestKey = '<REDACTED_KAKAO_REST_KEY>';
    const redirectUri = encodeURIComponent(`${GATEWAY_URL}/api/v1/auth/oauth2/callback/kakao`);
    const url = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoRestKey}&redirect_uri=${redirectUri}&response_type=code`;
    await Linking.openURL(url);
  };

  const handleGoogleLogin = async () => {
    const clientId = '<REDACTED_GOOGLE_CLIENT_ID>';
    const redirectUri = encodeURIComponent(`${GATEWAY_URL}/api/v1/auth/oauth2/callback/google`);
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;
    await Linking.openURL(url);
  };

  const handleNaverLogin = async () => {
    const clientId = '<REDACTED_NAVER_CLIENT_ID>';
    const redirectUri = encodeURIComponent(`${GATEWAY_URL}/api/v1/auth/oauth2/callback/naver`);
    const url = `https://nid.naver.com/oauth2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    await Linking.openURL(url);
  };

  const handleAppleLogin = () => {
    Alert.alert('준비 중', 'Apple 로그인은 Developer 등록 후 지원됩니다.');
  };

  const handleLogin = async () => {
    if (!userId || !password) {
      setErrorMessage(t('auth.enterCredentials'));
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    try {
      const result = await authService.signIn(userId, password);
      setTokens(result.accessToken, result.refreshToken);
      login(result.accessToken, result.user);
      if (!keepLoggedIn) {
        await AsyncStorage.setItem('pochak_session_only', 'true');
      } else {
        await AsyncStorage.removeItem('pochak_session_only');
      }
    } catch (e: any) {
      setErrorMessage(e.message || t('auth.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBtn} />
          <TouchableOpacity style={styles.headerRight} onPress={toggleLanguage}>
            <Text style={styles.langText}>{i18n.language === 'ko' ? '한국어' : 'English'}</Text>
            <MaterialIcons name="language" size={20} color={GRAY_LIGHT} />
          </TouchableOpacity>
        </View>

        {/* Brand */}
        <View style={styles.brandSection}>
          <Text style={styles.brandName}>POCHAK</Text>
          <Text style={styles.brandSlogan}>Connect you play.</Text>
        </View>


        {/* Input Fields */}
        <View style={styles.inputSection}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={t('auth.idPlaceholder')}
              placeholderTextColor={GRAY}
              value={userId}
              onChangeText={setUserId}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={t('auth.pwPlaceholder')}
              placeholderTextColor={GRAY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color={GRAY}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Message */}
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={BG} size="small" />
          ) : (
            <Text style={styles.loginButtonText}>{t('common.login')}</Text>
          )}
        </TouchableOpacity>

        {/* Options Row */}
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => setKeepLoggedIn(!keepLoggedIn)}
          >
            <View style={[styles.checkbox, keepLoggedIn && styles.checkboxActive]}>
              {keepLoggedIn && (
                <MaterialIcons name="check" size={14} color={BG} />
              )}
            </View>
            <Text style={styles.optionText}>{t('auth.keepLogin')}</Text>
          </TouchableOpacity>
          <Text style={styles.optionDivider}>|</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FindAccount')}>
            <Text style={styles.optionText}>{t('auth.findAccount')}</Text>
          </TouchableOpacity>
          <Text style={styles.optionDivider}>|</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.optionText}>{t('common.signup')}</Text>
          </TouchableOpacity>
        </View>

        {/* SNS Buttons - horizontal pill style (Figma 디자인) */}
        <View style={styles.snsRow}>
          {/* 카카오 */}
          <TouchableOpacity
            style={[styles.snsPill, { backgroundColor: '#FEE500' }]}
            onPress={handleKakaoLogin}>
            <MaterialCommunityIcons name="chat" size={22} color="#3C1E1E" />
          </TouchableOpacity>

          {/* 네이버 */}
          <TouchableOpacity
            style={[styles.snsPill, { backgroundColor: '#03C75A' }]}
            onPress={handleNaverLogin}>
            <Text style={styles.snsNaverN}>N</Text>
          </TouchableOpacity>

          {/* 구글 */}
          <TouchableOpacity
            style={[styles.snsPill, { backgroundColor: BG, borderWidth: 1, borderColor: '#555555' }]}
            onPress={handleGoogleLogin}>
            <Text style={styles.snsGoogleG}>G</Text>
          </TouchableOpacity>

          {/* 애플 */}
          <TouchableOpacity
            style={[styles.snsPill, { backgroundColor: '#000000', opacity: 0.5 }]}
            onPress={handleAppleLogin}
            disabled>
            <Ionicons name="logo-apple" size={22} color={WHITE} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerBtn: {
    padding: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  langText: {
    color: GRAY_LIGHT,
    fontSize: 14,
  },
  brandSection: {
    alignItems: 'flex-start',
    marginTop: 40,
    marginBottom: 48,
  },
  brandName: {
    color: GREEN,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 3,
  },
  brandSlogan: {
    color: WHITE,
    fontSize: 16,
    marginTop: 8,
    fontWeight: '400',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: WHITE,
    fontSize: 15,
    padding: 0,
  },
  eyeButton: {
    paddingLeft: 12,
  },
  errorText: {
    color: ERROR_RED,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: GREEN,
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: BG,
    fontSize: 18,
    fontWeight: '700',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: GRAY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  checkboxActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  optionText: {
    color: GRAY_LIGHT,
    fontSize: 13,
  },
  optionDivider: {
    color: '#555',
    fontSize: 13,
    marginHorizontal: 10,
  },
  snsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  snsPill: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snsNaverN: {
    color: WHITE,
    fontSize: 20,
    fontWeight: '900',
  },
  snsGoogleG: {
    color: '#4285F4',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default LoginScreen;

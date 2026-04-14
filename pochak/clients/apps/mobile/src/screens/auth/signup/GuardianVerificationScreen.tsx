import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import GreenButton from '../../../components/common/GreenButton';
import {phoneVerificationService} from '../../../api/phoneVerificationService';

const BG = '#1A1A1A';
const SURFACE = '#262626';
const GREEN = '#00CC33';
const WHITE = '#FFFFFF';
const GRAY = '#A6A6A6';

interface GuardianVerificationScreenProps {
  onNext?: (data?: Record<string, any>) => void;
  onBack?: () => void;
  formData?: Record<string, any>;
}

const TIMER_DURATION = 180; // 3 minutes

const GuardianVerificationScreen: React.FC<GuardianVerificationScreenProps> = ({
  onNext,
  onBack,
  formData = {},
}) => {
  const [phone, setPhone] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState('');
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer
  useEffect(() => {
    if (isTimerActive && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, timer]);

  const formatTimer = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendCode = useCallback(async () => {
    if (phone.length < 10) {
      Alert.alert('알림', '올바른 전화번호를 입력해 주세요.');
      return;
    }
    try {
      await phoneVerificationService.sendCode(phone, 'GUARDIAN');
      setCodeSent(true);
      setCode('');
      setTimer(TIMER_DURATION);
      setIsTimerActive(true);
      setVerified(false);
    } catch {
      Alert.alert('오류', '인증번호 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }, [phone]);

  const handleVerifyCode = useCallback(async () => {
    if (code.length !== 6) {
      Alert.alert('알림', '6자리 인증번호를 입력해 주세요.');
      return;
    }
    try {
      const result = await phoneVerificationService.verifyCode(phone, code, 'GUARDIAN');
      if (result.verified) {
        setVerified(true);
        setVerifiedToken(result.verifiedToken);
        setIsTimerActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        Alert.alert('오류', '인증번호가 올바르지 않습니다.');
      }
    } catch {
      Alert.alert('오류', '인증번호 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }, [code, phone]);

  const handleNext = useCallback(() => {
    onNext?.({
      guardian_phone: phone,
      guardian_verified_token: verifiedToken,
    });
  }, [onNext, phone, verifiedToken]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={styles.container}>
        <View style={styles.topSection}>
          <Text style={styles.title}>법정대리인 본인 인증</Text>
          <View style={styles.infoRow}>
            <MaterialIcons
              name="info-outline"
              size={16}
              color={GRAY}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              법정대리인 정보는 가입시 함께 보관됩니다.
            </Text>
          </View>

          {verified ? (
            <View style={styles.verifiedRow}>
              <Text style={styles.verifiedPhone}>{phone}</Text>
              <MaterialIcons name="check-circle" size={22} color={GREEN} />
            </View>
          ) : (
            <>
              {/* Phone input + send button */}
              <View style={styles.phoneRow}>
                <View style={styles.phoneInputWrapper}>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="법정대리인 전화번호를 입력해 주세요"
                    placeholderTextColor={GRAY}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    editable={!codeSent}
                  />
                </View>
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendCode}
                  disabled={phone.length < 10}>
                  <Text
                    style={[
                      styles.sendButtonText,
                      phone.length < 10 && styles.sendButtonTextDisabled,
                    ]}>
                    {codeSent ? '재전송' : '인증하기'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Code input + timer */}
              {codeSent && (
                <View style={styles.codeSection}>
                  <View style={styles.codeRow}>
                    <View style={styles.codeInputWrapper}>
                      <TextInput
                        style={styles.codeInput}
                        placeholder="인증번호 6자리"
                        placeholderTextColor={GRAY}
                        value={code}
                        onChangeText={text => {
                          if (text.length <= 6) setCode(text);
                        }}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                      {timer > 0 && isTimerActive && (
                        <Text style={styles.timerText}>
                          {formatTimer(timer)}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.verifyButton,
                        code.length === 6 && styles.verifyButtonActive,
                      ]}
                      onPress={handleVerifyCode}
                      disabled={code.length !== 6}>
                      <Text
                        style={[
                          styles.verifyButtonText,
                          code.length === 6 && styles.verifyButtonTextActive,
                        ]}>
                        확인
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {timer === 0 && !verified && (
                    <Text style={styles.expiredText}>
                      인증시간이 만료되었습니다. 재전송해 주세요.
                    </Text>
                  )}
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.bottomSection}>
          <GreenButton
            title="다음"
            onPress={handleNext}
            disabled={!verified}
          />
        </View>
      </View>
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
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topSection: {
    paddingTop: 48,
  },
  title: {
    color: WHITE,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  infoIcon: {
    marginRight: 4,
  },
  infoText: {
    color: GRAY,
    fontSize: 14,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phoneInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4D4D4D',
    paddingHorizontal: 16,
    height: 50,
  },
  phoneInput: {
    flex: 1,
    color: WHITE,
    fontSize: 15,
    padding: 0,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sendButtonText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: GRAY,
  },
  codeSection: {
    marginTop: 16,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  codeInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4D4D4D',
    paddingHorizontal: 16,
    height: 50,
  },
  codeInput: {
    flex: 1,
    color: WHITE,
    fontSize: 15,
    padding: 0,
  },
  timerText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  verifyButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4D4D4D',
  },
  verifyButtonActive: {
    borderColor: GREEN,
  },
  verifyButtonText: {
    color: GRAY,
    fontSize: 14,
    fontWeight: '600',
  },
  verifyButtonTextActive: {
    color: GREEN,
  },
  expiredText: {
    color: '#E51728',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GREEN,
    paddingHorizontal: 16,
    height: 50,
  },
  verifiedPhone: {
    color: WHITE,
    fontSize: 15,
  },
  bottomSection: {
    paddingBottom: 32,
  },
});

export default GuardianVerificationScreen;

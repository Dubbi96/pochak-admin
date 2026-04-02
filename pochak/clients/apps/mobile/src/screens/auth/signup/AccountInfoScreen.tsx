import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import GreenButton from '../../../components/common/GreenButton';
import {authService} from '../../../api/authService';
import type {SignupRoute} from './SignUpScreen';

const BG = '#1A1A1A';
const SURFACE = '#262626';
const GREEN = '#00CC33';
const WHITE = '#FFFFFF';
const GRAY = '#A6A6A6';
const GRAY_LIGHT = '#A6A6A6';
const ERROR_RED = '#E51728';

interface AccountInfoScreenProps {
  route?: SignupRoute;
  onNext?: (data?: Record<string, any>) => void;
  onBack?: () => void;
}

// --- Validation helpers ---

function validateUserId(id: string): string | null {
  if (id.length === 0) return null;
  if (id.length < 6 || id.length > 20) return '아이디는 6~20자여야 합니다.';
  if (!/^[a-zA-Z]/.test(id)) return '영문자로 시작해야 합니다.';
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(id))
    return '영문, 숫자, 밑줄(_)만 사용 가능합니다.';
  return null;
}

function validatePassword(pw: string): string | null {
  if (pw.length === 0) return null;
  if (pw.length < 8 || pw.length > 20) return '비밀번호는 8~20자여야 합니다.';
  let categories = 0;
  if (/[A-Z]/.test(pw)) categories++;
  if (/[a-z]/.test(pw)) categories++;
  if (/[0-9]/.test(pw)) categories++;
  if (/[^A-Za-z0-9]/.test(pw)) categories++;
  if (categories < 3)
    return '대문자, 소문자, 숫자, 특수문자 중 3가지 이상 포함해야 합니다.';
  return null;
}

function validateConfirmPassword(pw: string, confirm: string): string | null {
  if (confirm.length === 0) return null;
  if (pw !== confirm) return '비밀번호가 일치하지 않습니다.';
  return null;
}

function validateEmail(email: string): string | null {
  if (email.length === 0) return null;
  if (!/^[a-zA-Z0-9._%+-]+$/.test(email))
    return '올바른 이메일 형식이 아닙니다.';
  return null;
}

// Months/days for birthday dropdowns
const MONTHS = Array.from({length: 12}, (_, i) =>
  String(i + 1).padStart(2, '0'),
);
const DAYS = Array.from({length: 31}, (_, i) =>
  String(i + 1).padStart(2, '0'),
);

const AccountInfoScreen: React.FC<AccountInfoScreenProps> = ({
  route: signupRoute = 'DOMESTIC_ADULT',
  onNext,
  onBack,
}) => {
  const isSNS = signupRoute === 'SNS';
  const isForeign = signupRoute === 'FOREIGN';

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [emailDomain, setEmailDomain] = useState('gmail.com');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [idChecked, setIdChecked] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [idCheckLoading, setIdCheckLoading] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [idCheckError, setIdCheckError] = useState('');
  const [emailCheckError, setEmailCheckError] = useState('');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showDayDropdown, setShowDayDropdown] = useState(false);

  const handleUserIdChange = (text: string) => {
    setUserId(text);
    setIdChecked(false);
    setIdCheckError('');
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailChecked(false);
    setEmailCheckError('');
  };

  // Validation errors
  const userIdError = validateUserId(userId);
  const passwordError = validatePassword(password);
  const confirmPasswordError = validateConfirmPassword(
    password,
    confirmPassword,
  );
  const emailError = validateEmail(email);

  // Check if form is valid based on route
  const isFormValid = useMemo(() => {
    const baseValid =
      userId.length >= 6 &&
      !userIdError &&
      idChecked &&
      password.length >= 8 &&
      !passwordError &&
      confirmPassword.length > 0 &&
      !confirmPasswordError;

    if (isForeign) {
      // Foreign: ID + password + birthday (no email field, already verified)
      return (
        baseValid &&
        birthYear.length === 4 &&
        birthMonth.length > 0 &&
        birthDay.length > 0
      );
    }

    if (isSNS) {
      // SNS: ID + birthday (no password, no email)
      return (
        userId.length >= 6 &&
        !userIdError &&
        idChecked &&
        birthYear.length === 4 &&
        birthMonth.length > 0 &&
        birthDay.length > 0
      );
    }

    // Domestic adult/minor: ID + password + email
    return baseValid && email.length > 0 && !emailError && emailChecked;
  }, [
    isSNS,
    isForeign,
    userId,
    userIdError,
    idChecked,
    password,
    passwordError,
    confirmPassword,
    confirmPasswordError,
    email,
    emailError,
    emailChecked,
    birthYear,
    birthMonth,
    birthDay,
  ]);

  const handleIdCheck = async () => {
    if (!userIdError && userId.length >= 6) {
      setIdCheckLoading(true);
      setIdCheckError('');
      try {
        const available = await authService.checkDuplicate('loginId', userId);
        if (available) {
          setIdChecked(true);
        } else {
          setIdCheckError('이미 사용 중인 아이디입니다.');
          setIdChecked(false);
        }
      } catch {
        setIdCheckError('중복확인에 실패했습니다.');
        setIdChecked(false);
      } finally {
        setIdCheckLoading(false);
      }
    }
  };

  const handleEmailCheck = async () => {
    if (!emailError && email.length > 0) {
      setEmailCheckLoading(true);
      setEmailCheckError('');
      try {
        const fullEmail = `${email}@${emailDomain}`;
        const available = await authService.checkDuplicate('email', fullEmail);
        if (available) {
          setEmailChecked(true);
        } else {
          setEmailCheckError('이미 사용 중인 이메일입니다.');
          setEmailChecked(false);
        }
      } catch {
        setEmailCheckError('중복확인에 실패했습니다.');
        setEmailChecked(false);
      } finally {
        setEmailCheckLoading(false);
      }
    }
  };

  const handleNext = () => {
    const data: Record<string, any> = {
      userId,
    };
    if (!isSNS) {
      data.password = password;
    }
    if (!isForeign && !isSNS) {
      data.email = `${email}@${emailDomain}`;
    }
    if (isForeign || isSNS) {
      data.birthday = `${birthYear}-${birthMonth}-${birthDay}`;
    }
    onNext?.(data);
  };

  // Determine title
  const title = isForeign ? 'Create account.' : isSNS ? '계정정보 입력' : '계정정보 입력';

  // Show password fields for domestic and foreign, not for SNS
  const showPasswordFields = !isSNS;
  // Show email for domestic only (not SNS, not foreign)
  const showEmailField = !isSNS && !isForeign;
  // Show birthday for foreign and SNS
  const showBirthdayField = isForeign || isSNS;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{title}</Text>

        {/* User ID */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>{isForeign ? 'User ID' : '아이디'}</Text>
          <View style={styles.inputRow}>
            <View
              style={[
                styles.inputWrapper,
                {flex: 1},
                userIdError ? styles.inputError : null,
              ]}>
              <TextInput
                style={styles.input}
                placeholder={
                  isForeign
                    ? 'Enter your user ID'
                    : '아이디를 입력해 주세요'
                }
                placeholderTextColor={GRAY}
                value={userId}
                onChangeText={handleUserIdChange}
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity
              style={[
                styles.idCheckButton,
                idChecked && styles.idCheckButtonDone,
              ]}
              onPress={handleIdCheck}
              disabled={idCheckLoading}>
              {idCheckLoading ? (
                <ActivityIndicator color={GREEN} size="small" />
              ) : (
                <Text
                  style={[
                    styles.idCheckText,
                    idChecked && styles.idCheckTextDone,
                  ]}>
                  {idChecked
                    ? isForeign
                      ? 'Verified'
                      : '확인완료'
                    : isForeign
                      ? 'ID Check'
                      : '중복체크'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          {userIdError ? (
            <Text style={styles.errorText}>{userIdError}</Text>
          ) : idCheckError ? (
            <Text style={styles.errorText}>{idCheckError}</Text>
          ) : idChecked ? (
            <Text style={styles.successText}>
              {isForeign
                ? 'This ID is available.'
                : '사용 가능한 아이디입니다.'}
            </Text>
          ) : null}
        </View>

        {/* Password */}
        {showPasswordFields && (
          <>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                {isForeign ? 'Password' : '비밀번호'}
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  passwordError ? styles.inputError : null,
                ]}>
                <TextInput
                  style={styles.input}
                  placeholder={
                    isForeign
                      ? 'Enter your password'
                      : '비밀번호를 입력해 주세요'
                  }
                  placeholderTextColor={GRAY}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={GRAY}
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                {isForeign ? 'Confirm Password' : '비밀번호 확인'}
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  confirmPasswordError ? styles.inputError : null,
                ]}>
                <TextInput
                  style={styles.input}
                  placeholder={
                    isForeign
                      ? 'Confirm your password'
                      : '비밀번호를 다시 입력해 주세요'
                  }
                  placeholderTextColor={GRAY}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }>
                  <Ionicons
                    name={
                      showConfirmPassword ? 'eye-outline' : 'eye-off-outline'
                    }
                    size={20}
                    color={GRAY}
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : confirmPassword.length > 0 && !confirmPasswordError ? (
                <Text style={styles.successText}>
                  {isForeign
                    ? 'Passwords match.'
                    : '비밀번호가 일치합니다.'}
                </Text>
              ) : null}
            </View>
          </>
        )}

        {/* Email (domestic signup only) */}
        {showEmailField && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>이메일</Text>
            <View style={styles.emailRow}>
              <View
                style={[
                  styles.inputWrapper,
                  {flex: 1},
                  emailError ? styles.inputError : null,
                ]}>
                <TextInput
                  style={styles.input}
                  placeholder="이메일"
                  placeholderTextColor={GRAY}
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <Text style={styles.atSign}>@</Text>
              <TouchableOpacity style={styles.domainDropdown}>
                <Text style={styles.domainText}>{emailDomain}</Text>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={20}
                  color={GRAY}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.emailCheckRow}>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : emailCheckError ? (
                <Text style={styles.errorText}>{emailCheckError}</Text>
              ) : emailChecked ? (
                <Text style={styles.successText}>
                  사용 가능한 이메일입니다.
                </Text>
              ) : null}
              <TouchableOpacity
                style={[
                  styles.emailCheckButton,
                  emailChecked && styles.emailCheckButtonDone,
                ]}
                onPress={handleEmailCheck}
                disabled={emailCheckLoading}>
                {emailCheckLoading ? (
                  <ActivityIndicator color={GREEN} size="small" />
                ) : (
                  <Text
                    style={[
                      styles.emailCheckText,
                      emailChecked && styles.emailCheckTextDone,
                    ]}>
                    {emailChecked ? '확인완료' : '중복확인'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Birthday (Foreign and SNS) */}
        {showBirthdayField && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              {isForeign ? 'Birthday' : '생년월일'}
            </Text>
            <View style={styles.birthdayRow}>
              <View style={[styles.inputWrapper, styles.birthdayInput]}>
                <TextInput
                  style={styles.input}
                  placeholder={isForeign ? 'Year' : '년도'}
                  placeholderTextColor={GRAY}
                  value={birthYear}
                  onChangeText={setBirthYear}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
              <View style={[styles.inputWrapper, styles.birthdayInput]}>
                <TextInput
                  style={styles.input}
                  placeholder={isForeign ? 'Month' : '월'}
                  placeholderTextColor={GRAY}
                  value={birthMonth}
                  onChangeText={setBirthMonth}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <View style={[styles.inputWrapper, styles.birthdayInput]}>
                <TextInput
                  style={styles.input}
                  placeholder={isForeign ? 'Day' : '일'}
                  placeholderTextColor={GRAY}
                  value={birthDay}
                  onChangeText={setBirthDay}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomSection}>
        <GreenButton
          title={isForeign ? 'Next' : '다음'}
          onPress={handleNext}
          disabled={!isFormValid}
        />
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
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  title: {
    color: WHITE,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 32,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    color: GRAY_LIGHT,
    fontSize: 13,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4D4D4D',
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: ERROR_RED,
  },
  input: {
    flex: 1,
    color: WHITE,
    fontSize: 15,
    padding: 0,
  },
  eyeIcon: {
    marginLeft: 8,
  },
  idCheckButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GREEN,
  },
  idCheckButtonDone: {
    borderColor: GRAY,
    backgroundColor: 'rgba(0,200,83,0.1)',
  },
  idCheckText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '600',
  },
  idCheckTextDone: {
    color: GREEN,
  },
  errorText: {
    color: ERROR_RED,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  successText: {
    color: GREEN,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  atSign: {
    color: GRAY_LIGHT,
    fontSize: 16,
  },
  domainDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4D4D4D',
    paddingHorizontal: 14,
    height: 56,
  },
  domainText: {
    color: WHITE,
    fontSize: 14,
    marginRight: 4,
  },
  emailCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  emailCheckButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GREEN,
  },
  emailCheckButtonDone: {
    borderColor: GRAY,
    backgroundColor: 'rgba(0,200,83,0.1)',
  },
  emailCheckText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '600',
  },
  emailCheckTextDone: {
    color: GREEN,
  },
  birthdayRow: {
    flexDirection: 'row',
    gap: 10,
  },
  birthdayInput: {
    flex: 1,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: BG,
  },
});

export default AccountInfoScreen;

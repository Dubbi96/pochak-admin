import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import GreenButton from '../../../components/common/GreenButton';

const BG = '#1A1A1A';
const SURFACE = '#262626';
const GREEN = '#00CC33';
const WHITE = '#FFFFFF';
const GRAY = '#A6A6A6';
const GRAY_LIGHT = '#A6A6A6';

const EMAIL_DOMAINS = ['hogak.co.kr', 'gmail.com', 'naver.com', 'custom'];

interface ForeignerEmailVerifyScreenProps {
  onNext?: (data?: Record<string, any>) => void;
  onBack?: () => void;
  formData?: Record<string, any>;
}

const ForeignerEmailVerifyScreen: React.FC<ForeignerEmailVerifyScreenProps> = ({
  onNext,
  onBack,
  formData = {},
}) => {
  const [emailLocal, setEmailLocal] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('gmail.com');
  const [customDomain, setCustomDomain] = useState('');
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const domain = selectedDomain === 'custom' ? customDomain : selectedDomain;
  const fullEmail = `${emailLocal}@${domain}`;
  const canSend = emailLocal.length > 0 && domain.length > 0;

  const handleDomainSelect = useCallback((d: string) => {
    setSelectedDomain(d);
    setShowDomainDropdown(false);
    if (d !== 'custom') {
      setCustomDomain('');
    }
  }, []);

  const handleSendEmail = useCallback(() => {
    if (!canSend) return;
    // Mock: send verification email
    setEmailSent(true);
  }, [canSend]);

  const handleResendEmail = useCallback(() => {
    // Mock: resend
    setEmailSent(true);
  }, []);

  // Mock: simulate email verification (in real app, deep link or polling)
  const handleMockVerify = useCallback(() => {
    setEmailVerified(true);
  }, []);

  const handleNext = useCallback(() => {
    onNext?.({
      email: fullEmail,
      email_verified_token: `mock-email-token-${Date.now()}`,
    });
  }, [onNext, fullEmail]);

  const handleBackToHome = useCallback(() => {
    onBack?.();
  }, [onBack]);

  // ─── Sent state ──────────────────────────────────────────────

  if (emailSent && !emailVerified) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <View style={styles.container}>
          <View style={styles.sentSection}>
            <MaterialIcons
              name="mark-email-read"
              size={64}
              color={GREEN}
              style={styles.sentIcon}
            />
            <Text style={styles.sentTitle}>
              Verification email sent.
            </Text>
            <Text style={styles.sentSubtitle}>
              Please check your inbox.
            </Text>
            <Text style={styles.sentEmail}>{fullEmail}</Text>
          </View>

          <View style={styles.bottomSection}>
            {/* Mock verify button for development */}
            <GreenButton
              title="Verify (dev mock)"
              onPress={handleMockVerify}
              style={styles.mockButton}
            />

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendEmail}>
              <Text style={styles.resendText}>Resend Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backHomeButton}
              onPress={handleBackToHome}>
              <Text style={styles.backHomeText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Verified state ──────────────────────────────────────────

  if (emailVerified) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <View style={styles.container}>
          <View style={styles.topSection}>
            <Text style={styles.title}>Verify email.</Text>

            <View style={styles.verifiedRow}>
              <Text style={styles.verifiedEmail}>{fullEmail}</Text>
              <MaterialIcons name="check-circle" size={22} color={GREEN} />
            </View>
          </View>

          <View style={styles.bottomSection}>
            <GreenButton title="Next" onPress={handleNext} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Input state ─────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Verify email.</Text>

        {/* Email input row */}
        <View style={styles.emailRow}>
          <View style={styles.emailLocalWrapper}>
            <TextInput
              style={styles.emailLocalInput}
              placeholder="email"
              placeholderTextColor={GRAY}
              value={emailLocal}
              onChangeText={setEmailLocal}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <Text style={styles.atSign}>@</Text>
          <TouchableOpacity
            style={styles.domainDropdown}
            onPress={() => setShowDomainDropdown(!showDomainDropdown)}>
            <Text style={styles.domainText}>
              {selectedDomain === 'custom'
                ? customDomain || 'Type domain'
                : selectedDomain}
            </Text>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={20}
              color={GRAY}
            />
          </TouchableOpacity>
        </View>

        {/* Domain dropdown */}
        {showDomainDropdown && (
          <View style={styles.dropdownList}>
            {EMAIL_DOMAINS.map(d => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.dropdownItem,
                  selectedDomain === d && styles.dropdownItemSelected,
                ]}
                onPress={() => handleDomainSelect(d)}>
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedDomain === d && styles.dropdownItemTextSelected,
                  ]}>
                  {d === 'custom' ? 'Type your own' : `@${d}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Custom domain input */}
        {selectedDomain === 'custom' && (
          <View style={styles.customDomainWrapper}>
            <TextInput
              style={styles.customDomainInput}
              placeholder="Enter domain (e.g. yahoo.com)"
              placeholderTextColor={GRAY}
              value={customDomain}
              onChangeText={setCustomDomain}
              autoCapitalize="none"
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.fixedBottom}>
        <GreenButton
          title="Next"
          onPress={handleSendEmail}
          disabled={!canSend}
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
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  topSection: {
    paddingTop: 48,
  },
  title: {
    color: WHITE,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 28,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emailLocalWrapper: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4D4D4D',
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  emailLocalInput: {
    color: WHITE,
    fontSize: 15,
    padding: 0,
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
    minWidth: 130,
  },
  domainText: {
    color: WHITE,
    fontSize: 14,
    marginRight: 4,
    flex: 1,
  },
  dropdownList: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4D4D4D',
    marginTop: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(0, 200, 83, 0.08)',
  },
  dropdownItemText: {
    color: GRAY_LIGHT,
    fontSize: 14,
  },
  dropdownItemTextSelected: {
    color: GREEN,
    fontWeight: '600',
  },
  customDomainWrapper: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4D4D4D',
    paddingHorizontal: 16,
    height: 56,
    marginTop: 12,
    justifyContent: 'center',
  },
  customDomainInput: {
    color: WHITE,
    fontSize: 15,
    padding: 0,
  },
  fixedBottom: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: BG,
  },
  // Sent state
  sentSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentIcon: {
    marginBottom: 24,
  },
  sentTitle: {
    color: WHITE,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  sentSubtitle: {
    color: GRAY_LIGHT,
    fontSize: 15,
    marginBottom: 12,
    textAlign: 'center',
  },
  sentEmail: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSection: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  mockButton: {
    marginBottom: 16,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GREEN,
    marginBottom: 12,
  },
  resendText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '600',
  },
  backHomeButton: {
    paddingVertical: 8,
  },
  backHomeText: {
    color: GRAY,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  // Verified state
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
  verifiedEmail: {
    color: WHITE,
    fontSize: 15,
  },
});

export default ForeignerEmailVerifyScreen;

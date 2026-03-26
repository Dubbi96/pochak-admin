import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import GreenButton from '../../../components/common/GreenButton';
import CheckboxItem from '../../../components/common/CheckboxItem';
import type {SignupRoute} from './SignUpScreen';

const BG = '#1A1A1A';
const SURFACE = '#262626';
const GREEN = '#00CC33';
const WHITE = '#FFFFFF';
const GRAY = '#A6A6A6';
const GRAY_LIGHT = '#A6A6A6';

interface TermsState {
  all: boolean;
  age14: boolean;
  serviceTerms: boolean;
  privacyPolicy: boolean;
  thirdParty: boolean;
  marketing: boolean;
  sms: boolean;
  email: boolean;
  push: boolean;
  nightNotification: boolean;
}

interface TermsAgreementScreenProps {
  onNext?: (data: {
    route: SignupRoute;
    consents: Record<string, boolean>;
    marketing_channels: Record<string, boolean>;
  }) => void;
  onBack?: () => void;
  currentRoute?: SignupRoute;
}

const TermsAgreementScreen: React.FC<TermsAgreementScreenProps> = ({
  onNext,
  onBack,
  currentRoute = 'DOMESTIC_ADULT',
}) => {
  const [terms, setTerms] = useState<TermsState>({
    all: false,
    age14: false,
    serviceTerms: false,
    privacyPolicy: false,
    thirdParty: false,
    marketing: false,
    sms: false,
    email: false,
    push: false,
    nightNotification: false,
  });

  const toggleAll = useCallback(() => {
    const newVal = !terms.all;
    setTerms({
      all: newVal,
      age14: newVal,
      serviceTerms: newVal,
      privacyPolicy: newVal,
      thirdParty: newVal,
      marketing: newVal,
      sms: newVal,
      email: newVal,
      push: newVal,
      nightNotification: newVal,
    });
  }, [terms.all]);

  const toggle = useCallback((key: keyof TermsState) => {
    setTerms(prev => {
      let updated = {...prev, [key]: !prev[key]};
      // 마케팅 토글 시 하위 4개도 연동
      if (key === 'marketing') {
        const marketingVal = !prev.marketing;
        updated = {
          ...updated,
          marketing: marketingVal,
          sms: marketingVal,
          email: marketingVal,
          push: marketingVal,
          nightNotification: marketingVal,
        };
      }
      // 하위 4개 중 하나라도 꺼지면 마케팅도 꺼짐, 전부 켜지면 마케팅도 켜짐
      if (['sms', 'email', 'push', 'nightNotification'].includes(key)) {
        updated.marketing =
          updated.sms &&
          updated.email &&
          updated.push &&
          updated.nightNotification;
      }
      const allChecked =
        updated.age14 &&
        updated.serviceTerms &&
        updated.privacyPolicy &&
        updated.thirdParty &&
        updated.marketing &&
        updated.sms &&
        updated.email &&
        updated.push &&
        updated.nightNotification;
      return {...updated, all: allChecked};
    });
  }, []);

  // Required consents: serviceTerms + privacyPolicy always required.
  // age14 is required for DOMESTIC_ADULT but not for DOMESTIC_MINOR.
  // For FOREIGN route, age14 is not shown/required.
  const canProceed =
    terms.serviceTerms && terms.privacyPolicy;

  // Determine the route to pass back
  const determineRoute = useCallback((): SignupRoute => {
    // If already set to SNS (entered from OAuth callback), keep it
    if (currentRoute === 'SNS') {
      return 'SNS';
    }
    // If age14 is unchecked → minor route
    if (!terms.age14) {
      return 'DOMESTIC_MINOR';
    }
    return 'DOMESTIC_ADULT';
  }, [currentRoute, terms.age14]);

  const handleNext = useCallback(() => {
    const route = determineRoute();
    onNext?.({
      route,
      consents: {
        age14: terms.age14,
        serviceTerms: terms.serviceTerms,
        privacyPolicy: terms.privacyPolicy,
        thirdParty: terms.thirdParty,
        marketing: terms.marketing,
      },
      marketing_channels: {
        sms: terms.sms,
        email: terms.email,
        push: terms.push,
        nightNotification: terms.nightNotification,
      },
    });
  }, [determineRoute, onNext, terms]);

  const handleForeignerPress = useCallback(() => {
    onNext?.({
      route: 'FOREIGN',
      consents: {
        age14: terms.age14,
        serviceTerms: terms.serviceTerms,
        privacyPolicy: terms.privacyPolicy,
        thirdParty: terms.thirdParty,
        marketing: terms.marketing,
      },
      marketing_channels: {
        sms: terms.sms,
        email: terms.email,
        push: terms.push,
        nightNotification: terms.nightNotification,
      },
    });
  }, [onNext, terms]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        <Text style={styles.title}>서비스 약관동의</Text>

        {/* All Agree Card */}
        <View style={styles.allAgreeCard}>
          <CheckboxItem
            label="전체동의"
            checked={terms.all}
            onToggle={toggleAll}
            bold
          />
        </View>

        {/* Individual Terms Card */}
        <View style={styles.termsCard}>
          <CheckboxItem
            label="만 14세 이상"
            checked={terms.age14}
            onToggle={() => toggle('age14')}
          />
          <CheckboxItem
            label="(필수) 서비스이용약관 동의"
            checked={terms.serviceTerms}
            onToggle={() => toggle('serviceTerms')}
            rightText="전문보기"
            onRightPress={() => {}}
          />
          <CheckboxItem
            label="(필수) 개인정보 수집 및 이용 동의"
            checked={terms.privacyPolicy}
            onToggle={() => toggle('privacyPolicy')}
            rightText="전문보기"
            onRightPress={() => {}}
          />
          <CheckboxItem
            label="(선택) 개인정보 제 3자 제공 동의"
            checked={terms.thirdParty}
            onToggle={() => toggle('thirdParty')}
            rightText="전문보기"
            onRightPress={() => {}}
          />
          <CheckboxItem
            label="(선택) 마케팅 정보 수신 동의"
            checked={terms.marketing}
            onToggle={() => toggle('marketing')}
            rightText="전문보기"
            onRightPress={() => {}}
          />

          {/* Sub-options for marketing */}
          <View style={styles.subOptions}>
            <TouchableOpacity
              style={styles.subOption}
              onPress={() => toggle('sms')}>
              <MaterialIcons
                name={terms.sms ? 'check-box' : 'check-box-outline-blank'}
                size={18}
                color={terms.sms ? GREEN : GRAY}
                style={styles.subCheckIcon}
              />
              <Text style={styles.subLabel}>SMS 수신</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.subOption}
              onPress={() => toggle('email')}>
              <MaterialIcons
                name={
                  terms.email ? 'check-box' : 'check-box-outline-blank'
                }
                size={18}
                color={terms.email ? GREEN : GRAY}
                style={styles.subCheckIcon}
              />
              <Text style={styles.subLabel}>이메일 수신</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.subOption}
              onPress={() => toggle('push')}>
              <MaterialIcons
                name={terms.push ? 'check-box' : 'check-box-outline-blank'}
                size={18}
                color={terms.push ? GREEN : GRAY}
                style={styles.subCheckIcon}
              />
              <Text style={styles.subLabel}>푸시 알림 수신</Text>
            </TouchableOpacity>
          </View>

          {/* Night notification */}
          <View style={styles.nightOption}>
            <TouchableOpacity
              style={styles.subOption}
              onPress={() => toggle('nightNotification')}>
              <MaterialIcons
                name={
                  terms.nightNotification
                    ? 'check-box'
                    : 'check-box-outline-blank'
                }
                size={18}
                color={terms.nightNotification ? GREEN : GRAY}
                style={styles.subCheckIcon}
              />
              <Text style={styles.subLabel}>
                야간 서비스 알림 수신 (21시 ~ 08시)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Not Korean link */}
        <TouchableOpacity
          style={styles.foreignerLink}
          onPress={handleForeignerPress}
          disabled={!canProceed}>
          <View style={styles.foreignerRow}>
            <MaterialIcons
              name="info-outline"
              size={16}
              color={GRAY_LIGHT}
              style={styles.foreignerIcon}
            />
            <Text style={styles.foreignerText}>Not Korean?</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomSection}>
        <GreenButton
          title="다음"
          onPress={handleNext}
          disabled={!canProceed}
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
    marginBottom: 28,
  },
  allAgreeCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  termsCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GREEN,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  subOptions: {
    flexDirection: 'row',
    paddingLeft: 32,
    paddingVertical: 8,
    gap: 16,
  },
  subOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subCheckIcon: {
    marginRight: 6,
  },
  subLabel: {
    color: GRAY_LIGHT,
    fontSize: 12,
  },
  nightOption: {
    paddingLeft: 32,
    paddingBottom: 8,
  },
  foreignerLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  foreignerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foreignerIcon: {
    marginRight: 4,
  },
  foreignerText: {
    color: GRAY_LIGHT,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: BG,
  },
});

export default TermsAgreementScreen;

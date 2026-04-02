import React, {useState, useCallback, useRef} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Alert} from 'react-native';
import {useNavigation, useRoute, RouteProp, CommonActions} from '@react-navigation/native';
import {colors} from '../../../theme';
import TermsAgreementScreen from './TermsAgreementScreen';
import PhoneVerificationScreen from './PhoneVerificationScreen';
import GuardianVerificationScreen from './GuardianVerificationScreen';
import ForeignerEmailVerifyScreen from './ForeignerEmailVerifyScreen';
import AccountInfoScreen from './AccountInfoScreen';
import AdditionalInfo1Screen from './AdditionalInfo1Screen';
import AdditionalInfo2Screen from './AdditionalInfo2Screen';
import AdditionalInfo3Screen from './AdditionalInfo3Screen';
import SignUpCompleteScreen from './SignUpCompleteScreen';
import {authService} from '../../../api/authService';
import {useAuthStore} from '../../../stores/authStore';

// ─── Route & Step types ─────────────────────────────────────────

export type SignupRoute = 'DOMESTIC_ADULT' | 'DOMESTIC_MINOR' | 'SNS' | 'FOREIGN';

export type SignupStep =
  | 'TERMS'
  | 'PHONE_VERIFY'
  | 'GUARDIAN_VERIFY'
  | 'MINOR_PHONE_VERIFY'
  | 'EMAIL_VERIFY'
  | 'ACCOUNT_INFO'
  | 'FOREIGN_ACCOUNT'
  | 'ADDITIONAL_1'
  | 'ADDITIONAL_2'
  | 'ADDITIONAL_3'
  | 'COMPLETE';

// ─── Route definitions ──────────────────────────────────────────

const ROUTE_STEPS: Record<SignupRoute, SignupStep[]> = {
  DOMESTIC_ADULT: [
    'TERMS',
    'PHONE_VERIFY',
    'ACCOUNT_INFO',
    'ADDITIONAL_1',
    'ADDITIONAL_2',
    'ADDITIONAL_3',
    'COMPLETE',
  ],
  DOMESTIC_MINOR: [
    'TERMS',
    'GUARDIAN_VERIFY',
    'MINOR_PHONE_VERIFY',
    'ACCOUNT_INFO',
    'ADDITIONAL_1',
    'ADDITIONAL_2',
    'ADDITIONAL_3',
    'COMPLETE',
  ],
  SNS: [
    'TERMS',
    'PHONE_VERIFY',
    'ADDITIONAL_1',
    'ADDITIONAL_2',
    'ADDITIONAL_3',
    'COMPLETE',
  ],
  FOREIGN: [
    'TERMS',
    'EMAIL_VERIFY',
    'FOREIGN_ACCOUNT',
    'ADDITIONAL_1',
    'ADDITIONAL_2',
    'ADDITIONAL_3',
    'COMPLETE',
  ],
};

export type SignUpScreenParams = {
  initialRoute?: SignupRoute;
};

export default function SignUpScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{SignUpMain: SignUpScreenParams}, 'SignUpMain'>>();
  const initialRoute = route.params?.initialRoute ?? 'DOMESTIC_ADULT';

  const [signupRoute, setSignupRoute] = useState<SignupRoute>(initialRoute);
  const [currentStep, setCurrentStep] = useState<SignupStep>('TERMS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formDataRef = useRef<Record<string, any>>({});
  const login = useAuthStore(state => state.login);
  const setTokens = useAuthStore(state => state.setTokens);

  // Derive step index & total from the current route
  const steps = ROUTE_STEPS[signupRoute];
  const currentStepIndex = steps.indexOf(currentStep);
  const totalSteps = steps.length;

  // Navigate to next step within the current route
  const goToNextStep = useCallback(
    (stepData?: Record<string, any>) => {
      if (stepData) {
        formDataRef.current = {...formDataRef.current, ...stepData};
      }
      const stepsForRoute = ROUTE_STEPS[signupRoute];
      const idx = stepsForRoute.indexOf(currentStep);
      if (idx < stepsForRoute.length - 1) {
        setCurrentStep(stepsForRoute[idx + 1]);
      }
    },
    [signupRoute, currentStep],
  );

  // Navigate back one step, or exit signup
  const goToPrevStep = useCallback(() => {
    const stepsForRoute = ROUTE_STEPS[signupRoute];
    const idx = stepsForRoute.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(stepsForRoute[idx - 1]);
    } else {
      navigation.goBack();
    }
  }, [signupRoute, currentStep, navigation]);

  // Change the signup route (e.g. from terms screen)
  const changeRoute = useCallback(
    (newRoute: SignupRoute) => {
      setSignupRoute(newRoute);
      // Stay on the current step if it exists in the new route, otherwise go to step 0
      const newSteps = ROUTE_STEPS[newRoute];
      if (!newSteps.includes(currentStep)) {
        setCurrentStep(newSteps[0]);
      }
    },
    [currentStep],
  );

  // Called from TermsAgreementScreen
  const handleTermsNext = useCallback(
    (data: {route: SignupRoute; consents: Record<string, boolean>; marketing_channels: Record<string, boolean>}) => {
      formDataRef.current = {
        ...formDataRef.current,
        termsAgreed: true,
        consents: data.consents,
        marketing_channels: data.marketing_channels,
        marketingAgreed: data.consents.marketing ?? false,
      };
      const targetRoute = data.route;
      if (targetRoute !== signupRoute) {
        setSignupRoute(targetRoute);
      }
      // Move to the next step in the (potentially new) route
      const nextSteps = ROUTE_STEPS[targetRoute];
      const termsIdx = nextSteps.indexOf('TERMS');
      if (termsIdx < nextSteps.length - 1) {
        setCurrentStep(nextSteps[termsIdx + 1]);
      }
    },
    [signupRoute],
  );

  // Skip (for optional additional info steps)
  const handleSkip = useCallback(() => {
    goToNextStep();
  }, [goToNextStep]);

  // Final submit: call signup API, then advance to COMPLETE
  const handleFinalSubmit = useCallback(async (stepData?: Record<string, any>) => {
    if (stepData) {
      formDataRef.current = {...formDataRef.current, ...stepData};
    }
    const data = formDataRef.current;
    setIsSubmitting(true);
    try {
      const result = await authService.signUp({
        email: data.email ?? `${data.userId ?? 'user'}@pochak.co.kr`,
        password: data.password ?? '',
        nickname: data.userId ?? data.nickname ?? '',
        phoneNumber: data.phone,
        termsAgreed: data.termsAgreed,
        marketingAgreed: data.marketingAgreed,
      });
      setTokens(result.accessToken, result.refreshToken);
      login(result.accessToken, result.user);
      setCurrentStep('COMPLETE');
    } catch (e: any) {
      Alert.alert(
        '회원가입 실패',
        e.message || '회원가입에 실패했습니다. 다시 시도해 주세요.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [login, setTokens]);

  // Navigate to ProductList after signup complete
  const handleSubscribe = useCallback(() => {
    // User is already logged in (tokens set during signup)
    // RootNavigator will switch to logged-in stack, then navigate to ProductList
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          {name: 'MainTab'},
          {name: 'ProductList'},
        ],
      }),
    );
  }, [navigation]);

  // Skip subscription, go straight to MainTab home
  const handleSkipToHome = useCallback(() => {
    // Auth tokens already set → RootNavigator auto-switches to MainTab
    // Nothing to do: isLoggedIn = true triggers navigator re-render
  }, []);

  // ─── Render current step ──────────────────────────────────────

  const renderStep = () => {
    switch (currentStep) {
      case 'TERMS':
        return (
          <TermsAgreementScreen
            onNext={handleTermsNext}
            onBack={goToPrevStep}
            currentRoute={signupRoute}
          />
        );
      case 'PHONE_VERIFY':
        return (
          <PhoneVerificationScreen
            onNext={goToNextStep}
            onBack={goToPrevStep}
            route={signupRoute}
            formData={formDataRef.current}
          />
        );
      case 'GUARDIAN_VERIFY':
        return (
          <GuardianVerificationScreen
            onNext={goToNextStep}
            onBack={goToPrevStep}
            formData={formDataRef.current}
          />
        );
      case 'MINOR_PHONE_VERIFY':
        return (
          <PhoneVerificationScreen
            onNext={goToNextStep}
            onBack={goToPrevStep}
            route={signupRoute}
            formData={formDataRef.current}
            isMinor
          />
        );
      case 'EMAIL_VERIFY':
        return (
          <ForeignerEmailVerifyScreen
            onNext={goToNextStep}
            onBack={goToPrevStep}
            formData={formDataRef.current}
          />
        );
      case 'ACCOUNT_INFO':
        return (
          <AccountInfoScreen
            onNext={goToNextStep}
            onBack={goToPrevStep}
            route={signupRoute}
          />
        );
      case 'FOREIGN_ACCOUNT':
        return (
          <AccountInfoScreen
            onNext={goToNextStep}
            onBack={goToPrevStep}
            route="FOREIGN"
          />
        );
      case 'ADDITIONAL_1':
        return (
          <AdditionalInfo1Screen
            onNext={goToNextStep}
            onBack={goToPrevStep}
            onSkip={handleSkip}
          />
        );
      case 'ADDITIONAL_2':
        return (
          <AdditionalInfo2Screen
            onNext={goToNextStep}
            onBack={goToPrevStep}
            onSkip={handleSkip}
          />
        );
      case 'ADDITIONAL_3':
        return (
          <AdditionalInfo3Screen
            onNext={handleFinalSubmit}
            onBack={goToPrevStep}
            onSkip={() => handleFinalSubmit()}
            isSubmitting={isSubmitting}
          />
        );
      case 'COMPLETE':
        return (
          <SignUpCompleteScreen
            onSubscribe={handleSubscribe}
            onSkipToHome={handleSkipToHome}
          />
        );
      default:
        return null;
    }
  };

  // Hide top progress bar on additional info screens (they have their own header)
  // and on the complete screen
  const STEPS_WITH_OWN_HEADER: SignupStep[] = [
    'ADDITIONAL_1',
    'ADDITIONAL_2',
    'ADDITIONAL_3',
    'COMPLETE',
  ];
  const showProgress = !STEPS_WITH_OWN_HEADER.includes(currentStep);

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      {showProgress && (
        <View style={styles.progressContainer}>
          <TouchableOpacity onPress={goToPrevStep} style={styles.backButton}>
            <Text style={styles.backText}>{'<'}</Text>
          </TouchableOpacity>
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
          <Text style={styles.stepIndicator}>
            {currentStepIndex + 1}/{totalSteps}
          </Text>
        </View>
      )}

      {/* Current step content */}
      <View style={styles.stepContent}>{renderStep()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.bg,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  progressBarWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4D4D4D',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00CC33',
    borderRadius: 2,
  },
  stepIndicator: {
    color: '#A6A6A6',
    fontSize: 12,
    marginLeft: 8,
    minWidth: 30,
    textAlign: 'right',
  },
  stepContent: {
    flex: 1,
  },
});

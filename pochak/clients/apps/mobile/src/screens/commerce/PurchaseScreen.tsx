import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../theme';
import {
  PaymentMethod,
  paymentMethods,
  formatPrice,
} from '../../services/commerceApi';
import {commerceService} from '../../api/commerceService';
import {analyticsService} from '../../services/analyticsService';

const GREEN = colors.green;
const BG = colors.bg;
const SURFACE = colors.surface;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;
const GRAY_DARK = colors.grayDark;

const STEPS = ['상품확인', '결제수단', '결제완료'] as const;

function StepIndicator({currentStep}: {currentStep: number}) {
  return (
    <View style={styles.stepContainer}>
      {STEPS.map((step, index) => (
        <React.Fragment key={step}>
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                index <= currentStep && styles.stepCircleActive,
              ]}>
              {index < currentStep ? (
                <MaterialIcons name="check" size={14} color="#000" />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    index <= currentStep && styles.stepNumberActive,
                  ]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                index <= currentStep && styles.stepLabelActive,
              ]}>
              {step}
            </Text>
          </View>
          {index < STEPS.length - 1 && (
            <View
              style={[
                styles.stepLine,
                index < currentStep && styles.stepLineActive,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

// Mock product for the purchase flow
const MOCK_PRODUCT = {
  name: '대가족 무제한 시청권',
  price: 29900,
  priceUnit: '원' as const,
  duration: '30일',
};

export default function PurchaseScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{purchaseId: string; validUntil: string} | null>(null);
  const navigation = useNavigation<any>();

  const handleNext = async () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 1 && selectedPayment) {
      setIsPurchasing(true);
      try {
        const result = await commerceService.purchase({
          productId: 'product-family-unlimited',
          paymentMethod: selectedPayment,
        });
        if (result.success) {
          const now = new Date();
          const expiry = new Date(now);
          expiry.setDate(expiry.getDate() + 30);
          const fmt = (d: Date) =>
            `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
          setPurchaseResult({
            purchaseId: result.purchaseId,
            validUntil: `${fmt(now)} ~ ${fmt(expiry)}`,
          });
          analyticsService.trackPurchase(
            'product-family-unlimited',
            MOCK_PRODUCT.price,
            selectedPayment,
          );
          setCurrentStep(2);
        } else {
          Alert.alert('결제 실패', '결제에 실패했습니다. 다시 시도해 주세요.');
        }
      } catch (e: any) {
        Alert.alert('결제 오류', e.message || '결제 중 오류가 발생했습니다.');
      } finally {
        setIsPurchasing(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={currentStep > 0 && currentStep < 2 ? handleBack : undefined}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={currentStep > 0 && currentStep < 2 ? WHITE : 'transparent'}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>결제</Text>
        <View style={{width: 24}} />
      </View>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Step 1: Product Confirmation */}
        {currentStep === 0 && (
          <View>
            <Text style={styles.sectionTitle}>상품 정보</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryProductName}>{MOCK_PRODUCT.name}</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>이용기간</Text>
                <Text style={styles.summaryValue}>{MOCK_PRODUCT.duration}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>결제금액</Text>
                <Text style={styles.summaryPrice}>
                  {formatPrice(MOCK_PRODUCT.price, MOCK_PRODUCT.priceUnit)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleNext}
              activeOpacity={0.7}>
              <Text style={styles.primaryButtonText}>결제수단 선택</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Payment Method */}
        {currentStep === 1 && (
          <View>
            <Text style={styles.sectionTitle}>결제수단 선택</Text>
            <View style={styles.paymentList}>
              {paymentMethods.map(pm => (
                <TouchableOpacity
                  key={pm.method}
                  style={[
                    styles.paymentOption,
                    selectedPayment === pm.method && styles.paymentOptionActive,
                  ]}
                  onPress={() => setSelectedPayment(pm.method)}
                  activeOpacity={0.7}>
                  <View style={styles.paymentLeft}>
                    <MaterialIcons
                      name={pm.icon as keyof typeof MaterialIcons.glyphMap}
                      size={24}
                      color={
                        selectedPayment === pm.method ? GREEN : GRAY_LIGHT
                      }
                    />
                    <View style={styles.paymentInfo}>
                      <Text
                        style={[
                          styles.paymentMethodText,
                          selectedPayment === pm.method &&
                            styles.paymentMethodTextActive,
                        ]}>
                        {pm.method}
                      </Text>
                      {pm.balance && (
                        <Text style={styles.paymentBalance}>
                          잔액: {pm.balance}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      selectedPayment === pm.method && styles.radioActive,
                    ]}>
                    {selectedPayment === pm.method && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Total */}
            <View style={styles.totalCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>총 결제금액</Text>
                <Text style={styles.totalPrice}>
                  {formatPrice(MOCK_PRODUCT.price, MOCK_PRODUCT.priceUnit)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!selectedPayment || isPurchasing) && styles.primaryButtonDisabled,
              ]}
              onPress={handleNext}
              activeOpacity={0.7}
              disabled={!selectedPayment || isPurchasing}>
              {isPurchasing ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text
                  style={[
                    styles.primaryButtonText,
                    !selectedPayment && styles.primaryButtonTextDisabled,
                  ]}>
                  결제하기
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Payment Complete */}
        {currentStep === 2 && (
          <View style={styles.completeContainer}>
            <View style={styles.completeIconCircle}>
              <MaterialIcons name="check" size={48} color="#000" />
            </View>
            <Text style={styles.completeTitle}>결제가 완료되었습니다</Text>

            <View style={styles.completeCard}>
              <View style={styles.completeRow}>
                <Text style={styles.completeLabel}>상품명</Text>
                <Text style={styles.completeValue}>{MOCK_PRODUCT.name}</Text>
              </View>
              <View style={styles.completeDivider} />
              <View style={styles.completeRow}>
                <Text style={styles.completeLabel}>금액</Text>
                <Text style={styles.completeValue}>
                  {formatPrice(MOCK_PRODUCT.price, MOCK_PRODUCT.priceUnit)}
                </Text>
              </View>
              <View style={styles.completeDivider} />
              <View style={styles.completeRow}>
                <Text style={styles.completeLabel}>결제수단</Text>
                <Text style={styles.completeValue}>{selectedPayment}</Text>
              </View>
              <View style={styles.completeDivider} />
              <View style={styles.completeRow}>
                <Text style={styles.completeLabel}>유효기간</Text>
                <Text style={styles.completeValue}>
                  {purchaseResult?.validUntil ?? '-'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert('구매가 완료되었습니다', '', [
                  {text: '확인', onPress: () => navigation.goBack()},
                ]);
              }}>
              <Text style={styles.primaryButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WHITE,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // Step Indicator
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GRAY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: GREEN,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: GRAY,
  },
  stepNumberActive: {
    color: '#000',
  },
  stepLabel: {
    fontSize: 11,
    color: GRAY,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: GREEN,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: GRAY_DARK,
    marginHorizontal: 8,
    marginBottom: 18,
  },
  stepLineActive: {
    backgroundColor: GREEN,
  },
  // Section
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 16,
  },
  // Summary Card
  summaryCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  summaryProductName: {
    fontSize: 18,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: GRAY_LIGHT,
  },
  summaryValue: {
    fontSize: 14,
    color: WHITE,
    fontWeight: '600',
  },
  summaryPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: GREEN,
  },
  divider: {
    height: 1,
    backgroundColor: GRAY_DARK,
    marginVertical: 12,
  },
  // Payment
  paymentList: {
    marginBottom: 24,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  paymentOptionActive: {
    borderColor: GREEN,
    backgroundColor: '#0A3D1A',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentInfo: {
    marginLeft: 12,
  },
  paymentMethodText: {
    fontSize: 15,
    fontWeight: '600',
    color: WHITE,
  },
  paymentMethodTextActive: {
    color: GREEN,
  },
  paymentBalance: {
    fontSize: 12,
    color: GRAY_LIGHT,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: GRAY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: GREEN,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: GREEN,
  },
  // Total
  totalCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: GREEN,
  },
  // Primary Button
  primaryButton: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: GRAY_DARK,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  primaryButtonTextDisabled: {
    color: GRAY,
  },
  // Complete
  completeContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  completeIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  completeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: WHITE,
    marginBottom: 24,
  },
  completeCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 32,
  },
  completeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  completeLabel: {
    fontSize: 14,
    color: GRAY_LIGHT,
  },
  completeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: WHITE,
    maxWidth: '60%',
    textAlign: 'right',
  },
  completeDivider: {
    height: 1,
    backgroundColor: GRAY_DARK,
    marginVertical: 4,
  },
});

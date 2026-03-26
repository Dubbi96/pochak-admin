import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const BG = '#1A1A1A';
const SURFACE = '#262626';
const GREEN = '#00CC33';
const WHITE = '#FFFFFF';
const GRAY = '#A6A6A6';
const GRAY_LIGHT = '#A6A6A6';

interface SNSTypeSelectScreenProps {
  snsType?: string;
}

const SNSTypeSelectScreen: React.FC<SNSTypeSelectScreenProps> = ({
  snsType = '카카오',
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={styles.container}>
        <View style={styles.topSection}>
          {/* Title with badge */}
          <View style={styles.titleRow}>
            <View style={styles.snsBadge}>
              <Text style={styles.snsBadgeText}>{snsType}</Text>
            </View>
            <Text style={styles.title}> 회원가입</Text>
          </View>

          {/* Age Cards */}
          <View style={styles.cardsContainer}>
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <Text style={styles.cardTitle}>만 14세 미만</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <Text style={styles.cardTitle}>만 14세 이상</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Foreigner Link */}
        <View style={styles.bottomSection}>
          <TouchableOpacity>
            <Text style={styles.foreignerLink}>
              해외에서 응원해요! Foreigner
            </Text>
          </TouchableOpacity>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  snsBadge: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  snsBadgeText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: WHITE,
    fontSize: 26,
    fontWeight: '800',
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4D4D4D',
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
  bottomSection: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  foreignerLink: {
    color: GRAY_LIGHT,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default SNSTypeSelectScreen;

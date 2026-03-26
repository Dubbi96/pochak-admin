import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../theme';
import {mockVenueDetail} from '../../services/cityApi';

export default function VenueDetailScreen() {
  const navigation = useNavigation();
  const venue = mockVenueDetail;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          시설 상세
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Venue Image */}
        <Image
          source={{uri: venue.imageUrl}}
          style={styles.venueImage}
          resizeMode="cover"
        />

        {/* Venue Info */}
        <View style={styles.infoSection}>
          <Text style={styles.venueName}>{venue.name}</Text>
          <View style={styles.sportBadge}>
            <Text style={styles.sportBadgeText}>{venue.sportType}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={16} color={colors.green} />
            <Text style={styles.infoText}>{venue.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={16} color={colors.green} />
            <Text style={styles.infoText}>{venue.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="access-time" size={16} color={colors.green} />
            <Text style={styles.infoText}>{venue.operatingHours}</Text>
          </View>

          <Text style={styles.description}>{venue.description}</Text>
        </View>

        {/* Cameras */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>연결된 카메라</Text>
          {venue.cameras.map(cam => (
            <View key={cam.id} style={styles.cameraRow}>
              <View style={styles.cameraInfo}>
                <MaterialIcons
                  name="videocam"
                  size={20}
                  color={cam.isLive ? colors.green : colors.gray}
                />
                <View style={styles.cameraTextWrap}>
                  <Text style={styles.cameraName}>{cam.name}</Text>
                  <Text style={styles.cameraLocation}>{cam.location}</Text>
                </View>
              </View>
              {cam.isLive && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveRedDot} />
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Related Matches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>관련 경기</Text>
          {venue.matches.map(match => (
            <TouchableOpacity
              key={match.id}
              style={styles.matchRow}
              activeOpacity={0.7}>
              <View style={styles.matchInfo}>
                <Text style={styles.matchTitle}>{match.title}</Text>
                <Text style={styles.matchDate}>{match.date}</Text>
              </View>
              <View
                style={[
                  styles.matchStatus,
                  {
                    backgroundColor:
                      match.status === '접수중' ? colors.green : '#2196F3',
                  },
                ]}>
                <Text style={styles.matchStatusText}>{match.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.reserveButton} activeOpacity={0.8} onPress={() => Alert.alert('시설 예약', '시설 예약 기능은 준비 중입니다.')}>
          <Text style={styles.reserveButtonText}>예약하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  headerRight: {
    width: 32,
  },

  // Venue Image
  venueImage: {
    width: '100%',
    height: 200,
  },

  // Info
  infoSection: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  venueName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 8,
  },
  sportBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.green,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 14,
  },
  sportBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.grayLight,
    marginLeft: 8,
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: colors.gray,
    lineHeight: 20,
    marginTop: 12,
  },

  // Section
  section: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 14,
  },

  // Camera
  cameraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  cameraInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cameraTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  cameraName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  cameraLocation: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.15)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveRedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF0000',
    marginRight: 4,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF0000',
  },

  // Match
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  matchInfo: {
    flex: 1,
    marginRight: 12,
  },
  matchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 3,
  },
  matchDate: {
    fontSize: 12,
    color: colors.grayLight,
  },
  matchStatus: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },

  // Bottom
  bottomSpacer: {
    height: 80,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.bg,
    borderTopWidth: 0.5,
    borderTopColor: colors.grayDark,
  },
  reserveButton: {
    backgroundColor: colors.green,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reserveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});

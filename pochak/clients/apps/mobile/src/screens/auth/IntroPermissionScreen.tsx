import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import GreenButton from '../../components/common/GreenButton';

const BG = '#1A1A1A';
const GREEN = '#00CC33';
const WHITE = '#FFFFFF';
const GRAY_LIGHT = '#A6A6A6';

interface PermissionItemData {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  descLine1: string;
  descLine2: string;
}

const permissions: PermissionItemData[] = [
  {
    iconName: 'camera-outline',
    title: '카메라',
    descLine1: '촬영예약 시 QR 촬영을',
    descLine2: '위한 권한',
  },
  {
    iconName: 'image-outline',
    title: '사진',
    descLine1: '미리보기(썸네일) 이미지',
    descLine2: '업로드를 위한 권한',
  },
  {
    iconName: 'location-outline',
    title: '위치',
    descLine1: '위치 기반 맞춤형 정보',
    descLine2: '제공을 위한 권한',
  },
  {
    iconName: 'people-outline',
    title: '주소록',
    descLine1: '친구 목록을',
    descLine2: '불러오기 위한 권한',
  },
];

const PermissionItem: React.FC<PermissionItemData> = ({
  iconName,
  title,
  descLine1,
  descLine2,
}) => (
  <View style={styles.permissionItem}>
    <Ionicons name={iconName} size={28} color={WHITE} />
    <Text style={styles.permissionTitle}>{title}</Text>
    <Text style={styles.permissionDesc}>{descLine1}</Text>
    <Text style={styles.permissionDesc}>{descLine2}</Text>
  </View>
);

const IntroPermissionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={styles.container}>
        <View style={styles.topSection}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={WHITE} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerRight}>
              <Text style={styles.langText}>한국어</Text>
              <MaterialIcons name="language" size={20} color={GRAY_LIGHT} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>
            {'원활한 이용을 위해\n접근 권한이 필요해요.'}
          </Text>

          <View style={styles.permissionList}>
            {permissions.map((perm, idx) => (
              <PermissionItem key={idx} {...perm} />
            ))}
          </View>
        </View>

        <View style={styles.bottomSection}>
          <GreenButton title="확인" onPress={() => navigation.navigate('IntroLocation')} />
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
  topSection: {
    paddingTop: 0,
  },
  title: {
    color: WHITE,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 36,
    marginTop: 32,
    marginBottom: 40,
  },
  permissionList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  permissionItem: {
    alignItems: 'center',
    flex: 1,
  },
  permissionTitle: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
  },
  permissionDesc: {
    color: GRAY_LIGHT,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomSection: {
    paddingBottom: 32,
  },
});

export default IntroPermissionScreen;

import {useCallback} from 'react';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuthStore} from '../stores/authStore';
import {commerceService} from '../api/commerceService';
import type {RootStackParamList} from '../navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/**
 * Entitlement gate hook — checks login + viewing permission before navigation.
 *
 * Per UX spec p.19:
 * - Not logged in: Alert "로그인 후 이용 가능합니다" with 로그인/취소
 * - No permission:  Alert "시청 권한이 없습니다" with 상품페이지/취소
 * - Has permission: navigate to Player/ClipPlayer
 *
 * Usage:
 *   const { checkAndNavigate } = useEntitlementGate();
 *   checkAndNavigate(contentId, 'vod');
 */
export function useEntitlementGate() {
  const navigation = useNavigation<Navigation>();
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  const checkAndNavigate = useCallback(
    async (contentId: string, contentType: 'live' | 'vod' | 'clip') => {
      // Step 1: Check login
      if (!isLoggedIn) {
        Alert.alert(
          '알림',
          '로그인 후 이용 가능합니다',
          [
            {text: '취소', style: 'cancel'},
            {
              text: '로그인',
              onPress: () => navigation.navigate('Auth', {screen: 'Login'}),
            },
          ],
        );
        return;
      }

      // Step 2: Check entitlement
      try {
        const entitlement = await commerceService.getEntitlement(contentId);

        if (!entitlement.hasAccess) {
          Alert.alert(
            '알림',
            '시청 권한이 없습니다',
            [
              {text: '취소', style: 'cancel'},
              {
                text: '상품페이지',
                onPress: () => navigation.navigate('ProductList'),
              },
            ],
          );
          return;
        }

        // Step 3: Navigate to appropriate player
        if (contentType === 'clip') {
          navigation.navigate('ClipPlayer', {contentId});
        } else {
          navigation.navigate('Player', {contentType, contentId});
        }
      } catch (error) {
        Alert.alert('오류', '시청 권한을 확인하는 중 오류가 발생했습니다.');
      }
    },
    [isLoggedIn, navigation],
  );

  return {checkAndNavigate};
}

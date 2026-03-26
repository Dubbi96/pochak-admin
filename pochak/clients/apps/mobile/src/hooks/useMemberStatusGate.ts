import { useEffect, useRef } from 'react';
import { Alert, ToastAndroid, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore, type MemberStatus } from '../stores/authStore';
import type { RootStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/**
 * Shows a cross-platform toast message.
 * On Android, uses ToastAndroid. On iOS, falls back to Alert.
 */
function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    // iOS has no native toast; use a brief alert instead
    Alert.alert('알림', message);
  }
}

/**
 * Member status gate hook.
 *
 * Call this once at the root navigator level (after login) to enforce
 * member state machine rules:
 *
 * - DORMANT: alert + navigate to reactivation
 * - BLOCKED: alert + show block info
 * - WITHDRAWN: force logout + navigate to login
 * - DORMANT_WARNING: toast with days-remaining warning
 *
 * Currently reads from authStore (mock). Future: API call on app launch.
 */
export function useMemberStatusGate(enabled = true) {
  const navigation = useNavigation<Navigation>();
  const memberStatus = useAuthStore(state => state.memberStatus);
  const logout = useAuthStore(state => state.logout);
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const hasChecked = useRef(false);

  useEffect(() => {
    // Don't run during splash/intro phase
    if (!enabled) return;

    // Only run the gate check when logged in and status is available
    if (!isLoggedIn || memberStatus === null) {
      hasChecked.current = false;
      return;
    }

    // Prevent duplicate checks within the same session
    if (hasChecked.current) {
      return;
    }
    hasChecked.current = true;

    handleMemberStatus(memberStatus);
  }, [isLoggedIn, memberStatus]);

  function handleMemberStatus(status: MemberStatus) {
    switch (status) {
      case 'DORMANT':
        Alert.alert(
          '휴면 계정',
          '휴면 계정입니다. 본인인증 후 이용 가능합니다.',
          [
            {
              text: '확인',
              onPress: () => {
                // Navigate to reactivation flow (reuses FindAccountFlow for now)
                // TODO: Create dedicated ReactivationScreen in Phase 5
                navigation.navigate('FindAccountFlow');
              },
            },
          ],
          { cancelable: false },
        );
        break;

      case 'BLOCKED':
        Alert.alert(
          '이용 제한',
          '이용이 제한된 계정입니다.',
          [
            {
              text: '확인',
              onPress: () => {
                // Navigate to support for block info
                // TODO: Create dedicated BlockInfoScreen in Phase 5
                navigation.navigate('Support');
              },
            },
          ],
          { cancelable: false },
        );
        break;

      case 'WITHDRAWN':
        // Silently clear auth and return to login
        logout();
        break;

      case 'DORMANT_WARNING':
        // Show a non-blocking toast warning
        // TODO: Fetch actual days-remaining from API
        showToast('휴면 예정 안내: 30일 후 휴면 전환됩니다');
        break;

      case 'ACTIVE':
      case 'GUEST':
      case 'UNVERIFIED':
        // No action needed for these statuses
        break;

      default: {
        // Exhaustive check
        const _exhaustive: never = status;
        console.warn('[MemberStatusGate] Unknown status:', _exhaustive);
      }
    }
  }
}

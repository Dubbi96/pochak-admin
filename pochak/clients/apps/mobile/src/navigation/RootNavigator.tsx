import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from './types';
import { useAuthStore } from '../stores/authStore';
import { useMemberStatusGate } from '../hooks/useMemberStatusGate';
import { authService } from '../api/authService';

import SplashScreen from '../screens/auth/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import ProfileEditScreen from '../screens/my/ProfileEditScreen';
import SettingsScreen from '../screens/my/SettingsScreen';
import PasswordChangeScreen from '../screens/my/PasswordChangeScreen';
import FindAccountScreen from '../screens/my/FindAccountScreen';
import ProductListScreen from '../screens/commerce/ProductListScreen';
import ProductDetailScreen from '../screens/commerce/ProductDetailScreen';
import PurchaseScreen from '../screens/commerce/PurchaseScreen';
import GiftScreen from '../screens/commerce/GiftScreen';
import CouponScreen from '../screens/commerce/CouponScreen';
import PersonalChannelScreen from '../screens/my/PersonalChannelScreen';
import NotificationScreen from '../screens/notification/NotificationScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
// Player
import PlayerScreen from '../screens/player/PlayerScreen';
import ClipPlayerScreen from '../screens/player/ClipPlayerScreen';
// List
import VideoListScreen from '../screens/main/VideoListScreen';
// Detail
import CompetitionDetailScreen from '../screens/detail/CompetitionDetailScreen';
import CompetitionInviteScreen from '../screens/detail/CompetitionInviteScreen';
import TeamDetailScreen from '../screens/detail/TeamDetailScreen';
import ClubDetailScreen from '../screens/club/ClubDetailScreen';
import VenueDetailScreen from '../screens/city/VenueDetailScreen';
// My sub-pages
import WatchHistoryScreen from '../screens/my/WatchHistoryScreen';
import MyClipsScreen from '../screens/my/MyClipsScreen';
import FavoritesScreen from '../screens/my/FavoritesScreen';
import WatchReservationScreen from '../screens/my/WatchReservationScreen';
import FamilyAccountScreen from '../screens/my/FamilyAccountScreen';
import MyMenuHubScreen from '../screens/my/MyMenuHubScreen';
// City / Club
import CityHomeScreen from '../screens/city/CityHomeScreen';
import ClubHomeScreen from '../screens/club/ClubHomeScreen';
import ClubSearchScreen from '../screens/club/ClubSearchScreen';
// Support
import NoticesScreen from '../screens/support/NoticesScreen';
import SupportScreen from '../screens/support/SupportScreen';
// Clip
import ClipEditScreen from '../screens/clip/ClipEditScreen';
// Search
import SearchScreen from '../screens/search/SearchScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const [introFinished, setIntroFinished] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const insets = useSafeAreaInsets();

  // DEV: Insets 디버깅 콘솔
  useEffect(() => {
    if (__DEV__) {
      console.log('[SafeArea Insets]', JSON.stringify(insets));
    }
  }, [insets]);

  // Check member status ONLY after intro is finished (avoid calling in Splash-only navigator)
  // useMemberStatusGate must be called unconditionally (React hooks rule) but it guards internally
  useMemberStatusGate(introFinished);

  const onIntroComplete = useCallback(() => {
    setIntroFinished(true);
  }, []);

  // Cold start token validation — runs ONCE after intro finishes
  const coldStartChecked = useRef(false);
  useEffect(() => {
    if (!introFinished) return;
    if (coldStartChecked.current) {
      // Already checked on this app session — just mark ready
      setTokenChecked(true);
      return;
    }
    coldStartChecked.current = true;

    if (!isLoggedIn) {
      setTokenChecked(true);
      return;
    }

    // If user chose not to keep logged in, clear tokens on cold start
    AsyncStorage.getItem('pochak_session_only').then(sessionOnly => {
      if (sessionOnly === 'true') {
        useAuthStore.getState().logout();
        AsyncStorage.removeItem('pochak_session_only');
        setTokenChecked(true);
        return;
      }

      // Token is valid (mock always succeeds), proceed
      setTokenChecked(true);
    });
  }, [introFinished, isLoggedIn]);

  // Silently refresh token when app returns from background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isLoggedIn) {
        const storedRefreshToken = useAuthStore.getState().refreshToken;
        if (storedRefreshToken) {
          authService.refreshToken(storedRefreshToken).then(res => {
            useAuthStore.getState().setTokens(res.accessToken, res.refreshToken);
          }).catch(() => {
            useAuthStore.getState().logout();
          });
        }
      }
    });
    return () => sub.remove();
  }, [isLoggedIn]);

  // 콜드 스타트: 항상 런치 인트로부터 시작
  if (!introFinished || !tokenChecked) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#00C700', paddingTop: 0 } }}>
        <Stack.Screen name="Splash">
          {() => <SplashScreen onComplete={onIntroComplete} />}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  // 인트로 끝난 후: 로그인 상태에 따라 분기
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#1A1A1A', paddingTop: insets.top }, animation: 'slide_from_right' }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="MainTab" component={MainTabNavigator} />
          <Stack.Screen
            name="ProfileEdit"
            component={ProfileEditScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="PasswordChange"
            component={PasswordChangeScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="FindAccountFlow"
            component={FindAccountScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ProductList"
            component={ProductListScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Purchase"
            component={PurchaseScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Gift"
            component={GiftScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Coupons"
            component={CouponScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="PersonalChannel"
            component={PersonalChannelScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Community"
            component={CommunityScreen}
            options={{ animation: 'slide_from_right' }}
          />
          {/* Player */}
          <Stack.Screen
            name="Player"
            component={PlayerScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ClipPlayer"
            component={ClipPlayerScreen}
            options={{ animation: 'slide_from_right' }}
          />
          {/* Clip Edit */}
          <Stack.Screen
            name="ClipEdit"
            component={ClipEditScreen}
            options={{ animation: 'slide_from_right' }}
          />
          {/* List */}
          <Stack.Screen
            name="VideoList"
            component={VideoListScreen}
            options={{ animation: 'slide_from_right' }}
          />
          {/* Search */}
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{ animation: 'slide_from_right' }}
          />
          {/* Detail */}
          <Stack.Screen
            name="CompetitionDetail"
            component={CompetitionDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="CompetitionInvite"
            component={CompetitionInviteScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen
            name="TeamDetail"
            component={TeamDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ClubDetail"
            component={ClubDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="VenueDetail"
            component={VenueDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
          {/* My sub-pages */}
          <Stack.Screen
            name="WatchHistory"
            component={WatchHistoryScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="MyClips"
            component={MyClipsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="WatchReservation"
            component={WatchReservationScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="FamilyAccount"
            component={FamilyAccountScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="MyMenuHub"
            component={MyMenuHubScreen}
            options={{ animation: 'slide_from_right' }}
          />
          {/* City / Club */}
          <Stack.Screen
            name="CityHome"
            component={CityHomeScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ClubHome"
            component={ClubHomeScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ClubSearch"
            component={ClubSearchScreen}
            options={{ animation: 'slide_from_right' }}
          />
          {/* Support */}
          <Stack.Screen
            name="Notices"
            component={NoticesScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Support"
            component={SupportScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

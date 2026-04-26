import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {colors} from '../../theme';
import type {RootStackParamList} from '../../navigation/types';
import apiClient from '../../api/client';

type InviteRouteProp = RouteProp<RootStackParamList, 'CompetitionInvite'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

async function validateInviteCode(
  code: string,
): Promise<{valid: boolean; competitionId?: string}> {
  const res = await apiClient.post('/competitions/access', null, {
    params: {inviteCode: code},
  });
  const data = res.data.data ?? res.data;
  if (data && (data.id || data.competitionId)) {
    return {valid: true, competitionId: String(data.id ?? data.competitionId)};
  }
  return {valid: false};
}

export default function CompetitionInviteScreen() {
  const route = useRoute<InviteRouteProp>();
  const navigation = useNavigation<NavProp>();
  const {inviteCode} = route.params;
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    validateInviteCode(inviteCode).then(result => {
      if (cancelled) return;
      if (result.valid && result.competitionId) {
        // Replace this screen with the competition detail
        navigation.replace('CompetitionDetail', {
          competitionId: result.competitionId,
          inviteCode,
        });
      } else {
        setStatus('error');
        Alert.alert(
          '유효하지 않은 초대 코드',
          '초대 코드가 올바르지 않거나 만료되었습니다.',
          [
            {
              text: '확인',
              onPress: () => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              },
            },
          ],
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [inviteCode, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <View style={styles.container}>
        {status === 'loading' ? (
          <>
            <ActivityIndicator size="large" color={colors.green} />
            <Text style={styles.loadingText}>초대 코드 확인 중...</Text>
          </>
        ) : (
          <Text style={styles.errorText}>
            초대 코드가 유효하지 않습니다.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.grayLight,
    marginTop: 16,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray,
    textAlign: 'center',
  },
});

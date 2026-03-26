import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { RootStackParamList } from './types';

const prefix = Linking.createURL('/');

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [prefix, 'pochak://', 'https://pochak.co.kr'],
  config: {
    screens: {
      MainTab: {
        screens: {
          Home: 'home',
          Schedule: 'schedule',
          Clip: 'clip',
          My: 'my',
        },
      },
      Player: 'content/:contentType/:contentId',
      ClipPlayer: 'clip/:contentId',
      Search: 'search',
      ProductList: 'store',
      Notifications: 'notifications',
      CompetitionDetail: 'competition/:competitionId',
      CompetitionInvite: {
        path: 'competition/invite/:inviteCode',
      },
      ClubDetail: 'club/:clubId',
      Auth: 'auth',
    },
  },
};

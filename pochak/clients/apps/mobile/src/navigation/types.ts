import type {NavigatorScreenParams} from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Splash: undefined;
  IntroPermission: undefined;
  IntroLocation: undefined;
  Intro: undefined;
  Login: undefined;
  SignUp: NavigatorScreenParams<SignUpStackParamList>;
  FindAccount: undefined;
};

// SignUp Stack
export type SignUpStackParamList = {
  SignUpMain: {
    initialRoute?: 'DOMESTIC_ADULT' | 'DOMESTIC_MINOR' | 'SNS' | 'FOREIGN';
  } | undefined;
};

// Main Tab
export type MainTabParamList = {
  Home: undefined;
  Schedule: undefined;
  Filming: undefined;
  Clip: undefined;
  My: undefined;
};

// My Stack (screens accessible from My tab)
export type MyStackParamList = {
  MyMain: undefined;
  ProfileEdit: undefined;
  Settings: undefined;
  PasswordChange: undefined;
  FindAccountFlow: undefined;
  FindAccountResult: {accounts: Array<{id: string; email: string}>};
  PasswordReset: undefined;
};

// Root Stack
export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  MainTab: NavigatorScreenParams<MainTabParamList>;
  ProfileEdit: undefined;
  Settings: undefined;
  PasswordChange: undefined;
  FindAccountFlow: undefined;
  FindAccountResult: {accounts: Array<{id: string; email: string}>};
  PasswordReset: undefined;
  Search: undefined;
  ClipEdit: {
    startTime: number;
    endTime: number;
    sourceContentType: 'live' | 'vod';
    sourceContentId: string;
  };
  // Player routes
  Player: {contentType: 'live' | 'vod'; contentId: string};
  ClipPlayer: {contentId: string};
  // List routes
  VideoList: {sectionType: string; title: string; sportFilter?: string};
  // Detail routes
  CompetitionDetail: {competitionId: string; inviteCode?: string};
  CompetitionInvite: {inviteCode: string};
  TeamDetail: {teamId: string};
  ClubDetail: {clubId: string};
  VenueDetail: {venueId: string};
  // Commerce
  ProductList: undefined;
  ProductDetail: undefined;
  Purchase: undefined;
  Gift: undefined;
  Coupons: undefined;
  // Personal Channel
  PersonalChannel: undefined;
  // Notifications
  Notifications: undefined;
  // Community
  Community: undefined;
  // My sub-pages
  WatchHistory: undefined;
  MyClips: undefined;
  Favorites: undefined;
  WatchReservation: undefined;
  // City / Club
  CityHome: undefined;
  ClubHome: undefined;
  ClubSearch: undefined;
  // Support
  Notices: undefined;
  Support: undefined;
  FamilyAccount: undefined;
  // My Menu Hub (p28)
  MyMenuHub: undefined;
};

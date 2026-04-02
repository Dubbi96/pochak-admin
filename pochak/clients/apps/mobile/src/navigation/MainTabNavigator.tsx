import React from 'react';
import {StyleSheet, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import {useTranslation} from 'react-i18next';
import type {MainTabParamList} from './types';
import {colors} from '../theme';

import HomeScreen from '../screens/main/HomeScreen';
import ScheduleScreen from '../screens/main/ScheduleScreen';
import FilmingScreen from '../screens/main/FilmingScreen';
import ClipScreen from '../screens/main/ClipScreen';
import MyScreen from '../screens/main/MyScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

function renderTabIcon(
  route: {name: keyof MainTabParamList},
  focused: boolean,
  color: string,
  size: number,
) {
  switch (route.name) {
    case 'Home':
      return (
        <Ionicons
          name={focused ? 'home' : 'home-outline'}
          size={size}
          color={color}
        />
      );
    case 'Schedule':
      return (
        <Ionicons
          name={focused ? 'calendar' : 'calendar-outline'}
          size={size}
          color={color}
        />
      );
    case 'Filming':
      return (
        <MaterialCommunityIcons
          name="video-box"
          size={size}
          color={color}
        />
      );
    case 'Clip':
      return (
        <MaterialCommunityIcons
          name={focused ? 'camera-iris' : 'camera-iris'}
          size={size}
          color={color}
        />
      );
    case 'My':
      return (
        <View>
          <Ionicons
            name={focused ? 'person' : 'person-outline'}
            size={size}
            color={color}
          />
          {focused && <View style={styles.greenDot} />}
        </View>
      );
    default:
      return null;
  }
}

export default function MainTabNavigator() {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + 4,
        },
        tabBarActiveTintColor: '#00CC33',
        tabBarInactiveTintColor: '#A6A6A6',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: {marginTop: 2},
        tabBarIcon: ({focused, color, size}) =>
          renderTabIcon(
            route as {name: keyof MainTabParamList},
            focused,
            color,
            24,
          ),
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{tabBarLabel: t('tabs.home')}}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{tabBarLabel: t('tabs.schedule')}}
      />
      <Tab.Screen
        name="Filming"
        component={FilmingScreen}
        options={{tabBarLabel: t('tabs.filming')}}
      />
      <Tab.Screen
        name="Clip"
        component={ClipScreen}
        options={{tabBarLabel: t('tabs.clip')}}
      />
      <Tab.Screen
        name="My"
        component={MyScreen}
        options={{tabBarLabel: t('tabs.my')}}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1A1A1A',
    borderTopColor: colors.grayDark,
    borderTopWidth: 0.5,
    height: 56,
    paddingBottom: 4,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  greenDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00CC33',
  },
});

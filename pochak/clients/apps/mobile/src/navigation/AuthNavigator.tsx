import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {AuthStackParamList} from './types';

import IntroPermissionScreen from '../screens/auth/IntroPermissionScreen';
import IntroLocationScreen from '../screens/auth/IntroLocationScreen';
import IntroScreen from '../screens/auth/IntroScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import FindAccountScreen from '../screens/auth/FindAccountScreen';
import SignUpNavigator from './SignUpNavigator';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {backgroundColor: '#1A1A1A'},
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="IntroPermission"
        component={IntroPermissionScreen}
      />
      <Stack.Screen name="IntroLocation" component={IntroLocationScreen} />
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="SignUp" component={SignUpNavigator} />
      <Stack.Screen name="FindAccount" component={FindAccountScreen} />
    </Stack.Navigator>
  );
}

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {SignUpStackParamList} from './types';

import SignUpScreen from '../screens/auth/signup/SignUpScreen';

const Stack = createNativeStackNavigator<SignUpStackParamList>();

export default function SignUpNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {backgroundColor: '#1A1A1A'},
      }}>
      <Stack.Screen name="SignUpMain" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

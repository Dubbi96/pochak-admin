import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import RootNavigator from './src/navigation/RootNavigator';
import { linking } from './src/navigation/linking';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import './src/i18n/i18n'; // Initialize i18n

const queryClient = new QueryClient();

export default function App() {
  // Lock to portrait by default; player screens unlock when mounted
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
  }, []);
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer linking={linking} theme={{
              dark: true,
              colors: {
                primary: '#00C853',
                background: '#121212',
                card: '#121212',
                text: '#FFFFFF',
                border: '#333333',
                notification: '#FF0000',
              },
              fonts: {
                regular: { fontFamily: 'System', fontWeight: '400' },
                medium: { fontFamily: 'System', fontWeight: '500' },
                bold: { fontFamily: 'System', fontWeight: '700' },
                heavy: { fontFamily: 'System', fontWeight: '900' },
              },
            }}>
              <StatusBar style="light" />
              <RootNavigator />
            </NavigationContainer>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});

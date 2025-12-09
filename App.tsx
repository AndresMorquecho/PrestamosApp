// ============================================
// APP PRINCIPAL - PRÉSTAMOS APP
// ============================================

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { RootNavigator } from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <RootNavigator />
          <StatusBar style="light" />
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

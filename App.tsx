import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { AuthEventHandler } from './src/components/auth/AuthEventHandler';
import { pushNotificationService } from './src/services/pushNotificationService';
import { navigationRef } from './src/navigation/RootNavigation';

const App = () => {
  useEffect(() => {
    pushNotificationService.initialize();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <AuthProvider>
        <AuthEventHandler />
        <RootNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
};

export default App;

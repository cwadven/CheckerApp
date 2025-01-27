import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { AuthEventHandler } from './src/components/auth/AuthEventHandler';

const App = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AuthEventHandler />
        <RootNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
};

export default App;

import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { apiClient } from '../api/client';
import Constants from 'expo-constants';

class PushNotificationService {
  private isInitialized = false;

  private showDebugAlert(title: string, message: string) {
    setTimeout(() => {
      Alert.alert(
        title,
        message,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    }, 100);  // 약간의 지연을 주어 Alert가 겹치지 않도록 함
  }

  async initialize() {
    if (this.isInitialized) return;

    this.showDebugAlert('Push Init', `Platform: ${Platform.OS}`);

    if (Platform.OS === 'web') {
      this.isInitialized = true;
      return;
    }

    // 알림 핸들러 설정
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    try {
      const token = await this.getDeviceToken();
      this.showDebugAlert('FCM Token', token || 'No token received');
      
      if (token) {
        await this.registerDeviceToken(token);
        this.showDebugAlert('Token Registration', 'Success');
      }
    } catch (error) {
      this.showDebugAlert('Push Error', error instanceof Error ? error.message : 'Unknown error');
    }

    // 토큰 갱신 리스너 설정
    Notifications.addPushTokenListener(async (token) => {
      console.log('Token refreshed:', token);
      if (token.data) {
        await this.registerDeviceToken(token.data);
      }
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'General Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    this.isInitialized = true;
    console.log('PushNotificationService: Initialization completed');
  }

  private async getDeviceToken() {
    if (Platform.OS === 'web') return null;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      this.showDebugAlert('Permission Status', existingStatus);
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        this.showDebugAlert('New Permission Status', status);
      }
      
      if (finalStatus !== 'granted') {
        this.showDebugAlert('Permission Denied', 'Notification permission not granted');
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        throw new Error('Project ID not configured');
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId
      });
      this.showDebugAlert('Token Received', token.data);
      return token.data;
    } catch (error) {
      this.showDebugAlert('Token Error', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  private async registerDeviceToken(token: string) {
    try {
      this.showDebugAlert('Registration Start', `Token: ${token}`);
      await apiClient.post('/v1/push/device-token', {
        token,
        device_type: Platform.OS === 'ios' ? 'ios' : 'android'
      });
      this.showDebugAlert('Registration Success', 'Token registered with server');
    } catch (error) {
      this.showDebugAlert('Registration Error', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

export const pushNotificationService = new PushNotificationService(); 
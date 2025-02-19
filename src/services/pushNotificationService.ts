import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { apiClient } from '../api/client';
import Constants from 'expo-constants';

class PushNotificationService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    // 웹 플랫폼이면 초기화 중단
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
      console.log('FCM Token:', token);  // 토큰 확인용
      
      if (token) {
        await this.registerDeviceToken(token);
      }
    } catch (error) {
      console.error('Failed to initialize push notification:', error);
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
  }

  private async getDeviceToken() {
    // 웹이나 시뮬레이터면 중단
    if (Platform.OS === 'web') return null;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  private async registerDeviceToken(token: string) {
    try {
      await apiClient.post('/v1/push/device-token', {
        token,
        device_type: Platform.OS === 'ios' ? 'ios' : 'android'
      });
    } catch (error) {
      console.error('Failed to register device token:', error);
    }
  }
}

export const pushNotificationService = new PushNotificationService(); 
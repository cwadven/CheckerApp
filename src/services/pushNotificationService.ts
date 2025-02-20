import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { apiClient } from '../api/client';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

class PushNotificationService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    if (Platform.OS === 'web' || !Device.isDevice) {
      this.isInitialized = true;
      return;
    }

    // 알림 핸들러를 먼저 설정
    Notifications.setNotificationHandler({
      handleNotification: async () => {
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          priority: Notifications.AndroidNotificationPriority.HIGH
        };
      }
    });

    // 알림 수신 리스너 추가
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // 알림 응답 리스너 추가
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
    });

    try {
      const token = await this.getDeviceToken();
      if (token) {
        await this.registerDeviceToken(token);
      }
    } catch (error) {
      console.error('Push Error:', error);
    }

    // Android 채널 설정
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        enableVibrate: true,
        enableLights: true,
        showBadge: true
      });
    }

    this.isInitialized = true;
  }

  private async getDeviceToken() {
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

      const token = await Notifications.getDevicePushTokenAsync();
      return token.data;
    } catch (error) {
      console.error('Token Error:', error);
      return null;
    }
  }

  private async registerDeviceToken(token: string) {
    try {
      await apiClient.post('/v1/push/device-token', {
        token,
        device_type: Platform.OS
      });
    } catch (error) {
      console.error('Registration Error:', error);
    }
  }

  async testPushNotification() {
    try {
      const token = await this.getDeviceToken();
      if (!token) return;

      await apiClient.post('/v1/push/test', { token });
    } catch (error) {
      console.error('Test Error:', error);
    }
  }

  async registerDeviceTokenAfterLogin() {
    try {
      const token = await this.getDeviceToken();
      if (!token) return;

      await apiClient.post('/v1/push/device-token', {
        token,
        device_type: Platform.OS
      });
    } catch (error) {
      console.error('Registration Error:', error);
    }
  }
}

export const pushNotificationService = new PushNotificationService(); 
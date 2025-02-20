import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { apiClient } from '../api/client';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

class PushNotificationService {
  private isInitialized = false;

  private showDebugAlert(title: string, message: string) {
    setTimeout(() => {
      Alert.alert(title, message, [{ text: 'OK' }], { cancelable: true });
    }, 100);
  }

  async initialize() {
    if (this.isInitialized) return;

    if (Platform.OS === 'web' || !Device.isDevice) {
      this.isInitialized = true;
      return;
    }

    try {
      const token = await this.getDeviceToken();
      this.showDebugAlert('FCM Token', token || 'No token received');
      
      if (token) {
        await this.registerDeviceToken(token);
      }
    } catch (error) {
      this.showDebugAlert('Push Error', error instanceof Error ? error.message : 'Unknown error');
    }

    // FCM 채널 설정 (Android)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // 알림 핸들러
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

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
        this.showDebugAlert('Permission Error', 'Failed to get push token permissions');
        return null;
      }

      // FCM 토큰 가져오기
      const token = await Notifications.getDevicePushTokenAsync();
      this.showDebugAlert('Token Details', JSON.stringify({
        token: token.data,
        type: token.type,
        platform: Platform.OS
      }, null, 2));

      return token.data;
    } catch (error) {
      this.showDebugAlert('Token Error', `Error: ${error instanceof Error ? error.message : 'Unknown'}`);
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
      this.showDebugAlert('Registration Error', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async testPushNotification() {
    try {
      const token = await this.getDeviceToken();
      if (!token) {
        this.showDebugAlert('Test Failed', 'No token available');
        return;
      }

      const response = await apiClient.post('/v1/push/test', { token });
      this.showDebugAlert('Test Result', JSON.stringify(response.data, null, 2));
    } catch (error) {
      this.showDebugAlert('Test Error', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

export const pushNotificationService = new PushNotificationService(); 
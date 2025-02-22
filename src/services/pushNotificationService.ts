import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { apiClient } from '../api/client';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { navigationRef } from '../navigation/RootNavigation';

// 알림 타입 정의
type NotificationType = 'question_feedback';

interface PushData {
  type: NotificationType;
  id?: string;
  screen?: string;
  params?: Record<string, any>;
}

interface QuestionFeedbackData {
  type: 'question_feedback';
  question_id: string;
  map_id: string;
  map_play_member_id: string;
  is_correct: string;
}

class PushNotificationService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    Alert.alert('Push Init', 'Initializing push notifications...');

    if (Platform.OS === 'web' || !Device.isDevice) {
      this.isInitialized = true;
      return;
    }

    // 알림 핸들러 설정
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        // 알림 데이터 로깅
        console.log('Handling notification:', notification);
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          priority: Notifications.AndroidNotificationPriority.HIGH
        };
      }
    });

    // 알림 수신 리스너
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Received notification:', notification);
      Alert.alert('Notification Data (Received)', 
        JSON.stringify({
          data: notification.request.content.data,
          remote: notification.request.trigger.remote,
          payload: (notification.request.trigger as any)?.payload
        }, null, 2)
      );
    });

    // 알림 응답 리스너 (알림 클릭 시)
    Notifications.addNotificationResponseReceivedListener((response) => {
      // 전체 response 구조 보기
      Alert.alert(
        'Full Response Structure',
        JSON.stringify(response, null, 2)
      );

      // FCM 데이터 접근
      const data = response.notification.request.content.data;
      
      if (data?.type === 'question_feedback') {
        navigationRef.navigate('MapGraphLoading', { 
          mapId: parseInt(data.map_id),
          mapPlayMemberId: parseInt(data.map_play_member_id),
          mode: 'play'
        });
      }
    });

    try {
      const token = await this.getDeviceToken();
      if (token) {
        await this.registerDeviceToken(token);
        Alert.alert('Token', `Device token: ${token}`);
      }
    } catch (error) {
      console.error('Push setup error:', error);
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
    Alert.alert('Init Complete', 'Push notification setup completed');
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
import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Pressable, 
  Text, 
  ActivityIndicator,
  Modal 
} from 'react-native';
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RootStackScreenProps, MainTabParamList } from "../../types/navigation";
import { apiClient, ApiError } from "../../api/client";
import { eventEmitter, MAP_EVENTS } from "../../utils/eventEmitter";

type RouteProps = RootStackScreenProps<"MapSettings">;

export const MapSettingsScreen = () => {
  const route = useRoute<RouteProps["route"]>();
  const navigation = useNavigation<RouteProps["navigation"]>();
  const { mapId } = route.params;
  const [alertVisible, setAlertVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUnsubscribe = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.delete(`/v1/subscription/map/${mapId}`);

      if (response.status_code === 'success') {
        eventEmitter.emit(MAP_EVENTS.SUBSCRIPTION_UPDATED, {
          mapId,
          isSubscribed: false,
          subscriberCount: 0
        });
        navigation.goBack();
        navigation.goBack();
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      if (error instanceof ApiError) {
        // 에러 처리 로직 추가 가능
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable 
        style={[styles.unsubscribeButton, isLoading && styles.disabledButton]}
        onPress={() => setAlertVisible(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.unsubscribeText}>구독 취소</Text>
        )}
      </Pressable>

      <Modal
        visible={alertVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>구독 취소</Text>
            <Text style={styles.modalMessage}>
              정말로 구독을 취소하시겠습니까?{'\n'}
              기존 모든 기록이 제거됩니다.
            </Text>
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAlertVisible(false)}
              >
                <Text style={styles.cancelButtonText}>돌아가기</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  handleUnsubscribe();
                  setAlertVisible(false);
                }}
              >
                <Text style={styles.confirmButtonText}>취소하기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  unsubscribeButton: {
    backgroundColor: '#ff4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  unsubscribeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 340,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#ff4444',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 
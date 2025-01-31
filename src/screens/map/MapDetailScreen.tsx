import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  Modal,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackScreenProps } from "../../types/navigation";
import { mapService } from "../../api/services/mapService";
import type { Map } from "../../types/map";
import { apiClient } from "../../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AlertModal } from "../../components/common/AlertModal";
import { eventEmitter, MAP_EVENTS } from "../../utils/eventEmitter";
import { AUTH_EVENTS } from "../../utils/eventEmitter";
import { ApiError } from "../../api/client";

type RouteProps = RootStackScreenProps<"MapDetail">;

export const MapDetailScreen = () => {
  const route = useRoute<RouteProps["route"]>();
  const navigation = useNavigation();
  const { mapId } = route.params;

  const [map, setMap] = useState<Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const loadMapDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await mapService.getMapDetail(mapId);
      setMap(response.data);
    } catch (err) {
      console.error("❌ Failed to load map detail:", err);
      setError(
        err instanceof Error
          ? err.message
          : "맵 상세 정보를 불러오는데 실패했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setIsSubscribing(true);
      const response = await apiClient.post<{ status_code: string }>(
        `/v1/subscription/map/${mapId}`
      );

      if (response.status_code === 'success') {
        setMap(prev => prev ? {
          ...prev,
          is_subscribed: true,
          subscriber_count: prev.subscriber_count + 1
        } : null);
        
        // 다른 화면에 구독 상태 변경 알림
        eventEmitter.emit(MAP_EVENTS.SUBSCRIPTION_UPDATED, {
          mapId,
          isSubscribed: true,
          subscriberCount: map?.subscriber_count ? map.subscriber_count + 1 : 1
        });
        
        setAlertConfig({
          visible: true,
          title: "구독 완료",
          message: "구독이 완료되었습니다. 지금 바로 시작해보세요!",
          confirmText: "시작하기",
          cancelText: "나중에",
          showCancel: true,
          onConfirm: () => {
            setAlertConfig(prev => ({ ...prev, visible: false }));
            handleStartMap();
          },
          onCancel: () => setAlertConfig(prev => ({ ...prev, visible: false }))
        });
      } else if (response.status_code === 'login-required') {
        setAlertConfig({
          visible: true,
          title: "로그인 필요",
          message: response.message || "로그인이 필요합니다",
          confirmText: "로그인",
          onConfirm: () => {
            eventEmitter.emit(AUTH_EVENTS.REQUIRE_LOGIN, response.message);
            setAlertConfig(prev => ({ ...prev, visible: false }));
          }
        });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const apiError = error as ApiError;
        setAlertConfig({
          visible: true,
          title: "구독 실패",
          message: apiError.message || "구독 처리 중 오류가 발생했습니다",
          confirmText: "확인",
          onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false }))
        });
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setIsSubscribing(true);
      const response = await apiClient.delete(`/v1/subscription/map/${mapId}`);

      if (response.status_code === 'success') {
        setMap(prev => prev ? {
          ...prev,
          is_subscribed: false,
          subscriber_count: prev.subscriber_count - 1
        } : null);
        
        eventEmitter.emit(MAP_EVENTS.SUBSCRIPTION_UPDATED, {
          mapId,
          isSubscribed: false,
          subscriberCount: map?.subscriber_count ? map.subscriber_count - 1 : 0
        });
      }
    } catch (error) {
      // ... 에러 처리 ...
    } finally {
      setIsSubscribing(false);
    }
  };

  useEffect(() => {
    loadMapDetail();
  }, [mapId]);

  const handleStartMap = () => {
    if (!map) return;
    navigation.navigate("MapGraphLoading", { mapId: map.id });
  };

  const handlePreviewMap = () => {
    if (!map) return;
    navigation.navigate("MapGraphLoading", { mapId: map.id });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error || !map) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {error || "맵 정보를 찾을 수 없습니다"}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </Pressable>
            {map?.is_subscribed && (
              <Pressable
                style={styles.settingsButton}
                onPress={() => navigation.navigate("MapSettings", { mapId: map.id })}
              >
                <Ionicons name="settings-outline" size={24} color="#000" />
              </Pressable>
            )}
          </View>

          <Image
            source={{ uri: map.background_image }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />

          <View style={styles.content}>
            <View style={styles.mapInfo}>
              <Image
                source={{ uri: map.icon_image }}
                style={styles.icon}
                resizeMode="cover"
              />
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{map.name}</Text>
                <Text style={styles.author}>
                  작성자: {map.created_by.nickname}
                </Text>
              </View>
            </View>

            <Text style={styles.description}>{map.description}</Text>

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Ionicons name="people-outline" size={16} color="#666" />
                <Text style={styles.statText}>
                  구독자 {map.subscriber_count.toLocaleString()}명
                </Text>
              </View>
              <Text style={styles.dot}>•</Text>
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={16} color="#666" />
                <Text style={styles.statText}>
                  조회수 {map.view_count.toLocaleString()}회
                </Text>
              </View>
            </View>

            {map.is_subscribed && map.progress && (
              <View style={styles.progressSection}>
                <Text style={styles.sectionTitle}>학습 진행도</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${map.progress.percentage}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {map.progress.completed_node_count} / {map.progress.total_node_count} 완료
                </Text>

                {map.progress.recent_activated_nodes?.length > 0 && (
                  <>
                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>최근 해결한 문제</Text>
                    <View style={styles.recentNodesList}>
                      {map.progress.recent_activated_nodes.slice(0, 3).map((node) => (
                        <View key={node.id} style={styles.recentNode}>
                          <Text style={styles.recentNodeTitle} numberOfLines={1}>
                            {node.name}
                          </Text>
                          <Text style={styles.recentNodeDate}>
                            {new Date(node.activated_at).toLocaleString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric',
                              hour12: true
                            })}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          {map.is_subscribed ? (
            <Pressable style={styles.startButton} onPress={handleStartMap}>
              <Text style={styles.startButtonText}>시작하기</Text>
            </Pressable>
          ) : (
            <View style={styles.buttonRow}>
              <Pressable
                style={[
                  styles.button, 
                  styles.subscribeButton,
                  isSubscribing && styles.subscribingButton
                ]}
                onPress={handleSubscribe}
                disabled={map?.is_subscribed || isSubscribing}
              >
                {isSubscribing ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.subscribeButtonText}>
                    {map?.is_subscribed ? '구독중' : '구독하기'}
                  </Text>
                )}
              </Pressable>
              <Pressable
                style={[styles.button, styles.previewButton]}
                onPress={handlePreviewMap}
              >
                <Text style={styles.previewButtonText}>조회하기</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
      <Modal
        visible={alertConfig.visible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            <AlertModal
              visible={alertConfig.visible}
              title={alertConfig.title}
              message={alertConfig.message}
              onConfirm={alertConfig.onConfirm}
              onCancel={alertConfig.onCancel}
              confirmText={alertConfig.confirmText}
              cancelText={alertConfig.cancelText}
              showCancel={alertConfig.showCancel}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 56,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 16,
    padding: 8,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  mapInfo: {
    flexDirection: "row",
    marginBottom: 16,
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: "#666",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 16,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    marginHorizontal: 8,
    color: "#666",
  },
  statText: {
    fontSize: 14,
    color: "#666",
  },
  progressSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  subscribeButton: {
    backgroundColor: "#4CAF50",
  },
  previewButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  startButton: {
    height: 48,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  subscribeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  previewButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
  startButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  backgroundImage: {
    width: "100%",
    height: 200,
    marginBottom: 16,
  },
  subscribingButton: {
    opacity: 0.8,
  },
  alertOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'transparent',
  },
  recentNodesList: {
    marginTop: 8,
    gap: 12,
  },
  recentNode: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  recentNodeTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  recentNodeDate: {
    fontSize: 12,
    color: '#666',
  },
  settingsButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
});

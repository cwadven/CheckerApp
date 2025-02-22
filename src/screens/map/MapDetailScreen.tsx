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
  TextInput,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../types/navigation";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackScreenProps } from "../../types/navigation";
import { mapService } from "../../api/services/mapService";
import type { Map, MapPlayMember, MapPlayMembersResponse } from "../../types/map";
import { apiClient } from "../../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AlertModal } from "../../components/common/AlertModal";
import { eventEmitter, MAP_EVENTS } from "../../utils/eventEmitter";
import { AUTH_EVENTS } from "../../utils/eventEmitter";
import { ApiError } from "../../api/client";
import type { NodeCompletedEvent } from "../../utils/eventEmitter";
import { CreatePlayModal } from '../../components/play/CreatePlayModal';
import { PlayListItem } from '../../components/play/PlayListItem';

type NavigationProp = NativeStackScreenProps<RootStackParamList, 'MapDetail'>;

export const MapDetailScreen = () => {
  const route = useRoute<NavigationProp["route"]>();
  const navigation = useNavigation<NavigationProp["navigation"]>();
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
  const [mapPlayMembers, setMapPlayMembers] = useState<MapPlayMember[]>([]);
  const [isLoadingMapPlayMembers, setIsLoadingMapPlayMembers] = useState(false);
  const [isCreatePlayModalVisible, setCreatePlayModalVisible] = useState(false);
  const [isCreatingPlay, setIsCreatingPlay] = useState(false);

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
        
      } else if (response.status_code === 'login-required') {
        eventEmitter.emit(AUTH_EVENTS.REQUIRE_LOGIN, response.message);
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

  const loadMapPlayMembers = async () => {
    if (!map?.is_subscribed) return;
    
    try {
      setIsLoadingMapPlayMembers(true);
      const response = await apiClient.get<MapPlayMembersResponse>(`/v1/play/map/${mapId}`);
      setMapPlayMembers(response.data.plays);
    } catch (error) {
      console.error("Failed to load map play members:", error);
    } finally {
      setIsLoadingMapPlayMembers(false);
    }
  };

  useEffect(() => {
    loadMapDetail();
  }, [mapId]);

  useEffect(() => {
    const handleNodeCompleted = (event: NodeCompletedEvent) => {
      if (event.mapId === mapId) {
        // 해당 플레이의 최근 활성화 노드 정보 업데이트
        setMapPlayMembers(prevMembers => 
          prevMembers.map(play => {
            if (play.id === event.mapPlayMemberId) {
              return {
                ...play,
                recent_activated_nodes: [
                  {
                    node_id: event.nodeId,
                    node_name: event.name || '',
                    activated_at: event.completedAt
                  },
                  ...play.recent_activated_nodes.slice(0, 2)  // 최근 3개만 유지
                ],
                completed_node_count: play.completed_node_count + 1
              };
            }
            return play;
          })
        );
      }
    };

    eventEmitter.on(MAP_EVENTS.NODE_COMPLETED, handleNodeCompleted);
    
    return () => {
      eventEmitter.off(MAP_EVENTS.NODE_COMPLETED, handleNodeCompleted);
    };
  }, [mapId]);

  useEffect(() => {
    if (map?.is_subscribed) {
      loadMapPlayMembers();
    }
  }, [map?.is_subscribed]);

  useEffect(() => {
    if (route.params?.shouldRemovePlay) {
      setMapPlayMembers(prev => 
        prev.filter(play => play.id !== route.params?.removedPlayId)
      );
    }
  }, [route.params?.shouldRemovePlay]);

  const handlePreviewMap = () => {
    if (!map) return;
    navigation.navigate("MapGraphLoading", { mapId: map.id });
  };

  const handleCreatePlay = async (title: string) => {
    try {
      setIsCreatingPlay(true);
      await apiClient.post(`/v1/play/map/${mapId}`, { title });
      
      // 성공 시 플레이 목록 다시 로드
      await loadMapPlayMembers();
      setCreatePlayModalVisible(false);
    } catch (error) {
      console.error('Failed to create play:', error);
      if (error instanceof ApiError) {
        // API 에러 메시지를 그대로 전달
        throw new Error(error.message);
      }
      throw new Error('플레이 생성에 실패했습니다.');
    } finally {
      setIsCreatingPlay(false);
    }
  };

  const handleMorePress = (play: MapPlayMember) => {
    navigation.navigate('PlayManage', { 
      play: {
        ...play,
        map_id: mapId
      }
    });
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
              </View>
            )}

            {map.is_subscribed && (
              <View style={styles.playsSection}>
                <Text style={styles.sectionTitle}>참여 중인 플레이</Text>
                
                {isLoadingMapPlayMembers ? (
                  <ActivityIndicator size="small" color="#4CAF50" style={styles.playsLoader} />
                ) : mapPlayMembers.length > 0 ? (
                  <>
                    <View style={styles.playsList}>
                      {mapPlayMembers.map((play) => (
                        <PlayListItem 
                          key={play.id}
                          play={play}
                          totalNodeCount={map.total_node_count}
                          onPress={() => navigation.navigate("MapGraphLoading", { 
                            mapId: map.id,
                            mapPlayMemberId: play.id,
                            mapPlayMemberTitle: play.title,
                            mode: 'play'
                          })}
                          onMorePress={() => handleMorePress(play)}
                        />
                      ))}
                    </View>
                    {mapPlayMembers.length < 3 && (  // 3개 미만일 때만 버튼 표시
                      <Pressable
                        style={styles.newPlayButton}
                        onPress={() => setCreatePlayModalVisible(true)}
                      >
                        <Text style={styles.newPlayButtonText}>새로운 플레이 시작하기</Text>
                      </Pressable>
                    )}
                  </>
                ) : (
                  <View style={styles.emptyPlays}>
                    <Text style={styles.emptyPlaysText}>
                      아직 참여 중인 플레이가 없습니다.
                    </Text>
                    <Pressable
                      style={styles.newPlayButton}
                      onPress={() => setCreatePlayModalVisible(true)}
                    >
                      <Text style={styles.newPlayButtonText}>새로운 플레이 시작하기</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          {!map.is_subscribed && (
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
      <CreatePlayModal
        visible={isCreatePlayModalVisible}
        onClose={() => setCreatePlayModalVisible(false)}
        onSuccess={() => {
          loadMapPlayMembers();
          setCreatePlayModalVisible(false);
        }}
        mapId={mapId}
      />
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
  settingsButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  playsSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  playsList: {
    marginTop: 12,
    gap: 12,
  },
  emptyPlays: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 12,
  },
  emptyPlaysText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  newPlayButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  newPlayButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  playsLoader: {
    marginTop: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tab: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

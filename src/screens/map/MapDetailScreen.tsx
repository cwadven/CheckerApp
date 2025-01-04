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
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackScreenProps } from "../../types/navigation";
import { mapService } from "../../api/services/mapService";
import type { Map } from "../../types/map";

type RouteProps = RootStackScreenProps<"MapDetail">;

export const MapDetailScreen = () => {
  const route = useRoute<RouteProps["route"]>();
  const navigation = useNavigation();
  const { mapId } = route.params;

  const [map, setMap] = useState<Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    loadMapDetail();
  }, [mapId]);

  const handleStartMap = () => {
    navigation.navigate("MapGraphLoading", { mapId: map.id });
  };

  const handlePreviewMap = () => {
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
                  {map.progress.completed_node_count} /{" "}
                  {map.progress.total_node_count} 완료
                </Text>
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
                style={[styles.button, styles.subscribeButton]}
                onPress={() => {
                  console.log("Subscribe");
                }}
              >
                <Text style={styles.subscribeButtonText}>구독하기</Text>
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
});

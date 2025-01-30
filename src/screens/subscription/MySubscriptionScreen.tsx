import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from "react-native";
import { MapCard } from "../../components/map/MapCard";
import { mapService } from "../../api/services/mapService";
import type { Map, MapListResponse } from "../../types/map";
import { eventEmitter, MAP_EVENTS } from "../../utils/eventEmitter";
import { useNavigation } from "@react-navigation/native";
import type { RootStackScreenProps } from "../../types/navigation";

export const MySubscriptionScreen = () => {
  const navigation = useNavigation<RootStackScreenProps<"MapDetail">["navigation"]>();
  const [maps, setMaps] = useState<Map[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMaps = useCallback(async (params: {
    categoryId?: number;
    next_cursor?: string;
    search?: string;
    reset?: boolean;
  } = {}) => {
    try {
      if (params.next_cursor) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await mapService.getSubscribedMaps({
        categoryId: params.categoryId,
        next_cursor: params.next_cursor,
        search: params.search
      });

      const { maps: newMaps, next_cursor, has_more } = response.data;

      setMaps(prev => (params.reset ? newMaps : [...prev, ...newMaps]));
      setNextCursor(next_cursor);
      setHasMore(has_more);
    } catch (err) {
      console.error('Error loading maps:', err);
      setError(err instanceof Error ? err.message : "구독 맵 목록을 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const handleLoadMore = () => {
    if (!isLoadingMore && !isLoading && hasMore && nextCursor) {
      loadMaps({ next_cursor: nextCursor });
    }
  };

  useEffect(() => {
    loadMaps();
  }, [loadMaps]);

  useEffect(() => {
    const handleSubscriptionUpdate = ({
      mapId,
      isSubscribed,
      subscriberCount
    }: {
      mapId: number;
      isSubscribed: boolean;
      subscriberCount: number;
    }) => {
      if (isSubscribed) {
        loadMaps({ reset: true });
      } else {
        setMaps(prevMaps => prevMaps.filter(map => map.id !== mapId));
      }
    };

    eventEmitter.on(MAP_EVENTS.SUBSCRIPTION_UPDATED, handleSubscriptionUpdate);
    return () => {
      eventEmitter.off(MAP_EVENTS.SUBSCRIPTION_UPDATED, handleSubscriptionUpdate);
    };
  }, [loadMaps]);

  const handleMapPress = (mapId: number) => {
    navigation.navigate("MapDetail", { mapId });
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#4CAF50" />
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={maps}
        renderItem={({ item }) => (
          <MapCard 
            map={item} 
            onPress={() => handleMapPress(item.id)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.list}
      />
    );
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  list: {
    padding: 16,
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

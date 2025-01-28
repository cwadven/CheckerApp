import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { MapCard } from "../../components/map/MapCard";
import { SearchBar } from "../../components/common/SearchBar";
import type { Map, MapListResponse } from "../../types/map";
import { mapService } from "../../api/services/mapService";
import type { RootStackScreenProps } from "../../types/navigation";
import { eventEmitter, MAP_EVENTS } from "../../utils/eventEmitter";

interface RouteParams {
  categoryId?: number;
}

export const MapListScreen = () => {
  const route = useRoute();
  const navigation =
    useNavigation<RootStackScreenProps<"MapDetail">["navigation"]>();
  const { categoryId } = (route.params as RouteParams) || {};

  const [maps, setMaps] = useState<Map[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadMaps = async (params: {
    cursor?: string;
    search?: string;
    reset?: boolean;
  }) => {
    try {
      if (params.cursor) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await mapService.getMapList({
        categoryId,
        next_cursor: params.cursor,
        search: params.search,
      });

      const { maps: newMaps, next_cursor, has_more } = response.data;

      setMaps((prev) => (params.reset ? newMaps : [...prev, ...newMaps]));
      setNextCursor(next_cursor);
      setHasMore(has_more);
    } catch (err) {
      console.error("❌ Failed to load maps:", err);
      setError(
        err instanceof Error ? err.message : "맵 목록을 불러오는데 실패했습니다"
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    loadMaps({ search: query, reset: true });
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && !isLoading && hasMore && nextCursor) {
      loadMaps({ cursor: nextCursor, search: searchQuery });
    }
  };

  const handleMapPress = (mapId: number) => {
    navigation.navigate("MapDetail", { mapId });
  };

  useEffect(() => {
    loadMaps({});
  }, [categoryId]);

  useEffect(() => {
    const handleSubscriptionUpdate = ({ mapId, isSubscribed }: { mapId: number; isSubscribed: boolean }) => {
      setMaps(prevMaps => 
        prevMaps.map(map => 
          map.id === mapId ? { ...map, is_subscribed: isSubscribed } : map
        )
      );
    };

    eventEmitter.on(MAP_EVENTS.SUBSCRIPTION_UPDATED, handleSubscriptionUpdate);
    
    return () => {
      eventEmitter.off(MAP_EVENTS.SUBSCRIPTION_UPDATED, handleSubscriptionUpdate);
    };
  }, []);

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
          <MapCard map={item} onPress={() => handleMapPress(item.id)} />
        )}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.list}
      />
    );
  };

  return (
    <View style={styles.container}>
      <SearchBar
        onSearch={handleSearch}
        placeholder="맵 검색"
        initialValue={searchQuery}
      />
      {renderContent()}
    </View>
  );
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

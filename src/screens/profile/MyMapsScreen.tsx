import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Image,
  Pressable,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import type { RootStackScreenProps } from "../../types/navigation";
import { apiClient } from "../../api/client";
import { MapFeatureCard } from '../../components/map/MapFeatureCard';
import { eventEmitter, MAP_EVENTS } from "../../utils/eventEmitter";
import { MapList } from '../../components/map/MapList';

interface Map {
  id: number;
  name: string;
  description: string;
  icon_image: string;
  background_image: string;
  subscriber_count: number;
  view_count: number;
  is_subscribed: boolean;
  created_by: {
    id: number;
    nickname: string;
  };
  created_at: string;
  updated_at: string;
}

interface MyMapsResponse {
  status_code: string;
  data: {
    maps: Map[];
    next_cursor: string | null;
    has_more: boolean;
  };
}

export const MyMapsScreen = ({ navigation }: RootStackScreenProps<"MyMaps">) => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const listRef = useRef<FlatList>(null);

  const loadMaps = useCallback(async (cursor?: string, search?: string) => {
    try {
      if (!cursor) {  // 첫 로드나 새 검색일 때만
        setIsLoading(true);
        setMaps([]); // 데이터 초기화
        setNextCursor(null); // 커서도 초기화
      }
      
      const params = new URLSearchParams();
      if (cursor) params.append('next_cursor', cursor);
      if (search) params.append('search', search);

      const response = await apiClient.get<MyMapsResponse>(
        `/v1/map/my${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (response.status_code === 'success') {
        setMaps(prev => [...prev, ...response.data.maps]);
        setNextCursor(response.data.next_cursor);
        setHasMore(response.data.has_more);
      }
    } catch (error: any) {
      console.error('Error loading maps:', error);
      if (error.status_code === 'login-required') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [navigation]);

  useEffect(() => {
    loadMaps();
  }, [loadMaps]);

  // 구독 상태 변경 감지
  useEffect(() => {
    const handleSubscriptionUpdate = ({
      mapId,
      isSubscribed
    }: {
      mapId: number;
      isSubscribed: boolean;
      subscriberCount: number;
    }) => {
      setMaps(prevMaps => 
        prevMaps.map(map => 
          map.id === mapId 
            ? { 
                ...map, 
                is_subscribed: isSubscribed,
                subscriber_count: isSubscribed 
                  ? map.subscriber_count + 1 
                  : map.subscriber_count - 1
              }
            : map
        )
      );
    };

    eventEmitter.on(MAP_EVENTS.SUBSCRIPTION_UPDATED, handleSubscriptionUpdate);
    return () => {
      eventEmitter.off(MAP_EVENTS.SUBSCRIPTION_UPDATED, handleSubscriptionUpdate);
    };
  }, []);

  const handleSearch = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    loadMaps(undefined, searchQuery);
  }, [loadMaps, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && hasMore && nextCursor) {
      setIsLoadingMore(true);
      loadMaps(nextCursor, searchQuery);
    }
  }, [isLoading, isLoadingMore, hasMore, nextCursor, searchQuery, loadMaps]);

  return (
    <MapList
      maps={maps}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearch={handleSearch}
      onLoadMore={handleLoadMore}
      onMapPress={(mapId) => navigation.navigate('MapDetail', { mapId })}
      emptyText="작성한 맵이 없습니다."
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  listContainer: {
    paddingTop: 16,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  footerLoader: {
    paddingVertical: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
}); 
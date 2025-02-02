import React, { useState, useCallback, useEffect } from 'react';
import type { MainTabScreenProps } from "../../types/navigation";
import { apiClient } from "../../api/client";
import { MapList } from '../../components/map/MapList';
import type { Map, MapListResponse } from '../../types/map';
import { eventEmitter, MAP_EVENTS } from "../../utils/eventEmitter";

export const MySubscriptionScreen = ({ navigation }: MainTabScreenProps<"MySubscription">) => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMaps = useCallback(async (cursor?: string, search?: string) => {
    try {
      if (!cursor) {
        setIsLoading(true);
        setMaps([]);
      }
      
      const params = new URLSearchParams();
      if (cursor) params.append('next_cursor', cursor);
      if (search) params.append('search', search);

      const response = await apiClient.get<MapListResponse>(
        `/v1/map/subscribed${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (response.status_code === 'success') {
        setMaps(prev => cursor ? [...prev, ...response.data.maps] : response.data.maps);
        setNextCursor(response.data.next_cursor);
        setHasMore(response.data.has_more);
      }
    } catch (error: any) {
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
      if (!isSubscribed) {
        setMaps(prevMaps => prevMaps.filter(map => map.id !== mapId));
      }
    };

    eventEmitter.on(MAP_EVENTS.SUBSCRIPTION_UPDATED, handleSubscriptionUpdate);
    return () => {
      eventEmitter.off(MAP_EVENTS.SUBSCRIPTION_UPDATED, handleSubscriptionUpdate);
    };
  }, []);

  const handleSearch = useCallback(() => {
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
      emptyText="구독한 맵이 없습니다."
    />
  );
};

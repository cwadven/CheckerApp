import React, { useState, useCallback, useEffect } from 'react';
import type { RootStackScreenProps } from "../../types/navigation";
import { apiClient } from "../../api/client";
import { MapList } from '../../components/map/MapList';
import type { Map, MapListResponse } from '../../types/map';
import { eventEmitter, MAP_EVENTS } from "../../utils/eventEmitter";

interface RouteParams {
  categoryId?: number;
}

export const MapListScreen = ({ navigation, route }: RootStackScreenProps<"MapList">) => {
  const { categoryId } = (route.params as RouteParams) || {};
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
      if (categoryId) params.append('category_id', categoryId.toString());

      const response = await apiClient.get<MapListResponse>(
        `/v1/map${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (response.status_code === 'success') {
        setMaps(prev => cursor ? [...prev, ...response.data.maps] : response.data.maps);
        setNextCursor(response.data.next_cursor);
        setHasMore(response.data.has_more);
      }
    } catch (error: any) {
      // 에러 처리
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadMaps();
  }, [loadMaps, categoryId]);  // categoryId 변경 시에도 다시 로드

  // 구독 상태 변경 감지
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
      setMaps(prevMaps => 
        prevMaps.map(map => 
          map.id === mapId
            ? {
                ...map,
                is_subscribed: isSubscribed,
                subscriber_count: subscriberCount
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
      emptyText="맵이 없습니다."
    />
  );
};

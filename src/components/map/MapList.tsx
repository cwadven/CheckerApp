import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { MapFeatureCard } from './MapFeatureCard';
import type { Map } from '../../types/map';

interface Props {
  maps: Map[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  onLoadMore: () => void;
  onMapPress: (mapId: number) => void;
  emptyText?: string;
}

export const MapList = ({
  maps,
  isLoading,
  isLoadingMore,
  hasMore,
  searchQuery,
  onSearchChange,
  onSearch,
  onLoadMore,
  onMapPress,
  emptyText = "맵이 없습니다."
}: Props) => {
  const listRef = useRef<FlatList>(null);

  const renderItem = ({ item }: { item: Map }) => (
    <MapFeatureCard
      map={item}
      onPress={onMapPress}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="맵 검색"
            value={searchQuery}
            onChangeText={onSearchChange}
            onSubmitEditing={onSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      <FlatList
        ref={listRef}
        contentContainerStyle={[
          styles.listContainer,
          maps.length === 0 && styles.emptyListContainer
        ]}
        data={maps}
        renderItem={renderItem}
        keyExtractor={item => `map-${item.id}`}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        onMomentumScrollBegin={() => {}}
        ListFooterComponent={
          hasMore && maps.length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{emptyText}</Text>
            </View>
          ) : null
        }
      />

      {isLoading && !isLoadingMore && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      )}
    </View>
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
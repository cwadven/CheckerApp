import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

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

interface Props {
  map: Map;
  onPress: (mapId: number) => void;
}

export const MapFeatureCard = ({ map, onPress }: Props) => (
  <Pressable 
    style={styles.mapItem}
    onPress={() => onPress(map.id)}
  >
    <Image 
      source={{ uri: map.background_image }} 
      style={styles.mapBackground}
    />
    {map.is_subscribed && (
      <View style={styles.subscribeBadge}>
        <Ionicons name="bookmark" size={12} color="white" />
        <Text style={styles.subscribeBadgeText}>구독중</Text>
      </View>
    )}
    <View style={styles.mapContent}>
      <View style={styles.mapIconContainer}>
        <Image 
          source={{ uri: map.icon_image }} 
          style={styles.mapIcon} 
        />
      </View>
      <View style={styles.mapInfo}>
        <Text style={styles.mapName}>{map.name}</Text>
        <Text style={styles.mapDescription} numberOfLines={2}>
          {map.description}
        </Text>
        <View style={styles.mapStats}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.statText}>{map.subscriber_count}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color="#666" />
            <Text style={styles.statText}>{map.view_count}</Text>
          </View>
        </View>
      </View>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  mapItem: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  mapBackground: {
    width: '100%',
    height: 120,
  },
  mapContent: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  mapIconContainer: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: -40,
  },
  mapIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  mapInfo: {
    flex: 1,
    gap: 4,
  },
  mapName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  mapDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  mapStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  subscribeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  subscribeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
}); 
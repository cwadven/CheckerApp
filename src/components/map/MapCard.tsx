import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Map } from "../../types/map";

interface MapCardProps {
  map: Map;
  onPress: () => void;
}

export const MapCard = ({ map, onPress }: MapCardProps) => {
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Image
          source={{ uri: map.icon_image }}
          style={styles.icon}
          resizeMode="cover"
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {map.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {map.description}
        </Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.statText}>
              {formatNumber(map.subscriber_count)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color="#666" />
            <Text style={styles.statText}>{formatNumber(map.view_count)}</Text>
          </View>
        </View>
      </View>
      {map.is_subscribed && (
        <View style={styles.subscribeBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
          <Text style={styles.subscribedText}>구독중</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconContainer: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  icon: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  stats: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: "#666",
  },
  subscribeBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  subscribedText: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "500",
  },
});

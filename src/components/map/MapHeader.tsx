import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MapGraphMeta } from "../../types/map";
import { eventEmitter, MAP_EVENTS } from '../../utils/eventEmitter';

interface MapHeaderProps {
  mapMeta: MapGraphMeta;
  title: string;
  subtitle?: string;
  onBack: () => void;
}

export const MapHeader = ({ mapMeta, title, subtitle, onBack }: MapHeaderProps) => {
  const [completedNodes, setCompletedNodes] = useState(mapMeta.stats.completed_nodes);

  useEffect(() => {
    const handleNodeCompleted = () => {
      setCompletedNodes(prev => prev + 1);
    };

    eventEmitter.on(MAP_EVENTS.NODE_COMPLETED, handleNodeCompleted);

    return () => {
      eventEmitter.off(MAP_EVENTS.NODE_COMPLETED, handleNodeCompleted);
    };
  }, []);

  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons
            name={mapMeta.theme.node.completed.icon}
            size={16}
            color={mapMeta.theme.node.completed.text}
          />
          <Text style={styles.statText}>
            진행도: {completedNodes}/{mapMeta.stats.total_nodes}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons
            name={mapMeta.theme.node.in_progress.icon}
            size={16}
            color={mapMeta.theme.node.in_progress.text}
          />
          {mapMeta.stats.learning_period && (
            <Text style={styles.statText}>
              {mapMeta.stats.learning_period.days}일째 진행중
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "column",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    zIndex: 10,
    elevation: 3,
    position: 'relative',
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    width: '100%',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8,
  },
  titleContainer: {
    flexDirection: "column",
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
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
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});

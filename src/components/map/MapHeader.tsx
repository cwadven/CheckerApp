import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MapGraphMeta } from "../../types/map";

interface MapHeaderProps {
  mapMeta: MapGraphMeta;
  onBack: () => void;
}

export const MapHeader = ({ mapMeta, onBack }: MapHeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.title}>{mapMeta.title}</Text>
      </View>
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons
            name={mapMeta.theme.node.completed.icon}
            size={16}
            color={mapMeta.theme.node.completed.text}
          />
          <Text style={styles.statText}>
            {mapMeta.stats.completed_nodes}/{mapMeta.stats.total_nodes} 완료
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
              {mapMeta.stats.learning_period.days}일째 학습중
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
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
});

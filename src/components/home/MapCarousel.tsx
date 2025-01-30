import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { RootStackScreenProps } from "../../types/navigation";
import type { Map } from "../../types/map";
const defaultBackground = require('../../../assets/qosmo_background.webp');

interface MapCarouselProps {
  title: string;
  subtitle: string;
  maps: Map[];
}

const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const MapCard = ({ map }: { map: Map }) => (
  <Pressable style={styles.card}>
    <Image
      source={map.background_image ? { uri: map.background_image } : defaultBackground}
      style={styles.backgroundImage}
      resizeMode="cover"
    />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {map.name}
      </Text>
      <Text style={styles.cardStats}>
        {formatNumber(map.subscriber_count)}명 구독중
      </Text>
    </View>
  </Pressable>
);

export const MapCarousel = ({ title, subtitle, maps }: MapCarouselProps) => {
  const navigation =
    useNavigation<RootStackScreenProps<"MapDetail">["navigation"]>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {maps.slice(0, 5).map((map) => (
          <Pressable
            key={map.id}
            style={styles.card}
            onPress={() => navigation.navigate("MapDetail", { mapId: map.id })}
          >
            <Image
              source={map.background_image ? { uri: map.background_image } : defaultBackground}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {map.name}
              </Text>
              <Text style={styles.cardStats}>
                {formatNumber(map.subscriber_count)}명 구독중
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  card: {
    width: 200,
    marginHorizontal: 4,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backgroundImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#f5f5f5",
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardStats: {
    fontSize: 14,
    color: "#666",
  },
});

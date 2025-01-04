import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { CategorySection } from "../../components/home/CategorySection";
import { MapCarousel } from "../../components/home/MapCarousel";
import { mockPopularMaps } from "../../api/mocks/popularMaps";
import type { MainTabScreenProps } from "../../types/navigation";

export const HomeScreen = ({ navigation }: MainTabScreenProps<"Home">) => {
  return (
    <ScrollView style={styles.container}>
      <CategorySection />
      <MapCarousel
        title="인기 있는 학습 맵"
        subtitle="많은 사람들이 학습하고 있어요"
        maps={mockPopularMaps}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

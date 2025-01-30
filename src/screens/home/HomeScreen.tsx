import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { CategorySection } from "../../components/home/CategorySection";
import { MapCarousel } from "../../components/home/MapCarousel";
import { mockPopularMaps } from "../../api/mocks/popularMaps";
import { apiClient } from "../../api/client";
import type { MainTabScreenProps } from "../../types/navigation";
import type { Category } from "../../types/category";
import type { ApiResponse } from "../../api/client";


export const HomeScreen = ({ navigation }: MainTabScreenProps<"Home">) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<ApiResponse<Category[]>>('/v1/common/home_map_category/type');
        console.log(response);
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <CategorySection categories={categories} />
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

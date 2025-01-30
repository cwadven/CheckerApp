import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { CategorySection } from "../../components/home/CategorySection";
import { MapCarousel } from "../../components/home/MapCarousel";
import { apiClient } from "../../api/client";
import type { MainTabScreenProps } from "../../types/navigation";
import type { Category } from "../../types/category";
import type { ApiResponse } from "../../api/client";
import { mapService } from "../../api/services/mapService";
import type { Map } from "../../types/map";


export const HomeScreen = ({ navigation }: MainTabScreenProps<"Home">) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dailyMaps, setDailyMaps] = useState<Map[]>([]);
  const [monthlyMaps, setMonthlyMaps] = useState<Map[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<ApiResponse<Category[]>>('/v1/common/home_map_category/type');
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    const fetchPopularMaps = async () => {
      try {
        const [dailyResponse, monthlyResponse] = await Promise.all([
          mapService.getPopularDailyMaps(),
          mapService.getPopularMonthlyMaps()
        ]);
        
        setDailyMaps(dailyResponse.data.maps);
        setMonthlyMaps(monthlyResponse.data.maps);
      } catch (error) {
        console.error('Failed to fetch popular maps:', error);
      }
    };

    fetchCategories();
    fetchPopularMaps();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <CategorySection categories={categories} />
      {dailyMaps.length > 0 && (
        <MapCarousel
          title="오늘의 인기 맵"
          subtitle="지금 가장 인기있는 학습 맵이에요"
          maps={dailyMaps}
        />
      )}
      {monthlyMaps.length > 0 && (
        <MapCarousel
          title="이달의 인기 맵"
          subtitle="이번 달 가장 인기있는 학습 맵이에요"
          maps={monthlyMaps}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

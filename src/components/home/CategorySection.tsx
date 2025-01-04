import React from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CategoryCard } from "../category/CategoryCard";
import { mockCategories } from "../../api/mocks/categories";
import type { RootStackScreenProps } from "../../types/navigation";

const CARD_MARGIN = 8;

export const CategorySection = () => {
  const navigation =
    useNavigation<RootStackScreenProps<"MapList">["navigation"]>();
  const firstRow = mockCategories.slice(0, 4);
  const secondRow = mockCategories.slice(4, 8);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {firstRow.map((category) => (
          <View key={category.id} style={styles.cardContainer}>
            <CategoryCard
              category={category}
              onPress={() =>
                navigation.navigate("MapList", { categoryId: category.id })
              }
            />
          </View>
        ))}
      </View>
      <View style={styles.row}>
        {secondRow.map((category) => (
          <View key={category.id} style={styles.cardContainer}>
            <CategoryCard
              category={category}
              onPress={() =>
                navigation.navigate("MapList", { categoryId: category.id })
              }
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: CARD_MARGIN,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: CARD_MARGIN,
    marginBottom: CARD_MARGIN * 2,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: CARD_MARGIN,
  },
});

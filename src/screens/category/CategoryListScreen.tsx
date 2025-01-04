import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CategoryCard } from "../../components/category/CategoryCard";
import { mockCategories } from "../../api/mocks/categories";
import type { RootStackScreenProps } from "../../types/navigation";

export const CategoryListScreen = () => {
  const navigation =
    useNavigation<RootStackScreenProps<"MapList">["navigation"]>();

  const handleCategoryPress = (categoryId: number) => {
    navigation.navigate("MapList", { categoryId });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={mockCategories}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onPress={() => handleCategoryPress(item.id)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  list: {
    padding: 16,
    gap: 16,
  },
});

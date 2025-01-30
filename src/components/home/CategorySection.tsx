import React, { useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Category } from "../../types/category";
import type { RootStackScreenProps } from "../../types/navigation";

const ITEM_WIDTH = 80;
const ITEM_SPACING = 16;

const CategoryItem = React.memo(({ category, onPress }: {
  category: Category;
  onPress: (categoryId: number) => void;
}) => (
  <Pressable
    style={styles.categoryItem}
    onPress={() => onPress(category.id)}
  >
    <Image
      source={{ uri: category.icon_image }}
      style={styles.categoryIcon}
      resizeMode="contain"
      fadeDuration={0}
    />
    <Text style={styles.categoryName}>{category.name}</Text>
  </Pressable>
));

export const CategorySection = ({ categories }: { categories: Category[] }) => {
  const navigation = useNavigation<RootStackScreenProps<"MapList">["navigation"]>();

  const handleCategoryPress = useCallback((categoryId: number) => {
    navigation.navigate("MapList", { categoryId });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>카테고리</Text>
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <CategoryItem
            category={item}
            onPress={handleCategoryPress}
          />
        )}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={ITEM_WIDTH + ITEM_SPACING}
        contentContainerStyle={styles.list}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH + ITEM_SPACING,
          offset: (ITEM_WIDTH + ITEM_SPACING) * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 16,
  },
  list: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    width: ITEM_WIDTH,
    marginRight: ITEM_SPACING,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

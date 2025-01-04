import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Category } from "../../types/category";

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

export const CategoryCard = ({ category, onPress }: CategoryCardProps) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={category.icon as any} size={24} color="#666" />
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {category.name}
      </Text>
    </Pressable>
  );
};

const CARD_HEIGHT = 120;
const ICON_SIZE = 40;
const VERTICAL_PADDING = 16;
const ICON_MARGIN = 12;
const TEXT_LINE_HEIGHT = 20;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: VERTICAL_PADDING,
    height: CARD_HEIGHT,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: "center",
  },
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: ICON_MARGIN,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: TEXT_LINE_HEIGHT,
    width: "100%",
    height: TEXT_LINE_HEIGHT * 2,
  },
});

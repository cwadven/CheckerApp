import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiClient } from '../../api/client';
import type { Category } from '../../types/category';
import type { RootStackScreenProps } from '../../types/navigation';

export const CategorySection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation<RootStackScreenProps<'MapList'>['navigation']>();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<{ data: Category[] }>('/v1/common/home_map_category/type');
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryPress = (categoryId: number) => {
    navigation.navigate('MapList', { categoryId });
  };

  if (isLoading) {
    return <View style={styles.loadingContainer} />;
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => (
        <TouchableOpacity 
          key={category.id}
          style={styles.categoryItem}
          onPress={() => handleCategoryPress(category.id)}
        >
          <Image 
            source={{ uri: category.icon_image }} 
            style={styles.icon}
          />
          <Text style={styles.text}>{category.display_name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingContainer: {
    height: 100,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
});

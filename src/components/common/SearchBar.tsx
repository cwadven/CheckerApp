import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export const SearchBar = ({
  onSearch,
  placeholder,
  initialValue = "",
}: SearchBarProps) => {
  const [inputValue, setInputValue] = useState(initialValue);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const handleSearch = () => {
    onSearch(inputValue);
  };

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#666" />
      <TextInput
        style={styles.input}
        value={inputValue}
        onChangeText={setInputValue}
        placeholder={placeholder}
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />
      <Pressable onPress={handleSearch} style={styles.searchButton}>
        <Ionicons name="search" size={20} color="#666" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  searchButton: {
    padding: 8,
  },
});

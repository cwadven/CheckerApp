import React from "react";
import { View, StyleSheet } from "react-native";
import { MapListScreen } from "../map/MapListScreen";

export const MySubscriptionScreen = () => {
  return (
    <View style={styles.container}>
      <MapListScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

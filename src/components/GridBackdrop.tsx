import { View, StyleSheet } from "react-native";

export function GridBackdrop() {
  const vertical = Array.from({ length: 16 }, (_, index) => (
    <View key={`v-${index}`} style={[styles.gridLineVertical, { left: index * 56 }]} />
  ));
  const horizontal = Array.from({ length: 24 }, (_, index) => (
    <View key={`h-${index}`} style={[styles.gridLineHorizontal, { top: index * 56 }]} />
  ));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {vertical}
      {horizontal}
    </View>
  );
}

const styles = StyleSheet.create({
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(13, 32, 86, 0.045)',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(13, 32, 86, 0.045)',
  },
  fade: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: 176,
  },
  fadeBand: {
    flex: 1,
  },
});
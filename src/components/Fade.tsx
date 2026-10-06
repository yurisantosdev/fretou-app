import { View, StyleSheet } from "react-native";

export function Fade() {
  return (
    <View style={styles.fade} pointerEvents="none">
      {Array.from({ length: 8 }, (_, index) => (
        <View
          key={index}
          style={[styles.fadeBand, { backgroundColor: `rgba(244, 247, 253, ${(index + 1) / 8})` }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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

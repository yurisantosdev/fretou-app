import { View, StyleSheet } from "react-native";

export function PasswordVisibilityIcon({ crossed }: { crossed: boolean }) {
  return (
    <View style={styles.eyeIcon}>
      <View style={styles.eyeOutline}>
        <View style={styles.eyePupil} />
      </View>
      {crossed ? (
        <>
          <View style={styles.eyeSlashCut} />
          <View style={styles.eyeSlash} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  eyeIcon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeOutline: {
    width: 20,
    height: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1.6,
    borderColor: '#5c6b8a',
  },
  eyePupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5c6b8a',
  },
  eyeSlashCut: {
    position: 'absolute',
    width: 24,
    height: 3,
    backgroundColor: '#ffffff',
    transform: [{ rotate: '-32deg' }],
  },
  eyeSlash: {
    position: 'absolute',
    width: 22,
    height: 1.6,
    borderRadius: 1,
    backgroundColor: '#5c6b8a',
    transform: [{ rotate: '-32deg' }],
  },
});
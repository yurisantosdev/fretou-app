import { SafeAreaView } from 'react-native-safe-area-context';
import { GridBackdrop } from "../GridBackdrop";
import { View, Image, Pressable, Text, StyleSheet } from 'react-native';
import { clearSession } from '@/lib/api';

export type MainProps = {
  children: React.ReactNode;
  onLogout: () => void;
}

export function Main({ children, onLogout }: MainProps) {
  function logout() {
    clearSession();
    onLogout();
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <GridBackdrop />

      <View className="z-10 flex-row items-center justify-between border-b border-line bg-white px-6 py-4">
        <Image
          source={require('./logo-fretou.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Fretou Brasil"
        />
        <View className="flex-row items-center gap-2">
          <Pressable
            className="h-10 items-center justify-center rounded-xl border border-line bg-white px-4"
            onPress={logout}>
            <Text className="text-sm font-semibold text-navy">Sair</Text>
          </Pressable>
        </View>
      </View>

      {children}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  logo: {
    width: 146,
    height: 42,
  },
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
});

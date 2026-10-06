import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export const TOAST_DURATION = 3200;

export type Notice = {
  id: number;
  tone: 'success' | 'error';
  message: string;
};

export function Toast({
  notice,
  onDismiss,
  top = 12,
  floating = true,
}: {
  notice: Notice | null;
  onDismiss: () => void;
  top?: number;
  floating?: boolean;
}) {
  const card = notice ? <ToastCard key={notice.id} notice={notice} onDismiss={onDismiss} /> : null;

  if (!floating) {
    if (!card) return null;
    return <View className="px-5 pt-4">{card}</View>;
  }

  return (
    <View className="absolute inset-x-0 z-50 px-4" style={{ top }} pointerEvents="box-none">
      {card}
    </View>
  );
}

function ToastCard({ notice, onDismiss }: { notice: Notice; onDismiss: () => void }) {
  const progress = useSharedValue(1);
  const success = notice.tone === 'success';

  useEffect(() => {
    progress.value = withTiming(0, { duration: TOAST_DURATION, easing: Easing.linear });
    const timer = setTimeout(onDismiss, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [notice.id, onDismiss, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(280).easing(Easing.out(Easing.cubic))}
      exiting={FadeOutUp.duration(180)}
      style={styles.card}>
      <Pressable
        accessibilityRole="alert"
        className="overflow-hidden rounded-2xl border border-line bg-white"
        onPress={onDismiss}>
        <View className="flex-row items-start gap-3 px-4 py-3.5">
          <View
            className={`mt-0.5 size-8 items-center justify-center rounded-full ${
              success ? 'bg-emerald-100' : 'bg-red-50'
            }`}>
            <Text className={`text-sm font-bold ${success ? 'text-emerald-800' : 'text-red-700'}`}>
              {success ? '✓' : '!'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-navy">{success ? 'Tudo certo' : 'Algo deu errado'}</Text>
            <Text className="mt-0.5 text-sm leading-5 text-muted">{notice.message}</Text>
          </View>
        </View>
        <View className="h-1 bg-canvas">
          <Animated.View className={`h-1 ${success ? 'bg-emerald-500' : 'bg-brand'}`} style={barStyle} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#0d2056',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
});

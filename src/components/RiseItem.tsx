import type { ReactNode } from 'react';
import Animated, { Easing, FadeInUp } from 'react-native-reanimated';

const ease = Easing.out(Easing.cubic);

export function RiseItem({ index = 0, children }: { index?: number; children: ReactNode }) {
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 70)
        .duration(160)
        .easing(ease)
        .withInitialValues({ opacity: 0, transform: [{ translateY: 36 }] })}>
      {children}
    </Animated.View>
  );
}

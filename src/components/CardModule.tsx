import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CardModuleType } from '../types/cardModule';

export function CardModule({ title, description, icon, color, onPress }: CardModuleType) {
  return (
    <Pressable
      accessibilityRole="button"
      className="flex-col rounded-2xl border border-line bg-white p-5"
      style={styles.card}
      onPress={onPress}>
      <View className="flex-row items-start justify-between gap-4">
        <View className={`size-12 items-center justify-center rounded-xl ${color}`}>{icon}</View>
        <View className="size-9 items-center justify-center rounded-full">
          <ArrowUpRight />
        </View>
      </View>

      <Text className="mt-5 text-lg font-bold tracking-tight text-navy">{title}</Text>
      <Text className="mt-1.5 text-sm leading-5 text-muted">{description}</Text>

      <View className="mt-5 flex-row items-center gap-1.5 border-t border-line pt-4">
        <Text className="text-sm font-semibold text-brand">Acessar módulo</Text>
        <ArrowRight />
      </View>
    </Pressable>
  );
}

function ArrowRight() {
  return (
    <View className="h-4 w-4 items-center justify-center">
      <View className="h-[1.8px] w-3.5 bg-brand" />
      <View className="absolute right-0 size-2 rotate-45 border-r-[1.8px] border-t-[1.8px] border-brand" />
    </View>
  );
}

function ArrowUpRight() {
  return (
    <View className="-rotate-45">
      <View className="h-4 w-4 items-center justify-center">
        <View className="h-[1.8px] w-3.5 bg-faint" />
        <View className="absolute right-0 size-2 rotate-45 border-r-[1.8px] border-t-[1.8px] border-faint" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#0d2056',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
});

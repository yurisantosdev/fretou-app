import { View, Text } from "react-native";

export function Info({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-0 flex-1">
      <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</Text>
      <Text className="mt-1 text-sm font-semibold leading-5 text-navy">{value}</Text>
    </View>
  );
}
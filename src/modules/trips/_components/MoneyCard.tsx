import { View, Text } from "react-native";

export function MoneyCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <View className="rounded-2xl border border-line bg-white p-4">
      <Text className="text-xs font-bold uppercase tracking-widest text-muted">{label}</Text>
      <Text className="mt-2 text-2xl font-bold text-navy">{value}</Text>
      <Text className="mt-2 text-sm leading-5 text-ink">{hint}</Text>
    </View>
  );
}
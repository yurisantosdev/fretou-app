import { ReactNode } from "react";
import { View, Text } from "react-native";

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3 rounded-2xl border border-line p-4">
      <Text className="text-sm font-bold text-navy">{title}</Text>
      {children}
    </View>
  );
}
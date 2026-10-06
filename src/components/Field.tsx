import { ReactNode } from "react";
import { View, Text } from "react-native";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-navy">{label}</Text>
      {children}
    </View>
  );
}
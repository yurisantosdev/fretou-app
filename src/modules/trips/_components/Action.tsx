import { Pressable, Text } from "react-native";

export function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable className="h-10 items-center justify-center rounded-xl bg-brand px-4" onPress={onPress}>
      <Text className="text-sm font-semibold text-white">{label}</Text>
    </Pressable>
  );
}
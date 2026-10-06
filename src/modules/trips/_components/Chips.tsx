import { View, Text, Pressable } from "react-native";

export function Chips<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <View className="gap-2 rounded-xl border border-line bg-white px-4 py-3">
      <Text className="text-sm text-navy">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value || 'todos'}
              className={`rounded-full px-3 py-2 ${selected ? 'bg-brand' : 'bg-canvas'}`}
              onPress={() => onChange(option.value)}>
              <Text className={`text-sm font-semibold ${selected ? 'text-white' : 'text-navy'}`}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
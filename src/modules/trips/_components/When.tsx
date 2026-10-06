import { DatePicker } from "@/components/DatePicker";
import { View, Text } from "react-native";

export function When({ value, min, onChange }: { value: string; min?: string; onChange: (value: string) => void }) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-navy">Data e hora</Text>
      <DatePicker showTime value={value} min={min} placeholder="Selecione data e hora" onChange={onChange} />
    </View>
  );
}
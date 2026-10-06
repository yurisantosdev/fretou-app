import { Notice, Toast } from "@/components/Toast";
import { VEHICLE_TYPES, Vehicle, VehicleFormData, isVehicleType } from "../types";
import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Switch } from "react-native";
import { Field } from "@/components/Field";

export function VehicleFormFields({
  vehicle,
  creating,
  notice,
  onDismissNotice,
  onCancel,
  onSubmit,
}: {
  vehicle: Vehicle | null;
  creating: boolean;
  notice: Notice | null;
  onDismissNotice: () => void;
  onCancel: () => void;
  onSubmit: (data: VehicleFormData) => void | Promise<void>;
}) {
  const inputClass = 'h-11 rounded-xl border border-line bg-white px-4 text-base text-navy';
  const [plate, setPlate] = useState(vehicle?.plate ?? '');
  const [model, setModel] = useState(vehicle?.model ?? '');
  const [year, setYear] = useState(vehicle?.year ? String(vehicle.year) : '');
  const [totalLoad, setTotalLoad] = useState(vehicle?.totalLoad ? String(vehicle.totalLoad) : '');
  const [active, setActive] = useState(vehicle?.active !== false);
  const [typesOpen, setTypesOpen] = useState(false);
  const [erro, setErro] = useState('');
  const anoMaximo = new Date().getFullYear() + 1;

  async function save() {
    const plateValue = plate.trim();
    if (!plateValue) {
      setErro('Informe a placa.');
      return;
    }

    if (!isVehicleType(model)) {
      setErro('Selecione o tipo do veículo.');
      return;
    }

    const yearValue = Number(year);
    if (!Number.isInteger(yearValue) || yearValue < 1970 || yearValue > anoMaximo) {
      setErro(`Informe um ano entre 1970 e ${anoMaximo}.`);
      return;
    }

    const loadValue = Number(totalLoad.replace(',', '.'));
    if (!Number.isFinite(loadValue) || loadValue <= 0) {
      setErro('Informe a carga total em kg.');
      return;
    }

    setErro('');
    await onSubmit({
      plate: plateValue,
      model,
      year: yearValue,
      totalLoad: loadValue,
      active,
    });
  }

  return (
    <View className="max-h-[88%] rounded-t-3xl bg-white">
      <Toast notice={notice} onDismiss={onDismissNotice} floating={false} />
      <View className="flex-row items-start justify-between gap-4 border-b border-line px-5 py-4">
        <View className="flex-1">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted">
            {creating ? 'Cadastro' : 'Edição'}
          </Text>
          <Text className="mt-1 text-xl font-bold text-navy">
            {creating ? 'Novo veículo' : (vehicle?.plate ?? '')}
          </Text>
        </View>
        <Pressable
          className="h-9 items-center justify-center rounded-xl px-2"
          onPress={onCancel}>
          <Text className="text-sm font-semibold text-navy">Fechar</Text>
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 32 }}>
        <View className="gap-4">
          <View>
            <Text className="text-xs font-bold uppercase tracking-widest text-muted">Identificação</Text>
            <Text className="mt-1 text-sm leading-5 text-muted">
              Placa, tipo e ano usados para reconhecer o veículo na operação.
            </Text>
          </View>

          <Field label="Placa">
            <TextInput
              className={inputClass}
              style={{ paddingVertical: 0 }}
              value={plate}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="Placa do veículo"
              placeholderTextColor="#93a0bb"
              onChangeText={(value) => setPlate(value.toUpperCase())}
            />
          </Field>

          <Field label="Tipo">
            <Pressable
              className="h-11 flex-row items-center justify-between rounded-xl border border-line bg-white px-4"
              onPress={() => setTypesOpen((current) => !current)}>
              <Text className={model ? 'text-base text-navy' : 'text-base text-placeholder'}>
                {model || 'Selecione o tipo'}
              </Text>
              <Text className="text-sm font-semibold text-brand">{typesOpen ? 'Fechar' : 'Escolher'}</Text>
            </Pressable>
            {typesOpen ? (
              <View className="overflow-hidden rounded-xl border border-line">
                {VEHICLE_TYPES.map((tipo) => {
                  const selected = model === tipo;
                  return (
                    <Pressable
                      key={tipo}
                      className={`border-b border-line px-4 py-3 ${selected ? 'bg-canvas' : 'bg-white'}`}
                      onPress={() => {
                        setModel(tipo);
                        setTypesOpen(false);
                      }}>
                      <Text className={`text-sm ${selected ? 'font-bold text-brand' : 'font-semibold text-navy'}`}>
                        {tipo}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </Field>

          <Field label="Ano">
            <TextInput
              className={inputClass}
              style={{ paddingVertical: 0 }}
              inputMode="numeric"
              keyboardType="number-pad"
              value={year}
              maxLength={4}
              placeholder={String(anoMaximo)}
              placeholderTextColor="#93a0bb"
              onChangeText={(value) => setYear(value.replace(/\D/g, '').slice(0, 4))}
            />
          </Field>
        </View>

        <View className="gap-4 border-t border-line pt-5">
          <View>
            <Text className="text-xs font-bold uppercase tracking-widest text-muted">Capacidade</Text>
            <Text className="mt-1 text-sm leading-5 text-muted">
              Peso máximo que o veículo pode transportar.
            </Text>
          </View>

          <Field label="Carga total (kg)">
            <TextInput
              className={inputClass}
              style={{ paddingVertical: 0 }}
              inputMode="decimal"
              keyboardType="decimal-pad"
              value={totalLoad}
              placeholder="Ex.: 14000"
              placeholderTextColor="#93a0bb"
              onChangeText={(value) => setTotalLoad(value.replace(/[^\d,.]/g, ''))}
            />
            <Text className="text-xs text-muted">Informe o valor em quilogramas.</Text>
          </Field>
        </View>

        <View
          className={`flex-row items-start gap-3 rounded-2xl border p-4 ${active ? 'border-line bg-white' : 'border-amber-200 bg-amber-50'
            }`}>
          <Switch
            value={active}
            onValueChange={setActive}
            trackColor={{ false: '#d7deee', true: '#1c44f2' }}
            thumbColor="#ffffff"
          />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-navy">
              {active ? 'Veículo ativo' : 'Veículo desativado'}
            </Text>
            <Text className="mt-1 text-sm leading-5 text-muted">
              {active
                ? 'Disponível para novas viagens.'
                : 'Fora da operação. Não aparece na lista de novas viagens.'}
            </Text>
          </View>
        </View>

        {erro ? <Text className="text-sm font-semibold text-brand">{erro}</Text> : null}

        <View className="flex-row justify-end gap-3 border-t border-line pt-4">
          <Pressable
            className="h-10 items-center justify-center rounded-xl border border-line bg-white px-4"
            onPress={onCancel}>
            <Text className="text-sm font-semibold text-navy">Cancelar</Text>
          </Pressable>
          <Pressable
            className="h-10 items-center justify-center rounded-xl bg-brand px-4"
            onPress={() => void save()}>
            <Text className="text-sm font-semibold text-white">Salvar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
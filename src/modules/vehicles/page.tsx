import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { RiseItem } from '@/components/RiseItem';
import { Toast } from '@/components/Toast';
import { Main } from '@/components/main';
import { fetchProfile, readToken, type Profile } from '@/lib/api';
import { VehicleForm } from './VehicleForm';
import { formatLoad, type VehicleStatusFilter } from './types';
import { useVehicles } from './useVehicles';
import { ArrowLeft } from '../../components/ArrowLeft';

export function Vehicles({ onLogout, onBack }: { onLogout: () => void; onBack: () => void }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileReady, setProfileReady] = useState(false);
  const [profileError, setProfileError] = useState('');
  const STATUS_OPTIONS: readonly { value: VehicleStatusFilter; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'ativos', label: 'Ativos' },
    { value: 'inativos', label: 'Desativados' },
  ];

  useEffect(() => {
    let active = true;
    const token = readToken();
    if (!token) {
      setProfileError('Sessão expirada.');
      setProfileReady(true);
      return;
    }

    void fetchProfile(token)
      .then((next) => {
        if (!active) return;
        if (!next) {
          setProfileError('Não foi possível identificar o usuário.');
          return;
        }
        setProfile(next);
      })
      .catch(() => {
        if (active) setProfileError('Sem conexão, verifique sua conexão com a internet.');
      })
      .finally(() => {
        if (active) setProfileReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const driverId = profile?.driver && profile.thirdParty ? profile.id : undefined;
  const data = useVehicles(driverId, profileReady && !profileError);

  return (
    <Main onLogout={onLogout}>
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
        <RiseItem index={1}>
          <Pressable className="z-10 max-w-2xl flex-row items-center gap-1.5 px-6 pt-6" onPress={onBack}>
            <ArrowLeft />
            <Text className="text-sm font-semibold text-navy">Retornar</Text>
          </Pressable>
        </RiseItem>

        <View className="z-10 max-w-2xl px-6 pt-6">
          <RiseItem index={2}>
            <Text className="text-sm font-bold uppercase tracking-widest text-brand">Módulo - Veículos</Text>
          </RiseItem>
          <RiseItem index={3}>
            <Text className="mt-2 text-3xl font-bold tracking-tight text-navy">Veículos</Text>
          </RiseItem>
          <RiseItem index={4}>
            <Text className="mt-3 text-base leading-6 text-ink">
              {data.ownFleet
                ? 'Veículos cadastrados no seu nome, com placa, tipo, ano e carga em kg.'
                : 'Cadastre os veículos da empresa, com placa, tipo, ano e carga em kg, e desative quando não forem mais usados nas viagens.'}
            </Text>
          </RiseItem>

          <RiseItem index={5}>
            <Pressable
              className="w-full mt-5 h-10 items-center justify-center self-start rounded-xl bg-brand px-4"
              onPress={() => {
                data.setVehicleOpen(null);
                data.setCreateModal(true);
              }}>
              <Text className="text-sm font-semibold text-white">Novo veículo</Text>
            </Pressable>
          </RiseItem>
        </View>

        <RiseItem index={6}>
          <View className="z-10 max-w-2xl gap-4 px-6 pt-8">
            <View className="gap-2">
              <Text className="text-sm text-navy">Busca</Text>
              <TextInput
                className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-navy"
                style={{ paddingVertical: 0 }}
                value={data.search}
                placeholder="Placa, tipo, ano ou carga"
                placeholderTextColor="#93a0bb"
                onChangeText={data.setSearch}
              />
            </View>

            <View className="gap-2 rounded-xl border border-line bg-white px-4 py-3">
              <Text className="text-sm text-navy">Status</Text>
              <View className="flex-row flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => {
                  const selected = data.statusFilter === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      className={`rounded-full px-3 py-2 ${selected ? 'bg-brand' : 'bg-canvas'}`}
                      onPress={() => data.setStatusFilter(option.value)}>
                      <Text className={`text-sm font-semibold ${selected ? 'text-white' : 'text-navy'}`}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {profileError ? <Text className="text-sm font-semibold text-brand">{profileError}</Text> : null}
            {!profileError && data.loading ? (
              <Text className="text-sm text-muted">Carregando veículos...</Text>
            ) : null}
            {data.error ? <Text className="text-sm font-semibold text-brand">{data.error}</Text> : null}

            {!data.loading && !data.error && !profileError && data.vehicles.length === 0 ? (
              <Text className="text-sm text-muted">Nenhum veículo encontrado.</Text>
            ) : null}

            <View className="gap-3">
              {data.vehicles.map((vehicle) => {
                const ativo = vehicle.active !== false;
                return (
                  <View key={vehicle._id} className="rounded-2xl border border-line bg-white p-4">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-navy">{vehicle.plate}</Text>
                        <Text className="mt-1 text-sm text-muted">{vehicle.model}</Text>
                      </View>
                      <View className={`rounded-full px-2.5 py-1 ${ativo ? 'bg-emerald-100' : 'bg-canvas'}`}>
                        <Text className={`text-xs font-bold ${ativo ? 'text-emerald-800' : 'text-muted'}`}>
                          {ativo ? 'Ativo' : 'Desativado'}
                        </Text>
                      </View>
                    </View>

                    <View className="mt-4 flex-row gap-6">
                      <View>
                        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">Ano</Text>
                        <Text className="mt-1 text-sm font-semibold text-navy">{vehicle.year || '—'}</Text>
                      </View>
                      <View>
                        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">Carga total</Text>
                        <Text className="mt-1 text-sm font-semibold text-navy">{formatLoad(vehicle.totalLoad)}</Text>
                      </View>
                    </View>

                    <Pressable
                      accessibilityLabel={`Editar ${vehicle.plate}`}
                      className="mt-4 h-10 items-center justify-center rounded-xl border border-line bg-white"
                      onPress={() => {
                        data.setCreateModal(false);
                        data.setVehicleOpen(vehicle);
                      }}>
                      <Text className="text-sm font-semibold text-navy">Ver</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        </RiseItem>
      </ScrollView>

      {data.openModal ? null : (
        <Toast notice={data.notice} onDismiss={data.dismissNotice} top={78} />
      )}

      <VehicleForm
        visible={data.openModal}
        vehicle={data.vehicleOpen}
        creating={data.createModal}
        notice={data.notice}
        onDismissNotice={data.dismissNotice}
        onCancel={data.closeModal}
        onSubmit={data.saveVehicle}
      />
    </Main>
  );
}
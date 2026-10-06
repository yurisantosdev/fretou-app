import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { RiseItem } from '@/components/RiseItem';
import { Toast } from '@/components/Toast';
import { Main } from '@/components/main';
import { fetchProfile, readToken, type Profile } from '@/lib/api';
import { formatDate, formatMoney, formatWeight } from './format';
import { codigoExibido, STATUS_CLASS, STATUS_LABEL } from './rules';
import { TripDetailSheet } from './TripDetail';
import { STATUS_TRIP, type StatusFilter } from './types';
import { useTrips } from './useTrips';
import { ArrowLeft } from '../../components/ArrowLeft';
import { MoneyCard } from './_components/MoneyCard';
import { Chips } from './_components/Chips';

export function Trips({ onLogout, onBack }: { onLogout: () => void; onBack: () => void }) {
  const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    ...STATUS_TRIP.map((status) => ({ value: status, label: STATUS_LABEL[status] })),
  ];
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileReady, setProfileReady] = useState(false);
  const [profileError, setProfileError] = useState('');

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

  const lockedDriverId = profile?.driver ? profile.id : undefined;
  const data = useTrips(lockedDriverId, profileReady && !profileError);

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
            <Text className="text-sm font-bold uppercase tracking-widest text-brand">Módulo - Viagens</Text>
          </RiseItem>
          <RiseItem index={3}>
            <Text className="mt-2 text-3xl font-bold tracking-tight text-navy">Viagens</Text>
          </RiseItem>
          <RiseItem index={4}>
            <Text className="mt-3 text-base leading-6 text-ink">
              Os títulos saem quando o CT-e e a foto do caminhão carregado existem. O saldo só pode ser programado
              depois da descarga e dos comprovantes.
            </Text>
          </RiseItem>
          {data.lockedDriver ? null : (
            <RiseItem index={5}>
              <Pressable
                className="mt-5 h-10 items-center justify-center self-start rounded-xl bg-brand px-4"
                onPress={() => {
                  data.closeModal();
                  data.setCreateModal(true);
                }}>
                <Text className="text-sm font-semibold text-white">Nova viagem</Text>
              </Pressable>
            </RiseItem>
          )}
        </View>

        {data.lockedDriver ? null : (
          <View className="z-10 max-w-2xl gap-3 px-6 pt-8">
            <MoneyCard label="A pagar hoje" value={formatMoney(data.summary.payToday)} hint={`Em aberto no total: ${formatMoney(data.summary.payOpen)}. Inclui vencidos.`} />
            <MoneyCard label="A receber" value={formatMoney(data.summary.receiveOpen)} hint={`Vence hoje ou está vencido: ${formatMoney(data.summary.receiveToday)}.`} />
            <MoneyCard
              label="Saldos travados"
              value={formatMoney(data.summary.lockedTotal)}
              hint={
                data.summary.locked.length === 1
                  ? '1 lançamento com motivo na lista abaixo.'
                  : `${data.summary.locked.length} lançamentos com motivo na lista abaixo.`
              }
            />
            <MoneyCard
              label="Margem"
              value={formatMoney(data.summary.margin)}
              hint="Soma do frete do cliente menos o frete do motorista, vinda do acordo de cada viagem."
            />
          </View>
        )}

        {data.lockedDriver ? null : (
          <View className="z-10 max-w-2xl gap-3 px-6 pt-8">
            <Text className="text-sm font-bold uppercase tracking-widest text-brand">Saldos travados</Text>
            {data.summary.locked.length === 0 ? (
              <Text className="text-sm text-muted">Nenhum registro encontrado.</Text>
            ) : (
              data.summary.locked.map((item) => (
                <View key={item.id} className="rounded-2xl border border-line bg-white p-4">
                  <Text className="text-base font-bold text-navy">{item.label}</Text>
                  <Text className="mt-1 text-sm text-muted">{item.leg}</Text>
                  <Text className="mt-2 text-sm font-semibold text-navy">{formatMoney(item.amount)}</Text>
                  <Text className="mt-2 text-sm leading-5 text-ink">{item.reason}</Text>
                </View>
              ))
            )}
          </View>
        )}

        <View className="z-10 max-w-2xl gap-4 px-6 pt-8">
          <Text className="text-sm font-bold uppercase tracking-widest text-brand">Viagens</Text>
          <View className="gap-2">
            <Text className="text-sm text-navy">Busca</Text>
            <TextInput
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-navy"
              style={{ paddingVertical: 0 }}
              value={data.search}
              placeholder="Viagem, produto ou rota"
              placeholderTextColor="#93a0bb"
              onChangeText={data.setSearch}
            />
          </View>

          <Chips
            label="Estado"
            value={data.statusFilter}
            options={STATUS_OPTIONS}
            onChange={data.setStatusFilter}
          />
          <Chips
            label="Cliente"
            value={data.clientFilter}
            options={[{ value: '', label: 'Todos' }, ...data.clients.map((client) => ({ value: client.id, label: client.corporateName }))]}
            onChange={data.setClientFilter}
          />
          {data.clientsError ? <Text className="text-xs text-muted">{data.clientsError}</Text> : null}
          {data.lockedDriver ? null : (
            <Chips
              label="Motorista"
              value={data.driverFilter}
              options={[
                { value: '', label: 'Todos' },
                ...data.drivers.map((driver) => ({
                  value: driver.id,
                  label: `${driver.name}${driver.thirdParty ? ' · Terceiro' : ' · Interno'}`,
                })),
              ]}
              onChange={data.setDriverFilter}
            />
          )}

          {profileError ? <Text className="text-sm font-semibold text-brand">{profileError}</Text> : null}
          {!profileError && data.loading ? <Text className="text-sm text-muted">Carregando viagens...</Text> : null}
          {data.error ? <Text className="text-sm font-semibold text-brand">{data.error}</Text> : null}
          {!data.loading && !data.error && !profileError && data.visible.length === 0 ? (
            <Text className="text-sm text-muted">Nenhuma viagem encontrada.</Text>
          ) : null}

          <View className="gap-3">
            {data.visible.map((trip) => {
              const receber = trip.titles.find((item) => item.nature === 'receber');
              const badge = STATUS_CLASS[trip.status].split(' ');
              return (
                <View key={String(trip._id)} className="rounded-2xl border border-line bg-white p-4">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-navy">{codigoExibido(trip)}</Text>
                      <Text className="mt-1 text-sm text-muted">
                        {trip.origin} → {trip.destination}
                      </Text>
                    </View>
                    <View className={`rounded-full px-2.5 py-1 ${badge[0]}`}>
                      <Text className={`text-xs font-bold ${badge[1]}`}>{STATUS_LABEL[trip.status]}</Text>
                    </View>
                  </View>
                  <Text className="mt-3 text-sm text-navy">{trip.product || '—'}</Text>
                  <View className="mt-3 flex-row gap-6">
                    <View>
                      <Text className="text-xs font-semibold uppercase tracking-wide text-muted">Carga</Text>
                      <Text className="mt-1 text-sm font-semibold text-navy">{formatWeight(trip.load)}</Text>
                    </View>
                    <View>
                      <Text className="text-xs font-semibold uppercase tracking-wide text-muted">Carregamento</Text>
                      <Text className="mt-1 text-sm font-semibold text-navy">{formatDate(trip.dateLoad)}</Text>
                    </View>
                    <View>
                      <Text className="text-xs font-semibold uppercase tracking-wide text-muted">A receber</Text>
                      <Text className="mt-1 text-sm font-semibold text-navy">{receber ? formatMoney(receber.value) : '—'}</Text>
                    </View>
                  </View>
                  {trip.margem.negativa ? (
                    <Text className="mt-3 text-xs font-bold text-brand">
                      Margem negativa · {formatMoney(trip.margem.margemReais)}
                    </Text>
                  ) : null}
                  <Pressable
                    className="mt-4 h-10 items-center justify-center rounded-xl border border-line bg-white"
                    onPress={() => void data.openTrip(String(trip._id))}>
                    <Text className="text-sm font-semibold text-navy">Abrir</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {data.openModal ? null : <Toast notice={data.notice} onDismiss={data.dismissNotice} top={78} />}

      {data.tripOpen && !data.editModal && !data.createModal ? (
        <TripDetailSheet
          key={data.tripOpen.id}
          trip={data.tripOpen}
          canEdit={!data.lockedDriver}
          notice={data.notice}
          onDismissNotice={data.dismissNotice}
          onClose={data.closeModal}
          onEdit={() => data.setEditModal(true)}
          onIssueCte={(numero, emitidoEm) => data.issueCte(data.tripOpen!.id, numero, emitidoEm)}
          onAttachPhoto={(nome, enviadaEm, conteudo) => data.sendPhoto(data.tripOpen!.id, nome, enviadaEm, conteudo)}
          onRegisterUnload={(dataHora) => data.unload(data.tripOpen!.id, dataHora)}
          onRegisterOriginalDocuments={(dataHora) => data.documents(data.tripOpen!.id, dataHora)}
          onSettle={(papel, dataHora) => data.settle(data.tripOpen!.id, papel, dataHora)}
          onRegisterAdvance={(dataHora) => data.registerAdvance(data.tripOpen!.id, dataHora)}
          onScheduleBalance={(dataHora) => data.schedule(data.tripOpen!.id, dataHora)}
          onCancelTrip={() => data.cancel(data.tripOpen!.id)}
        />
      ) : null}
    </Main>
  );
}

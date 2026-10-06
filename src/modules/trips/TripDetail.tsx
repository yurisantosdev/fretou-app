import { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { DatePicker } from '@/components/DatePicker';
import * as ImagePicker from 'expo-image-picker';
import { Toast, type Notice } from '@/components/Toast';
import { comprimirFoto } from './compressPhoto';
import { formatDate, formatDateTime } from './format';
import {
  estadoHint,
  eventoDe,
  nowLocalInput,
  STATUS_CLASS,
  STATUS_LABEL,
} from './rules';
import type { PapelTitulo, TripDetail as TripDetailData } from './types';
import { Info } from './_components/Info';
import { Card } from './_components/Card';
import { When } from './_components/When';
import { Action } from './_components/Action';

export function TripDetailSheet({
  trip,
  canEdit,
  notice,
  onDismissNotice,
  onClose,
  onEdit,
  onIssueCte,
  onAttachPhoto,
  onRegisterUnload,
  onRegisterOriginalDocuments,
  onSettle,
  onRegisterAdvance,
  onScheduleBalance,
  onCancelTrip,
}: {
  trip: TripDetailData;
  canEdit: boolean;
  notice: Notice | null;
  onDismissNotice: () => void;
  onClose: () => void;
  onEdit: () => void;
  onIssueCte: (numero: string, emitidoEm: string) => Promise<void>;
  onAttachPhoto: (nome: string, enviadaEm: string, conteudo: string) => Promise<void>;
  onRegisterUnload: (dataHora: string) => Promise<void>;
  onRegisterOriginalDocuments: (dataHora: string) => Promise<void>;
  onSettle: (papel: PapelTitulo, dataHora: string) => Promise<void>;
  onRegisterAdvance: (dataHora: string) => Promise<void>;
  onScheduleBalance: (dataHora: string) => Promise<void>;
  onCancelTrip: () => Promise<void>;
}) {
  const inputClass = 'h-11 rounded-xl border border-line bg-white px-4 text-base text-navy';
  const foto = trip.vouchers.find((item) => item.type === 'FOTO_CARREGAMENTO');
  const comprovantes = trip.vouchers.find((item) => item.type === 'ORIGINAIS');
  const descarga = eventoDe(trip, 'descarga');
  const canCancel = trip.status === 'AGUARDANDO_CTE' && !trip.cte && !foto;
  const [cteNumber, setCteNumber] = useState(trip.cte?.number ?? '');
  const [cteDate, setCteDate] = useState((trip.cte?.emitted ?? trip.dateLoad).slice(0, 10));
  const [unloadedAt, setUnloadedAt] = useState(descarga?.occurredAt.slice(0, 16) ?? nowLocalInput());
  const [documentsAt, setDocumentsAt] = useState(comprovantes?.received.slice(0, 16) ?? nowLocalInput());
  const [sendingPhoto, setSendingPhoto] = useState(false);

  async function registerCte() {
    if (!cteNumber.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(cteDate)) {
      Alert.alert('CT-e', 'Informe o número e a data do CT-e.');
      return;
    }
    await onIssueCte(cteNumber.trim(), cteDate);
  }

  async function sendPhoto(origem: 'camera' | 'galeria') {
    const permissao =
      origem === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert(
        'Foto',
        origem === 'camera'
          ? 'Permita o acesso à câmera para fotografar o caminhão carregado.'
          : 'Permita o acesso às fotos para anexar o caminhão carregado.'
      );
      return;
    }
    const opcoes = { mediaTypes: ['images' as const], quality: 0.5 };
    const result =
      origem === 'camera'
        ? await ImagePicker.launchCameraAsync(opcoes)
        : await ImagePicker.launchImageLibraryAsync(opcoes);
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (asset.mimeType && !asset.mimeType.startsWith('image/')) {
      Alert.alert('Foto', 'Envie uma imagem do caminhão carregado.');
      return;
    }
    setSendingPhoto(true);
    try {
      const conteudo = await comprimirFoto(asset.uri, asset.width, asset.height);
      await onAttachPhoto(asset.fileName ?? 'carregamento.jpg', new Date().toISOString(), conteudo);
    } catch (err) {
      Alert.alert('Foto', err instanceof Error ? err.message : 'Não foi possível preparar a imagem.');
    } finally {
      setSendingPhoto(false);
    }
  }

  async function registerUnload() {
    if (!unloadedAt || unloadedAt.slice(0, 10) < trip.dateLoad) {
      Alert.alert('Descarga', 'A descarga precisa de data e hora, e não pode ser anterior ao carregamento.');
      return;
    }
    await onRegisterUnload(unloadedAt);
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between border-b border-line px-5 pb-4 pt-14">
          <View className="flex-1 pr-3">
            <Text className="text-xs font-bold uppercase tracking-widest text-brand">{trip.codigo || trip.id.slice(-6).toUpperCase()}</Text>
            <Text className="mt-1 text-xl font-bold text-navy">{trip.clienteNome}</Text>
            <Text className="mt-1 text-sm text-muted">
              {trip.origin} → {trip.destination}
            </Text>
          </View>
          <Pressable className="h-10 bg-brand items-center justify-center rounded-xl px-3" onPress={onClose}>
            <Text className="text-sm font-semibold text-white">Fechar</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
          <View className="flex-row items-center justify-between gap-3">
            <Text className="flex-1 rounded-xl bg-canvas px-4 py-3 text-sm text-navy">{estadoHint(trip)}</Text>
          </View>
          {canCancel ? (
            <Pressable
              className="h-10 items-center justify-center rounded-xl border border-red-500 bg-red-400"
              onPress={() => {
                Alert.alert('Cancelar viagem', 'Cancelar esta viagem? Ela ainda não começou.', [
                  { text: 'Voltar', style: 'cancel' },
                  { text: 'Cancelar viagem', style: 'destructive', onPress: () => void onCancelTrip() },
                ]);
              }}>
              <Text className="text-sm font-semibold text-red-900">Cancelar viagem</Text>
            </Pressable>
          ) : null}
          {canEdit && trip.status !== 'FINALIZADA' && trip.status !== 'CANCELADA' ? (
            <Pressable className="h-10 items-center justify-center rounded-xl border border-line" onPress={onEdit}>
              <Text className="text-sm font-semibold text-navy">Editar viagem</Text>
            </Pressable>
          ) : null}

          <View className="rounded-2xl border border-line bg-canvas p-4">
            <View className="flex-row items-start gap-3">
              <Info label="Origem" value={trip.origin} />
              <Text className="pt-4 text-base font-bold text-brand">→</Text>
              <Info label="Destino" value={trip.destination} />
            </View>
            <View className="mt-4 flex-row gap-3 border-t border-line pt-4">
              <Info label="Cliente" value={trip.clienteNome} />
              <Info label="Motorista" value={trip.motoristaNome} />
            </View>
            <View className="mt-4 flex-row items-start gap-3">
              <Info
                label="Veículo"
                value={trip.plate ? `${trip.plate}${trip.vehicleModel ? ` · ${trip.vehicleModel}` : ''}` : '—'}
              />
              <View className="flex-1">
                <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted">Estado</Text>
                <View className={`mt-2 self-start rounded-full py-1 ${STATUS_CLASS[trip.status].split(' ')[0]}`}>
                  <Text className={`text-xs font-bold ${STATUS_CLASS[trip.status].split(' ')[1]}`}>
                    {STATUS_LABEL[trip.status]}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {trip.status === 'CANCELADA' ? null : (
            <>
              <Card title="CT-e">
                {trip.cte ? (
                  <Text className="text-sm text-muted">
                    Emitido em {formatDate(trip.cte.emitted)}, número {trip.cte.number}.
                  </Text>
                ) : (
                  <>
                    <Text className="text-sm font-semibold text-navy">Número</Text>
                    <TextInput className={inputClass} value={cteNumber} placeholder="123456" placeholderTextColor="#93a0bb" onChangeText={setCteNumber} />
                    <Text className="text-sm font-semibold text-navy">Data de emissão</Text>
                    <DatePicker value={cteDate} placeholder="Data de emissão" onChange={setCteDate} />
                    <Action label="Registrar CT-e" onPress={() => void registerCte()} />
                  </>
                )}
              </Card>

              <Card title="Foto do caminhão carregado">
                {foto?.content ? (
                  <>
                    <Image source={{ uri: foto.content }} className="h-52 w-full rounded-xl" resizeMode="cover" />
                    <Text className="text-sm text-muted">Anexada em {formatDateTime(foto.received)}.</Text>
                  </>
                ) : (
                  <>
                    {foto ? (
                      <Text className="text-sm text-muted">
                        {foto.name || 'Arquivo'} foi registrado em {formatDateTime(foto.received)} sem a imagem. Envie de novo para exibir.
                      </Text>
                    ) : (
                      <Text className="text-sm text-muted">Comprovante visual do carregamento.</Text>
                    )}
                    {sendingPhoto ? (
                      <Action label="Enviando foto…" onPress={() => undefined} />
                    ) : (
                      <View className="flex-row gap-2">
                        <View className="flex-1">
                          <Action label="Tirar foto" onPress={() => void sendPhoto('camera')} />
                        </View>
                        <View className="flex-1">
                          <Action label="Galeria" onPress={() => void sendPhoto('galeria')} />
                        </View>
                      </View>
                    )}
                  </>
                )}
              </Card>

              <Card title="Descarga">
                {descarga ? (
                  <Text className="text-sm text-muted">Registrada em {formatDateTime(descarga.occurredAt)}.</Text>
                ) : (
                  <>
                    <When value={unloadedAt} min={trip.dateLoad} onChange={setUnloadedAt} />
                    <Action label="Registrar descarga" onPress={() => void registerUnload()} />
                  </>
                )}
              </Card>

              <Card title="Comprovantes originais">
                {comprovantes ? (
                  <Text className="text-sm text-muted">Chegaram em {formatDateTime(comprovantes.received)}.</Text>
                ) : (
                  <>
                    <When value={documentsAt} onChange={setDocumentsAt} />
                    <Action label="Registrar chegada" onPress={() => void onRegisterOriginalDocuments(documentsAt)} />
                  </>
                )}
              </Card>
            </>
          )}
        </ScrollView>
        <Toast notice={notice} onDismiss={onDismissNotice} top={78} />
      </View>
    </Modal>
  );
}



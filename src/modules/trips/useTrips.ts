import { useCallback, useEffect, useMemo, useState } from 'react';
import { type Notice } from '@/components/Toast';
import {
  attachPhoto,
  cancelTrip,
  createTrip,
  getTrip,
  issueCte,
  listClients,
  listDrivers,
  listTrips,
  registerAdvance,
  registerDocuments,
  registerUnload,
  scheduleBalance,
  settleTitle,
  updateTrip,
} from './api';
import { codigoExibido, summarize, todayISO } from './rules';
import type { PapelTitulo, StatusFilter, TripClient, TripDetail, TripDraft, TripDriver, TripListItem } from './types';

export function useTrips(lockedDriverId: string | undefined, ready: boolean) {
  const [search, setSearch] = useState('');
  const [trips, setTrips] = useState<TripListItem[]>([]);
  const [drivers, setDrivers] = useState<TripDriver[]>([]);
  const [driversError, setDriversError] = useState('');
  const [clients, setClients] = useState<TripClient[]>([]);
  const [clientsError, setClientsError] = useState('');
  const [tripOpen, setTripOpen] = useState<TripDetail | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas');
  const [clientFilter, setClientFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const dismissNotice = useCallback(() => setNotice(null), []);
  const lockedDriver = Boolean(lockedDriverId);
  const codigoConsulta = /^V-\d{4}-\d{6}$/i.test(search.trim()) ? search.trim().toUpperCase() : undefined;

  function notify(tone: Notice['tone'], message: string) {
    setNotice({ id: Date.now(), tone, message });
  }

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    let active = true;

    async function loadCatalog() {
      try {
        const tomadores = await listClients(controller.signal);
        if (!active) return;
        setClients(tomadores);
        setClientsError(tomadores.length === 0 ? 'Nenhum cliente cadastrado.' : '');
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        setClients([]);
        setClientsError(err instanceof Error ? err.message : 'Não foi possível carregar os clientes');
      }

      if (lockedDriverId) return;

      try {
        const motoristas = await listDrivers(controller.signal);
        if (!active) return;
        setDrivers(motoristas);
        setDriversError(motoristas.length === 0 ? 'Nenhum motorista cadastrado.' : '');
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        setDrivers([]);
        setDriversError(err instanceof Error ? err.message : 'Não foi possível carregar os motoristas');
      }
    }

    void loadCatalog();
    return () => {
      active = false;
      controller.abort();
    };
  }, [ready, lockedDriverId]);

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const list = await listTrips(
          {
            status: statusFilter,
            clienteId: clientFilter || undefined,
            motoristaId: lockedDriverId || driverFilter || undefined,
            codigo: codigoConsulta,
          },
          controller.signal
        );
        if (!active) return;
        setTrips(list);
        setError('');
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Não foi possível carregar as viagens');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [ready, statusFilter, clientFilter, driverFilter, codigoConsulta, lockedDriverId]);

  const summary = useMemo(() => summarize(trips, todayISO()), [trips]);

  const visible = useMemo(() => {
    const termo = search.trim().toLocaleLowerCase('pt-BR');
    if (!termo || codigoConsulta) return trips;
    return trips.filter((trip) => {
      const viagem = codigoExibido(trip).toLocaleLowerCase('pt-BR');
      const produto = (trip.product ?? '').toLocaleLowerCase('pt-BR');
      const rota = `${trip.origin} ${trip.destination}`.toLocaleLowerCase('pt-BR');
      return viagem.includes(termo) || produto.includes(termo) || rota.includes(termo);
    });
  }, [trips, search, codigoConsulta]);

  function toListItem(detalhe: TripDetail): TripListItem {
    return {
      _id: detalhe.id,
      clienteId: detalhe.clienteId,
      motoristaId: detalhe.motoristaId,
      vehicleId: detalhe.vehicleId,
      plate: detalhe.plate,
      vehicleModel: detalhe.vehicleModel,
      origin: detalhe.origin,
      destination: detalhe.destination,
      product: detalhe.product,
      load: detalhe.load,
      dateLoad: detalhe.dateLoad,
      dateDischarge: detalhe.dateDischarge,
      status: detalhe.status,
      acordoFreteId: detalhe.acordoFreteId,
      cteId: detalhe.cteId,
      shipping: detalhe.shipping,
      divideShipping: detalhe.divideShipping,
      codigo: detalhe.codigo,
      advancePaidAt: detalhe.advancePaidAt,
      margem: detalhe.margem,
      titles: detalhe.titles,
    };
  }

  function keep(detalhe: TripDetail) {
    const resposta = toListItem(detalhe);
    setTrips((current) => {
      const existe = current.some((trip) => String(trip._id) === detalhe.id);
      const proximos = existe
        ? current.map((trip) => (String(trip._id) === detalhe.id ? resposta : trip))
        : [resposta, ...current];
      return proximos.filter((trip) => {
        if (lockedDriverId && trip.motoristaId !== lockedDriverId) return false;
        if (statusFilter !== 'todas' && trip.status !== statusFilter) return false;
        if (clientFilter && trip.clienteId !== clientFilter) return false;
        if (!lockedDriverId && driverFilter && trip.motoristaId !== driverFilter) return false;
        return true;
      });
    });
    setTripOpen(detalhe);
  }

  function closeModal() {
    setCreateModal(false);
    setEditModal(false);
    setTripOpen(null);
  }

  function draftTrip(trip: TripDetail): TripDraft {
    return {
      clientId: trip.clienteId,
      driverId: trip.motoristaId,
      vehicleId: trip.vehicleId ?? '',
      origin: trip.origin,
      destination: trip.destination,
      product: trip.product,
      weightKg: trip.load,
      loadingDate: trip.dateLoad,
      freightReceivable: trip.margem.freteCliente,
      freightPayable: trip.margem.freteMotorista,
      clientTermDays: trip.acordoFrete.prazoClienteDias,
      driverTermDays: trip.acordoFrete.prazoMotoristaDias,
      divideShipping: trip.divideShipping,
    };
  }

  async function openTrip(id: string) {
    setCreateModal(false);
    try {
      const detalhe = await getTrip(id);
      if (lockedDriverId && detalhe.motoristaId !== lockedDriverId) {
        notify('error', 'Essa viagem não está no seu nome.');
        return;
      }
      keep(detalhe);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível abrir a viagem');
    }
  }

  async function saveTrip(draft: TripDraft) {
    try {
      if (editModal && tripOpen) {
        keep(await updateTrip(tripOpen.id, draft));
        setEditModal(false);
        notify('success', 'Viagem atualizada.');
        return;
      }
      await createTrip(draft);
      setTrips(
        await listTrips({
          status: statusFilter,
          clienteId: clientFilter || undefined,
          motoristaId: lockedDriverId || driverFilter || undefined,
          codigo: codigoConsulta,
        })
      );
      closeModal();
      notify('success', 'Viagem cadastrada com sucesso.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Não foi possível salvar a viagem.');
    }
  }

  async function run(action: () => Promise<TripDetail>, success: string) {
    try {
      keep(await action());
      notify('success', success);
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Não foi possível registrar o evento.');
    }
  }

  return {
    drivers,
    driversError,
    clients,
    clientsError,
    summary,
    tripOpen,
    createModal,
    setCreateModal,
    editModal,
    setEditModal,
    openModal: createModal || tripOpen !== null,
    closeModal,
    statusFilter,
    setStatusFilter,
    clientFilter,
    setClientFilter,
    driverFilter,
    setDriverFilter,
    loading: !ready || loading,
    error,
    openTrip,
    saveTrip,
    issueCte: (id: string, numero: string, emitidoEm: string) =>
      run(() => issueCte(id, numero, emitidoEm), 'CT-e registrado.'),
    sendPhoto: (id: string, nome: string, enviadaEm: string, conteudo: string) =>
      run(() => attachPhoto(id, nome, enviadaEm, conteudo), 'Foto anexada.'),
    unload: (id: string, dataHora: string) => run(() => registerUnload(id, dataHora), 'Descarga registrada com sucesso.'),
    documents: (id: string, dataHora: string) =>
      run(() => registerDocuments(id, dataHora), 'Comprovantes registrados com sucesso.'),
    settle: (id: string, papel: PapelTitulo, occurredAt: string) =>
      run(() => settleTitle(id, papel, occurredAt), 'Lançamento registrado com sucesso.'),
    schedule: (id: string, scheduledAt: string) => run(() => scheduleBalance(id, scheduledAt), 'Saldo programado.'),
    registerAdvance: (id: string, occurredAt: string) =>
      run(() => registerAdvance(id, occurredAt), 'Adiantamento registrado com sucesso.'),
    cancel: (id: string) => run(() => cancelTrip(id), 'Viagem cancelada.'),
    search,
    setSearch,
    visible,
    draftTrip,
    lockedDriver,
    notice,
    dismissNotice,
    notify,
  };
}

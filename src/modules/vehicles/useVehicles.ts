import { useCallback, useEffect, useMemo, useState } from 'react';
import { type Notice } from '@/components/Toast';
import { createVehicle, listVehicles, updateVehicle } from './api';
import type { Vehicle, VehicleFormData, VehicleStatusFilter } from './types';

export function useVehicles(driverId: string | undefined, ready: boolean) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleOpen, setVehicleOpen] = useState<Vehicle | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatusFilter>('todos');
  const [notice, setNotice] = useState<Notice | null>(null);
  const openModal = createModal || vehicleOpen !== null;
  const dismissNotice = useCallback(() => setNotice(null), []);

  function notify(tone: Notice['tone'], message: string) {
    setNotice({ id: Date.now(), tone, message });
  }

  function normalize(vehicle: Vehicle): Vehicle {
    return {
      ...vehicle,
      _id: String(vehicle._id),
      plate: vehicle.plate.trim().toUpperCase(),
      year: Number.isFinite(Number(vehicle.year)) ? Number(vehicle.year) : 0,
      totalLoad: Number.isFinite(Number(vehicle.totalLoad)) ? Number(vehicle.totalLoad) : 0,
      active: vehicle.active !== false,
    };
  }

  useEffect(() => {
    if (!ready) return;

    const controller = new AbortController();
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const list = await listVehicles(controller.signal, driverId);
        if (!active) return;
        setVehicles(list.map(normalize));
        setError('');
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Não foi possível carregar os veículos');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [driverId, ready]);

  const filteredVehicles = useMemo(() => {
    const termo = search.trim().toLocaleLowerCase('pt-BR');

    return vehicles.filter((vehicle) => {
      if (driverId ? vehicle.thirdParty !== true : vehicle.thirdParty) return false;
      if (statusFilter === 'ativos' && vehicle.active === false) return false;
      if (statusFilter === 'inativos' && vehicle.active !== false) return false;
      if (!termo) return true;

      const plate = vehicle.plate.toLocaleLowerCase('pt-BR');
      const model = vehicle.model.toLocaleLowerCase('pt-BR');
      const year = String(vehicle.year);
      const load = String(vehicle.totalLoad);

      return (
        plate.includes(termo) || model.includes(termo) || year.includes(termo) || load.includes(termo)
      );
    });
  }, [vehicles, search, statusFilter, driverId]);

  function closeModal() {
    setCreateModal(false);
    setVehicleOpen(null);
  }

  async function saveVehicle(form: VehicleFormData) {
    const editing = vehicleOpen !== null;
    const controller = new AbortController();
    const payload: VehicleFormData = {
      plate: form.plate.trim().toUpperCase(),
      model: form.model,
      year: form.year,
      totalLoad: form.totalLoad,
      active: form.active,
    };

    try {
      if (vehicleOpen) {
        const updated = await updateVehicle(vehicleOpen._id, controller.signal, payload);
        setVehicles((current) =>
          current.map((vehicle) => (vehicle._id === vehicleOpen._id ? normalize(updated) : vehicle))
        );
      } else {
        const created = await createVehicle(controller.signal, payload);
        setVehicles((current) => [normalize(created), ...current]);
      }

      closeModal();
      notify('success', editing ? 'Veículo atualizado com sucesso.' : 'Veículo criado com sucesso.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Não foi possível salvar o veículo.');
    }
  }

  return {
    vehicles: filteredVehicles,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    setVehicleOpen,
    setCreateModal,
    openModal,
    closeModal,
    createModal,
    vehicleOpen,
    saveVehicle,
    notice,
    dismissNotice,
    loading: !ready || loading,
    error,
    ownFleet: Boolean(driverId),
  };
}

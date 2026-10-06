import { API_URL, readToken } from '@/lib/api';
import type { PapelTitulo, TripClient, TripDetail, TripDraft, TripDriver, TripListItem, TripQuery, TripVehicle } from './types';

const TRIPS_URL = `${API_URL}/api/trips`;
const USERS_URL = `${API_URL}/api/users`;
const CLIENTS_URL = `${API_URL}/api/clients`;
const VEHICLES_URL = `${API_URL}/api/vehicles`;

function authHeaders(): HeadersInit {
  const token = readToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function messageError(response: Response, fallback: string): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === 'object' && 'erro' in data && typeof data.erro === 'string') {
      return data.erro;
    }
  } catch {
    return fallback;
  }
  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function listDrivers(signal: AbortSignal): Promise<TripDriver[]> {
  const response = await fetch(USERS_URL, { signal, headers: authHeaders() });
  if (!response.ok) throw new Error(await messageError(response, 'Não foi possível carregar os motoristas'));
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('Resposta inválida da API de usuários');

  return data.flatMap((item) => {
    if (!isRecord(item) || item.driver !== true || item.active === false) return [];
    if (typeof item._id !== 'string' || typeof item.name !== 'string') return [];
    return [{ id: item._id, name: item.name, thirdParty: item.thirdParty === true }];
  });
}

export async function listClients(signal: AbortSignal): Promise<TripClient[]> {
  const response = await fetch(CLIENTS_URL, { signal, headers: authHeaders() });
  if (!response.ok) throw new Error(await messageError(response, 'Não foi possível carregar os clientes'));
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('Resposta inválida da API de clientes');

  return data.flatMap((item) => {
    if (!isRecord(item) || item.active === false) return [];
    if (typeof item._id !== 'string' || typeof item.corporateName !== 'string') return [];
    return [
      {
        id: item._id,
        corporateName: item.corporateName,
        cnpj: typeof item.cnpj === 'string' ? item.cnpj : '',
        timePeriod: typeof item.timePeriod === 'string' ? item.timePeriod : undefined,
      },
    ];
  });
}

export async function listTripVehicles(
  driverId: string,
  thirdParty: boolean,
  signal?: AbortSignal
): Promise<TripVehicle[]> {
  const url = thirdParty ? `${VEHICLES_URL}?driver=${encodeURIComponent(driverId)}` : VEHICLES_URL;
  const response = await fetch(url, { signal, headers: authHeaders() });
  if (!response.ok) throw new Error(await messageError(response, 'Não foi possível carregar os veículos'));
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('Resposta inválida da API de veículos');

  return data
    .flatMap((item) => {
      if (!isRecord(item) || item.active === false) return [];
      if (thirdParty ? item.thirdParty !== true : item.thirdParty === true) return [];
      if (typeof item._id !== 'string' || typeof item.plate !== 'string' || typeof item.model !== 'string') {
        return [];
      }
      const totalLoad = typeof item.totalLoad === 'number' ? item.totalLoad : Number(item.totalLoad);
      if (!Number.isFinite(totalLoad)) return [];
      return [{ id: item._id, plate: item.plate, model: item.model, totalLoad }];
    })
    .sort((a, b) => a.plate.localeCompare(b.plate, 'pt-BR'));
}

export async function listTrips(filters: TripQuery = {}, signal?: AbortSignal): Promise<TripListItem[]> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'todas') params.set('status', filters.status);
  if (filters.clienteId) params.set('clienteId', filters.clienteId);
  if (filters.motoristaId) params.set('motoristaId', filters.motoristaId);
  if (filters.codigo) params.set('codigo', filters.codigo);
  const query = params.toString();
  const response = await fetch(query ? `${TRIPS_URL}?${query}` : TRIPS_URL, {
    signal,
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error(await messageError(response, 'Não foi possível carregar as viagens'));
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('Resposta inválida da API de viagens');
  return data as TripListItem[];
}

export async function getTrip(id: string, signal?: AbortSignal): Promise<TripDetail> {
  const response = await fetch(`${TRIPS_URL}/${id}`, { signal, headers: authHeaders() });
  if (!response.ok) throw new Error(await messageError(response, 'Não foi possível abrir a viagem'));
  return (await response.json()) as TripDetail;
}

function draftBody(draft: TripDraft) {
  return {
    clienteId: draft.clientId,
    motoristaId: draft.driverId,
    vehicleId: draft.vehicleId,
    origin: draft.origin.trim(),
    destination: draft.destination.trim(),
    product: draft.product.trim(),
    load: draft.weightKg,
    dateLoad: draft.loadingDate,
    shipping: draft.freightReceivable,
    divideShipping: draft.divideShipping,
    acordoFrete: {
      freteCliente: draft.freightReceivable,
      freteMotorista: draft.freightPayable,
      prazoClienteDias: draft.clientTermDays,
      prazoMotoristaDias: draft.driverTermDays,
    },
  };
}

export async function createTrip(draft: TripDraft, signal?: AbortSignal): Promise<void> {
  const response = await fetch(TRIPS_URL, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(draftBody(draft)),
  });
  if (!response.ok) throw new Error(await messageError(response, 'Não foi possível salvar a viagem'));
}

export async function updateTrip(id: string, draft: TripDraft): Promise<TripDetail> {
  const response = await fetch(`${TRIPS_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(draftBody(draft)),
  });
  if (!response.ok) throw new Error(await messageError(response, 'Não foi possível salvar a viagem'));
  return (await response.json()) as TripDetail;
}

async function postEvent(id: string, path: string, body: unknown): Promise<TripDetail> {
  const response = await fetch(`${TRIPS_URL}/${id}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await messageError(response, 'Não foi possível registrar o evento'));
  return (await response.json()) as TripDetail;
}

export function issueCte(id: string, number: string, emitted: string) {
  return postEvent(id, 'cte', { number, emitted });
}

export function attachPhoto(id: string, name: string, received: string, content: string) {
  return postEvent(id, 'foto', { name, content, received });
}

export function registerUnload(id: string, occurredAt: string) {
  return postEvent(id, 'descarga', { occurredAt });
}

export function registerDocuments(id: string, occurredAt: string) {
  return postEvent(id, 'comprovantes', { occurredAt });
}

export function settleTitle(id: string, papel: PapelTitulo, occurredAt: string) {
  return postEvent(id, 'liquidacao', { papel, occurredAt });
}

export function cancelTrip(id: string) {
  return postEvent(id, 'cancelamento', {});
}

export function scheduleBalance(id: string, scheduledAt: string) {
  return postEvent(id, 'programacao', { papel: 'saldo', scheduledAt });
}

export function registerAdvance(id: string, occurredAt: string) {
  return postEvent(id, 'adiantamento', { occurredAt });
}

export type MargemViagem = {
  freteCliente: number;
  freteMotorista: number;
  margemReais: number;
  margemPercentual: number | null;
  negativa: boolean;
};

export const STATUS_TRIP = [
  'AGUARDANDO_CTE',
  'AGUARDANDO_FOTO',
  'CARREGADA',
  'EM_TRANSITO',
  'AGUARDANDO_COMPROVANTE',
  'AGUARDANDO_PAGAMENTO',
  'FINALIZADA',
  'CANCELADA',
] as const;

export type StatusTrip = (typeof STATUS_TRIP)[number];
export type StatusFilter = StatusTrip | 'todas';
export type DivideShipping = '50%' | '70%';
export type NaturesTitles = 'receber' | 'pagar';
export type PapelTitulo = 'cliente' | 'adiantamento' | 'saldo';
export type TypesVoucher = 'FOTO_CARREGAMENTO' | 'ORIGINAIS';
export type TypesEvents = 'emissao_cte' | 'foto_carregamento' | 'descarga' | 'comprovantes_originais';

export type TripTitle = {
  id: string;
  nature: NaturesTitles;
  papel?: PapelTitulo;
  value: number;
  expirationDate: string;
  liqiudateDate?: string;
  scheduledAt?: string;
  bloqueio?: string;
};

export type TripListItem = {
  _id: string;
  clienteId: string;
  motoristaId: string;
  vehicleId?: string;
  plate?: string;
  vehicleModel?: string;
  origin: string;
  destination: string;
  product: string;
  load: number;
  dateLoad: string;
  dateDischarge?: string;
  status: StatusTrip;
  acordoFreteId: string;
  cteId?: string;
  shipping: number;
  divideShipping: DivideShipping;
  codigo?: string;
  advancePaidAt?: string;
  margem: MargemViagem;
  titles: TripTitle[];
};

export type TripDetail = {
  id: string;
  clienteId: string;
  clienteNome: string;
  motoristaId: string;
  motoristaNome: string;
  vehicleId?: string;
  plate?: string;
  vehicleModel?: string;
  origin: string;
  destination: string;
  product: string;
  load: number;
  dateLoad: string;
  dateDischarge?: string;
  status: StatusTrip;
  acordoFreteId: string;
  cteId?: string;
  shipping: number;
  divideShipping: DivideShipping;
  codigo?: string;
  advancePaidAt?: string;
  margem: MargemViagem;
  titles: TripTitle[];
  createdAt: string;
  updatedAt: string;
  acordoFrete: {
    id: string;
    freteCliente: number;
    freteMotorista: number;
    prazoClienteDias: number;
    prazoMotoristaDias: number;
  };
  cte?: {
    id: string;
    number: string;
    emitted: string;
  };
  vouchers: Array<{
    id: string;
    type: TypesVoucher;
    name?: string;
    content?: string;
    received: string;
  }>;
  events: Array<{
    id: string;
    type: TypesEvents;
    occurredAt: string;
    details: Record<string, unknown>;
    createdAt: string;
  }>;
};

export type TripDriver = {
  id: string;
  name: string;
  thirdParty?: boolean;
};

export type TripClient = {
  id: string;
  corporateName: string;
  cnpj: string;
  timePeriod?: string;
};

export type TripVehicle = {
  id: string;
  plate: string;
  model: string;
  totalLoad: number;
};

export type TripDraft = {
  clientId: string;
  driverId: string;
  vehicleId: string;
  origin: string;
  destination: string;
  product: string;
  weightKg: number;
  loadingDate: string;
  freightReceivable: number;
  freightPayable: number;
  clientTermDays: number;
  driverTermDays: number;
  divideShipping: DivideShipping;
};

export type LockedBalance = {
  id: string;
  tripId: string;
  label: string;
  leg: 'A receber' | 'A pagar';
  amount: number;
  reason: string;
};

export type FinanceSummary = {
  payToday: number;
  payOpen: number;
  receiveToday: number;
  receiveOpen: number;
  locked: LockedBalance[];
  lockedTotal: number;
  margin: number;
};

export type TripQuery = {
  status?: StatusFilter;
  clienteId?: string;
  motoristaId?: string;
  codigo?: string;
};

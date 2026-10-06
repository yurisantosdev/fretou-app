export const VEHICLE_TYPES = [
  'Van',
  'VUC',
  'Utilitário',
  'Toco',
  'Truck',
  'Bitruck',
  'Carreta',
  'Cavalo mecânico',
  'Ônibus',
] as const;

export type VehicleTypeName = (typeof VEHICLE_TYPES)[number];

export function isVehicleType(value: string): value is VehicleTypeName {
  return (VEHICLE_TYPES as readonly string[]).includes(value);
}

export type Vehicle = {
  _id: string;
  plate: string;
  model: string;
  year: number;
  totalLoad: number;
  active: boolean;
  thirdParty?: boolean;
};

export type VehicleFormData = {
  plate: string;
  model: string;
  year: number;
  totalLoad: number;
  active: boolean;
};

export type VehicleStatusFilter = 'todos' | 'ativos' | 'inativos';

export function formatLoad(totalLoad: number) {
  return `${new Intl.NumberFormat('pt-BR').format(totalLoad)} kg`;
}

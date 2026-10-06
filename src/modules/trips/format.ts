const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const weight = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 });

export function formatLoad(totalLoad: number) {
  return `${new Intl.NumberFormat('pt-BR').format(totalLoad)} kg`;
}

export function formatCnpj(cnpj?: string) {
  if (!cnpj) return '';
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function formatDate(isoDate?: string): string {
  if (!isoDate) return '—';
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

export function formatDateTime(value?: string): string {
  if (!value) return '—';
  const time = value.split('T')[1]?.slice(0, 5);
  return time ? `${formatDate(value)} ${time}` : formatDate(value);
}

export function formatMoney(value: number): string {
  return money.format(value);
}

export function formatMoneyInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  if (!digits) return '';
  return money.format(Number(digits) / 100);
}

export function parseMoney(value: string): number {
  const digits = value.replace(/\D/g, '');
  if (!digits) return Number.NaN;
  return Number(digits) / 100;
}

export function formatWeight(value: number): string {
  return `${weight.format(value)} kg`;
}

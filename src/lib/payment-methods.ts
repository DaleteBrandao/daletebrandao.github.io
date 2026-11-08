export const PAYMENT_OPTIONS = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao', label: 'Cartão' },
] as const;

export type ActivePaymentMethod = typeof PAYMENT_OPTIONS[number]['value'];

export function isActivePaymentMethod(value: unknown): value is ActivePaymentMethod {
  return PAYMENT_OPTIONS.some(option => option.value === value);
}
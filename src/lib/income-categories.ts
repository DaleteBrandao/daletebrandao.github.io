export const INCOME_CATEGORIES = [
  { value: 'vendas_restaurante', label: 'Vendas Restaurante' },
  { value: 'vendas_ixpressum', label: 'Vendas IXpressum' },
  { value: 'vendas_uber', label: 'Vendas Uber' },
  { value: 'outros', label: 'Outros' },
] as const;

export type IncomeCategory = typeof INCOME_CATEGORIES[number]['value'];

export function incomeDescription(category: IncomeCategory, customDescription: string) {
  return category === 'outros' ? customDescription : INCOME_CATEGORIES.find(item => item.value === category)?.label || '';
}
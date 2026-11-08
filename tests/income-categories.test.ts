import { expect, test } from 'bun:test';
import { incomeDescription } from '../src/lib/income-categories';

test('Uber income uses its own transaction category rather than a custom description', () => {
  expect(incomeDescription('vendas_uber', 'Outra venda')).toBe('Vendas Uber');
});
import { describe, expect, test } from 'bun:test';
import { PAYMENT_OPTIONS, isActivePaymentMethod } from '../src/lib/payment-methods';

describe('payment options', () => {
  test('only Dinheiro and Cartão can be selected', () => {
    expect(PAYMENT_OPTIONS.map(option => option.value)).toEqual(['dinheiro', 'cartao']);
    expect(isActivePaymentMethod('dinheiro')).toBe(true);
    expect(isActivePaymentMethod('cartao')).toBe(true);
  });
  test('PIX cannot be selected', () => { expect(isActivePaymentMethod('pix')).toBe(false); });
  test('Boleto cannot be selected', () => { expect(isActivePaymentMethod('boleto')).toBe(false); });
  test('a payment method is mandatory and IXpressum remains forbidden', () => {
    expect(isActivePaymentMethod(undefined)).toBe(false);
    expect(isActivePaymentMethod('')).toBe(false);
    expect(isActivePaymentMethod('ixpressum')).toBe(false);
  });
});
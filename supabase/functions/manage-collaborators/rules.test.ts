import { describe, expect, test } from 'bun:test';
import { canManageCollaborators, canDeleteTransaction, passwordMatches } from './rules';

describe('collaborator permission rules', () => {
  test('only an active administrator can manage collaborators', () => {
    expect(canManageCollaborators(true, true)).toBe(true);
    expect(canManageCollaborators(false, true)).toBe(false);
    expect(canManageCollaborators(true, false)).toBe(false);
  });
  test('all collaborator jobs use the same collaborator permissions', () => {
    for (const job of ['assistente de sala', 'cozinheiro', 'ajudante de cozinha']) {
      expect(canManageCollaborators(false, true)).toBe(false);
      expect(canDeleteTransaction(false, true, job, 'another-author')).toBe(false);
    }
  });
  test('collaborators can only delete their own operations and inactive accounts cannot delete', () => {
    expect(canDeleteTransaction(false, true, 'quezia-id', 'quezia-id')).toBe(true);
    expect(canDeleteTransaction(false, true, 'quezia-id', 'owner-id')).toBe(false);
    expect(canDeleteTransaction(false, false, 'quezia-id', 'quezia-id')).toBe(false);
    expect(canDeleteTransaction(true, true, 'owner-id', 'quezia-id')).toBe(true);
  });
  test('deletion requires a matching configured server password', () => {
    const configured = 'test-only-secret';
    expect(passwordMatches(configured, configured)).toBe(true);
    expect(passwordMatches('wrong', configured)).toBe(false);
    expect(passwordMatches('', undefined)).toBe(false);
    expect(passwordMatches('test-only-secrex', configured)).toBe(false);
  });
});
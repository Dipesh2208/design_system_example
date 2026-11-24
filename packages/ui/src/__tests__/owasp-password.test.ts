import { describe, it, expect } from 'vitest';
import { validateOwaspPassword } from '../lib/owasp-password';

describe('OWASP Password Validator (UI Package)', () => {
  it('rejects passwords shorter than 10 characters', () => {
    const res = validateOwaspPassword('Aa1!abc');
    expect(res.valid).toBe(false);
    expect(res.rules.minLength).toBe(false);
  });

  it('rejects passwords without uppercase letters', () => {
    const res = validateOwaspPassword('strongpass123!');
    expect(res.valid).toBe(false);
    expect(res.rules.hasUppercase).toBe(false);
  });

  it('rejects passwords without lowercase letters', () => {
    const res = validateOwaspPassword('STRONGPASS123!');
    expect(res.valid).toBe(false);
    expect(res.rules.hasLowercase).toBe(false);
  });

  it('rejects passwords without digits', () => {
    const res = validateOwaspPassword('StrongPassword!');
    expect(res.valid).toBe(false);
    expect(res.rules.hasNumber).toBe(false);
  });

  it('rejects passwords without special symbols', () => {
    const res = validateOwaspPassword('StrongPass12345');
    expect(res.valid).toBe(false);
    expect(res.rules.hasSpecialChar).toBe(false);
  });

  it('rejects common dictionary patterns', () => {
    const res = validateOwaspPassword('Password@12345');
    expect(res.valid).toBe(false);
    expect(res.rules.notCommon).toBe(false);
  });

  it('accepts compliant OWASP password', () => {
    const res = validateOwaspPassword('K9#mQ!xZ89vL');
    expect(res.valid).toBe(true);
    expect(res.score).toBeGreaterThanOrEqual(3);
    expect(res.errors.length).toBe(0);
  });
});

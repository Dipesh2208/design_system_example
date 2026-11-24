/**
 * OWASP ASVS 4.0 Password & Authentication Security Standards
 */

export interface PasswordRuleResult {
  valid: boolean;
  score: number; // 0 to 4
  rules: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    notCommon: boolean;
  };
  errors: string[];
}

const COMMON_PASSWORDS = [
  "password",
  "password123",
  "123456",
  "12345678",
  "123456789",
  "qwerty",
  "admin123",
  "welcome1",
  "letmein",
  "pass1234",
];

export function validateOwaspPassword(password: string): PasswordRuleResult {
  const minLength = password.length >= 10 && password.length <= 128;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const lowerPwd = password.toLowerCase();
  const notCommon = !COMMON_PASSWORDS.some(
    (common) => lowerPwd === common || lowerPwd.includes(common),
  );

  const rules = {
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    notCommon,
  };

  const errors: string[] = [];
  if (!minLength)
    errors.push("Password must be between 10 and 128 characters.");
  if (!hasUppercase)
    errors.push("Must include at least one uppercase letter (A-Z).");
  if (!hasLowercase)
    errors.push("Must include at least one lowercase letter (a-z).");
  if (!hasNumber) errors.push("Must include at least one digit (0-9).");
  if (!hasSpecialChar)
    errors.push("Must include at least one special character (!@#$%^&*...).");
  if (!notCommon)
    errors.push(
      "Password contains easily guessable words or repetitive patterns.",
    );

  let score = 0;
  if (password.length >= 10) score += 1;
  if (hasUppercase && hasLowercase) score += 1;
  if (hasNumber && hasSpecialChar) score += 1;
  if (password.length >= 12 && notCommon) score += 1;

  const valid = Object.values(rules).every(Boolean);

  return {
    valid,
    score,
    rules,
    errors,
  };
}

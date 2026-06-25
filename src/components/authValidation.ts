import { z } from "zod";

/* ------------------------------------------------------------------ *
 * Password policy + rules
 * ------------------------------------------------------------------ */

export type PasswordPolicy = {
  /** Minimum total length. */
  minLength?: number;
  /** Minimum number of uppercase letters. */
  uppercase?: number;
  /** Minimum number of digits. */
  numbers?: number;
  /** Minimum number of symbols (non-alphanumeric characters). */
  symbols?: number;
  /** Extra custom rules appended to the built-in ones. */
  extra?: PasswordRule[];
};

export type PasswordRule = {
  label: string;
  test: (value: string) => boolean;
};

const DEFAULT_POLICY: Required<Omit<PasswordPolicy, "extra">> = {
  minLength: 8,
  uppercase: 1,
  numbers: 1,
  symbols: 1,
};

const countMatches = (value: string, pattern: RegExp) =>
  (value.match(pattern) ?? []).length;

const pluralize = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;

/** Single source of truth for both the checklist UI and submit-time validation. */
export function buildPasswordRules(policy: PasswordPolicy = {}): PasswordRule[] {
  const { minLength, uppercase, numbers, symbols } = {
    ...DEFAULT_POLICY,
    ...policy,
  };

  return [
    {
      label: `${uppercase} uppercase`,
      test: (value) => countMatches(value, /[A-Z]/g) >= uppercase,
    },
    {
      label: pluralize(numbers, "number"),
      test: (value) => countMatches(value, /\d/g) >= numbers,
    },
    {
      label: `${minLength}+ characters`,
      test: (value) => value.length >= minLength,
    },
    {
      label: pluralize(symbols, "symbol"),
      test: (value) => countMatches(value, /[^A-Za-z0-9]/g) >= symbols,
    },
    ...(policy.extra ?? []),
  ];
}

export const passwordMeetsAll = (value: string, policy?: PasswordPolicy) =>
  buildPasswordRules(policy).every((rule) => rule.test(value));

/* ------------------------------------------------------------------ *
 * Zod schema
 * ------------------------------------------------------------------ */

/** Build an email + password + confirm schema bound to a password policy. */
export function buildAuthSchema(policy?: PasswordPolicy) {
  return z
    .object({
      email: z
        .string()
        .min(1, "Email is required")
        .pipe(z.email("Enter a valid email address")),
      password: z
        .string()
        .min(1, "Password is required")
        .refine((value) => passwordMeetsAll(value, policy), {
          message: "Password does not meet the requirements",
        }),
      confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    });
}

export const authSchema = buildAuthSchema();
export type AuthValues = z.infer<typeof authSchema>;

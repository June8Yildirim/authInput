import { useId, useState } from "react";
import { buildPasswordRules, type PasswordPolicy } from "./authValidation";

/* ------------------------------------------------------------------ *
 * Password checklist
 * ------------------------------------------------------------------ */

function CheckIcon({ done }: { done: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 transition-colors ${
        done ? "text-emerald-400" : "text-gray-600"
      }`}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-10.7a1 1 0 010 1.4l-4 4a1 1 0 01-1.4 0l-2-2a1 1 0 011.4-1.4L9 10.6l3.3-3.3a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ThumbsUp({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
    </svg>
  );
}

function StrengthSvg({ className, d }: { className: string; d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}

function XCircle({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <StrengthSvg
      className={className}
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
    />
  );
}

function WarningTriangle({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <StrengthSvg
      className={className}
      d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
    />
  );
}

function CheckCircle({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <StrengthSvg
      className={className}
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
    />
  );
}

export function PasswordChecklist({
  value,
  policy,
  usage,
}: {
  value: string;
  policy?: PasswordPolicy;
  usage?: AuthUsage; // "signin" | "signup"
}) {
  const rules = buildPasswordRules(policy);
  const results = rules.map((rule) => rule.test(value));
  const passedCount = results.filter(Boolean).length;

  // Strength label + color by how many rules pass (index 0 = nothing yet).
  const STRENGTH = [
    { icon: XCircle, msg: "", clr: "transparent" },
    { icon: XCircle, msg: "Weak", clr: "#ef4444" }, // red-500
    { icon: WarningTriangle, msg: "Fair", clr: "#f97316" }, // orange-500
    { icon: CheckCircle, msg: "Good", clr: "#eab308" }, // yellow-500
    { icon: ThumbsUp, msg: "Strong", clr: "#22c55e" }, // green-500
  ];
  const level = Math.min(passedCount, STRENGTH.length - 1);
  const strength = STRENGTH[level];
  const StrengthIcon = strength.icon;

  return (
    <div className="flex flex-col gap-2 w-full">
      {usage === "signup" && (
        <div className="flex flex-row items-center gap-2">
          {rules.map((rule, i) => (
            <div
              key={rule.label}
              className="h-2 flex-1 rounded-full transition-colors"
              style={{
                backgroundColor: i < passedCount ? strength.clr : "#4b5563",
              }}
            />
          ))}
          {passedCount > 0 && (
            <p
              className="m-0 flex items-center gap-1 text-sm font-medium transition-colors"
              style={{ color: strength.clr }}
            >
              {/* <StrengthIcon className="h-4 w-4" /> */}
              {strength.msg}
            </p>
          )}
        </div>
      )}
      <div className="flex flex-row justify-between items-center w-full">
        <ul
          aria-label="Password requirements"
          className="grid grid-cols-2 gap-x-4 gap-y-2 w-11/12 m-0 list-none p-0"
        >
          {rules.map((rule, i) => {
            const done = results[i];
            return (
              <li key={rule.label} className="flex items-center gap-2 text-sm">
                <CheckIcon done={done} />
                <span
                  className={`transition-colors ${
                    done ? "text-emerald-400" : "text-gray-400"
                  }`}
                >
                  {rule.label}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-col w-1/12 overflow-hidden">
          <div
            key={level}
            className="flex motion-safe:animate-[strength-pop_0.28s_ease-out]"
            style={{ color: strength.clr }}
          >
            <StrengthIcon className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * AuthInput
 * ------------------------------------------------------------------ */

export type AuthVariant = "email" | "password" | "text";
export type AuthUsage = "signup" | "signin";

// Any native <input> attribute (placeholder, disabled, required, maxLength,
// onFocus, inputMode, …) can be passed through, except the ones we control.
type NativeInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "value" | "onChange" | "type" | "name" | "id" | "className" | "autoComplete"
>;

export type AuthInputProps = NativeInputProps & {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  variant?: AuthVariant;
  usage?: AuthUsage;
  /** Show the live password requirements checklist. Defaults to true for a signup password field. */
  showRequirements?: boolean;
  error?: string;
  type?: string;
  autoComplete?: string;
  /** Visually hide the label while keeping it for screen readers. */
  hideLabel?: boolean;
  /** Hint shown under the input when there is no error. */
  helperText?: React.ReactNode;
  /** Customize the password checklist requirements (used when the checklist is shown). */
  passwordPolicy?: PasswordPolicy;
  inputStyle?: string;
  labelStyle?: string;
  containerStyle?: string;
};

const DEFAULT_TYPE: Record<AuthVariant, string> = {
  email: "email",
  password: "password",
  text: "text",
};

function defaultAutoComplete(variant: AuthVariant, usage: AuthUsage): string {
  if (variant === "email") return "email";
  if (variant === "password")
    return usage === "signup" ? "new-password" : "current-password";
  return "off";
}

const cx = (...classes: (string | false | undefined)[]) =>
  classes.filter(Boolean).join(" ");

export default function AuthInput({
  label,
  name,
  value,
  onChange,
  variant = "text",
  usage = "signin",
  showRequirements,
  error,
  type,
  autoComplete,
  hideLabel = false,
  helperText,
  passwordPolicy,
  labelStyle = "text-sm font-semibold",
  inputStyle = "rounded-lg border border-solid border-gray-500/40 bg-transparent px-3 py-2 text-base text-inherit outline-none transition-colors focus:border-violet-500 aria-invalid:border-red-500",
  containerStyle = "flex flex-col gap-1.5",
  onFocus,
  onBlur,
  ...inputProps
}: AuthInputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-help`;
  const hasError = Boolean(error);
  const [focused, setFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(e);
  };

  // Signup password fields show the live checklist by default; callers can opt out
  // (e.g. the "confirm password" field) by passing showRequirements={false}.
  const requirements =
    showRequirements ?? (variant === "password" && usage === "signup");

  // Reveal the checklist while the field is focused or already has content.
  const showChecklist = requirements && (focused || value.length > 0);

  const resolvedType = type ?? DEFAULT_TYPE[variant];
  const resolvedAutoComplete =
    autoComplete ?? defaultAutoComplete(variant, usage);

  const showHelper = Boolean(helperText) && !hasError && !requirements;
  const describedBy =
    cx(hasError && errorId, showHelper && helperId) || undefined;

  return (
    <div className={containerStyle} data-focused={focused || undefined}>
      <label htmlFor={id} className={hideLabel ? "sr-only" : labelStyle}>
        {label}
      </label>
      <input
        {...inputProps}
        id={id}
        name={name}
        type={resolvedType}
        value={value}
        autoComplete={resolvedAutoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={inputStyle}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
      />
      {showChecklist && (
        <PasswordChecklist
          usage={usage}
          value={value}
          policy={passwordPolicy}
        />
      )}
      {hasError && !requirements && (
        <p id={errorId} role="alert" className="m-0 text-sm text-red-500">
          {error}
        </p>
      )}
      {showHelper && (
        <p id={helperId} className="m-0 text-sm text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

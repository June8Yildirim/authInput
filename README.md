# AuthInput

A controlled, accessible auth input for React. It adapts to the field type
(`variant`) and the form mode (`usage`), derives sensible `type`/`autoComplete`
defaults, and — for signup password fields — renders a live requirements
checklist with a strength meter and an animated strength icon.

- **Component:** `src/components/AuthInput.tsx`
- **Validation/schema:** `src/components/authValidation.ts`

## Requirements

| Dependency   | Used for                                                   |
| ------------ | ---------------------------------------------------------- |
| React 19     | the component (`useId`, `useState`, `useRef`, `useEffect`) |
| Zod v4       | `buildAuthSchema` / `authSchema`                           |
| Tailwind CSS | all styling is utility classes (`sr-only`, colors, layout) |

> The component is presentational via Tailwind class names. In a project
> without Tailwind, pass your own classes through `inputStyle` / `labelStyle` /
> `containerStyle`, or port the defaults to your styling system.

## Quick start

`AuthInput` is **controlled** — you own the value and validation. Pair it with
the exported Zod schema:

```tsx
import { useState } from "react";
import AuthInput from "./components/AuthInput";
import { authSchema, type AuthValues } from "./components/authValidation";

type Errors = Partial<Record<keyof AuthValues, string>>;
const EMPTY: AuthValues = { email: "", password: "", confirmPassword: "" };

function validate(values: AuthValues): Errors {
  const result = authSchema.safeParse(values);
  if (result.success) return {};
  const errors: Errors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof AuthValues;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export function SignupForm() {
  const [values, setValues] = useState<AuthValues>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  const setField = (field: keyof AuthValues) => (value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    setErrors(validate(next));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate(values);
    setErrors(next);
    if (Object.keys(next).length === 0) {
      // submit values.email / values.password
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <AuthInput
        label="Email"
        name="email"
        variant="email"
        value={values.email}
        error={errors.email}
        onChange={setField("email")}
      />
      <AuthInput
        label="Password"
        name="password"
        variant="password"
        usage="signup"
        value={values.password}
        onChange={setField("password")}
      />
      <AuthInput
        label="Confirm password"
        name="confirmPassword"
        variant="password"
        usage="signup"
        showRequirements={false}
        value={values.confirmPassword}
        error={errors.confirmPassword}
        onChange={setField("confirmPassword")}
      />
      <button type="submit">Sign up</button>
    </form>
  );
}
```

## Props

In addition to the props below, **any native `<input>` attribute**
(`placeholder`, `disabled`, `required`, `autoFocus`, `maxLength`, `inputMode`,
`onFocus`, `onBlur`, data-attributes, …) is forwarded to the underlying input.
The controlled/derived ones — `value`, `onChange`, `type`, `name`, `id`,
`className`, `autoComplete` — are managed by the component and not overridable
via the native passthrough (use the dedicated props instead).

| Prop               | Type                              | Default                            | Description                                                           |
| ------------------ | --------------------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| `label`            | `string`                          | —                                  | **Required.** Field label (also used by screen readers).              |
| `name`             | `string`                          | —                                  | **Required.** Input `name`.                                           |
| `value`            | `string`                          | —                                  | **Required.** Controlled value.                                       |
| `onChange`         | `(value: string) => void`         | —                                  | **Required.** Receives the new string value (not the event).          |
| `variant`          | `"email" \| "password" \| "text"` | `"text"`                           | Drives the derived `type` and `autoComplete`.                         |
| `usage`            | `"signup" \| "signin"`            | `"signin"`                         | Form mode; affects password `autoComplete` and the checklist default. |
| `showRequirements` | `boolean`                         | `true` for a signup password field | Force the requirements checklist on/off.                              |
| `error`            | `string`                          | —                                  | Error message; sets `aria-invalid` and renders below the input.       |
| `helperText`       | `React.ReactNode`                 | —                                  | Hint shown below the input when there's no error.                     |
| `hideLabel`        | `boolean`                         | `false`                            | Visually hide the label (kept for screen readers via `sr-only`).      |
| `passwordPolicy`   | `PasswordPolicy`                  | defaults                           | Customize the checklist requirements.                                 |
| `type`             | `string`                          | derived from `variant`             | Override the input type.                                              |
| `autoComplete`     | `string`                          | derived from `variant`+`usage`     | Override autocomplete.                                                |
| `inputStyle`       | `string`                          | Tailwind default                   | `className` for the `<input>`.                                        |
| `labelStyle`       | `string`                          | `"text-sm font-semibold"`          | `className` for the `<label>`.                                        |
| `containerStyle`   | `string`                          | `"flex flex-col gap-1.5"`          | `className` for the wrapper `<div>`.                                  |

### Derived defaults

If you don't pass `type` / `autoComplete`, they're inferred:

| `variant`                     | `type`     | `autoComplete`     |
| ----------------------------- | ---------- | ------------------ |
| `email`                       | `email`    | `email`            |
| `password` (`usage="signup"`) | `password` | `new-password`     |
| `password` (`usage="signin"`) | `password` | `current-password` |
| `text`                        | `text`     | `off`              |

## Behavior

- **Focus tracking.** The wrapper gets `data-focused` while the input is
  focused (style it with `data-[focused]:…`). Your own `onFocus`/`onBlur` are
  still called.
- **Checklist visibility.** The password checklist appears only when
  requirements are on **and** the field is focused or already has content
  ("while typing"). It does not show on a pristine, unfocused field.
- **Strength meter.** Bars fill left-to-right by how many rules pass, tinted by
  strength (red → orange → yellow → green), with a label and an icon that
  animates as the level changes.
- **Confirm-password fields.** Pass `showRequirements={false}` so the checklist
  doesn't also render under the confirmation field; keep `error` for the
  "passwords do not match" message.

## Password policy & validation

Both the checklist UI and the Zod schema are driven by the same
`PasswordPolicy`, so they never disagree.

```ts
type PasswordPolicy = {
  minLength?: number; // default 8
  uppercase?: number; // default 1
  numbers?: number; // default 1
  symbols?: number; // default 1
  extra?: PasswordRule[]; // custom rules appended to the built-ins
};
```

Customize counts per field, and use the same policy for submit validation:

```tsx
import {
  buildAuthSchema,
  type PasswordPolicy,
} from "./components/authValidation";

const POLICY: PasswordPolicy = { minLength: 12, uppercase: 2, symbols: 2 };
const schema = buildAuthSchema(POLICY);

<AuthInput
  variant="password"
  usage="signup"
  passwordPolicy={POLICY}
  /* …controlled props… */
/>;
```

Add brand-new rules without touching internals via `extra`:

```tsx
passwordPolicy={{
  extra: [
    { label: "no spaces", test: (v) => !/\s/.test(v) },
    { label: "1 lowercase", test: (v) => /[a-z]/.test(v) },
  ],
}}
```

### Validation helpers (`authValidation.ts`)

| Export                           | Signature                     | Description                                                     |
| -------------------------------- | ----------------------------- | --------------------------------------------------------------- |
| `authSchema`                     | `ZodType`                     | Default-policy schema (`email`, `password`, `confirmPassword`). |
| `buildAuthSchema`                | `(policy?) => ZodType`        | Schema bound to a custom policy.                                |
| `AuthValues`                     | type                          | `z.infer<typeof authSchema>`.                                   |
| `buildPasswordRules`             | `(policy?) => PasswordRule[]` | The rule list (labels + tests).                                 |
| `passwordMeetsAll`               | `(value, policy?) => boolean` | True when every rule passes.                                    |
| `PasswordPolicy`, `PasswordRule` | types                         | —                                                               |

## Styling slots

Override any of the three class slots to restyle without forking the component:

```tsx
<AuthInput
  containerStyle="flex flex-col gap-2"
  labelStyle="text-xs uppercase tracking-wide text-gray-400"
  inputStyle="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500"
  /* … */
/>
```

## Accessibility

- `<label htmlFor>` is wired to the input `id` (auto-generated via `useId`).
- `aria-invalid` is set when `error` is present; the error has `role="alert"`.
- `aria-describedby` points to the active error or helper text.
- `hideLabel` keeps the label available to screen readers (`sr-only`).

## Exports

```ts
// AuthInput.tsx
export default AuthInput;
export { PasswordChecklist };
export type { AuthInputProps, AuthVariant, AuthUsage };

// authValidation.ts
export { authSchema, buildAuthSchema, buildPasswordRules, passwordMeetsAll };
export type { AuthValues, PasswordPolicy, PasswordRule };
```

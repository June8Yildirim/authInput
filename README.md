# @cuneytyildirim/auth_input

A controlled, accessible React auth input (`AuthInput`) with a live password
requirements checklist, a strength meter, and a matching Zod schema for
submit-time validation.

Full usage, props, and customization:

- **[Full documentation](https://github.com/June8Yildirim/authInput/blob/main/src/components/AuthInput.md)**
- **[Component source](https://github.com/June8Yildirim/authInput/blob/main/src/components/AuthInput.tsx)**
- **[Validation / schema](https://github.com/June8Yildirim/authInput/blob/main/src/components/authValidation.ts)**
- **[Repository](https://github.com/June8Yildirim/authInput)**

## Install

```sh
npm install @cuneytyildirim/auth_input
```

Peer dependencies: **React ≥ 18** and **Zod ^4**.

## Usage

Import the component and the precompiled stylesheet once:

```tsx
import { AuthInput, authSchema, type AuthValues } from "@cuneytyildirim/auth_input";
import "@cuneytyildirim/auth_input/styles.css";
```

The shipped CSS contains only the styles the component needs (no global reset),
so it won't affect the rest of your app. Tailwind is **not** required in the
consuming project — it's only used to build this package.

## Exports

```ts
import {
  AuthInput, // default UI component
  PasswordChecklist, // standalone checklist
  authSchema, // Zod schema (email + password + confirm)
  buildAuthSchema, // (policy?) => schema bound to a custom policy
  buildPasswordRules, // (policy?) => rule list
  passwordMeetsAll, // (value, policy?) => boolean
} from "@cuneytyildirim/auth_input";

import type {
  AuthInputProps,
  AuthVariant,
  AuthUsage,
  AuthValues,
  PasswordPolicy,
  PasswordRule,
} from "@cuneytyildirim/auth_input";
```

## Scripts

- `npm run build` — bundle with tsup (ESM + CJS + `.d.ts`) and compile the CSS
- `npm run typecheck` — `tsc -b`
- `npm run lint` — ESLint

## License

MIT — see [LICENSE](LICENSE).

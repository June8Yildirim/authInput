// Package barrel: re-exports the component together with its schema/rule helpers.
export { default as AuthInput, PasswordChecklist } from "./components/AuthInput";
export type {
  AuthInputProps,
  AuthVariant,
  AuthUsage,
} from "./components/AuthInput";
export {
  authSchema,
  buildAuthSchema,
  buildPasswordRules,
  passwordMeetsAll,
} from "./components/authValidation";
export type {
  AuthValues,
  PasswordPolicy,
  PasswordRule,
} from "./components/authValidation";

import { useState } from "react";
import AuthInput from "./components/AuthInput";
import { authSchema, type AuthValues } from "./components/authValidation";
import "./App.css";

type Fields = AuthValues;
type Errors = Partial<Record<keyof Fields, string>>;

function validate(values: Fields): Errors {
  const result = authSchema.safeParse(values);
  if (result.success) return {};

  const errors: Errors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof Fields;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

const EMPTY: Fields = { email: "", password: "", confirmPassword: "" };

function App() {
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof Fields, boolean>>
  >({});
  const [submitted, setSubmitted] = useState(false);

  const setField = (field: keyof Fields) => (value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field] || submitted) setErrors(validate(next));
  };

  const blur = (field: keyof Fields) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(values));
  };

  const errorFor = (field: keyof Fields) =>
    touched[field] || submitted ? errors[field] : undefined;

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmitted(true);
    if (Object.keys(nextErrors).length === 0) {
      console.log("Submitted:", {
        email: values.email,
        password: values.password,
      });
      setValues(EMPTY);
      setTouched({});
      setSubmitted(false);
    }
  };

  return (
    <section id="center">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto flex w-full max-w-sm flex-col gap-5 rounded-xl border border-gray-500/25 bg-white/5 p-8 text-left"
      >
        <h2 className="m-0 text-2xl font-medium">Create your account</h2>

        <AuthInput
          label="Email"
          name="email"
          variant="email"
          value={values.email}
          error={errorFor("email")}
          onChange={setField("email")}
          onBlur={blur("email")}
        />
        <AuthInput
          label="Password"
          name="password"
          variant="password"
          value={values.password}
          onChange={setField("password")}
          onBlur={blur("password")}
        />
        <AuthInput
          label="Confirm password"
          name="confirmPassword"
          variant="password"
          usage="signup"
          showRequirements={false}
          value={values.confirmPassword}
          error={errorFor("confirmPassword")}
          onChange={setField("confirmPassword")}
          onBlur={blur("confirmPassword")}
        />
        <AuthInput
          label="Sign Up Button"
          name="Sign Up Button"
          variant="password"
          usage="signup"
          value={values.password}
          onChange={setField("password")}
          onBlur={blur("password")}
        />

        <button
          type="submit"
          className="cursor-pointer rounded-lg border-none bg-violet-500 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-violet-600"
        >
          Sign up
        </button>
      </form>
    </section>
  );
}

export default App;

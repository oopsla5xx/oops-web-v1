"use client";

import { Form } from "@base-ui/react/form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/features/auth/useRegister";
import { registerRequestSchema } from "@/schemas/auth.schema";
import type { ErrorCode } from "@/constants/error-codes";
import type { ZodType } from "zod";

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

function requiredValidate(value: unknown, t: (key: string) => string) {
  return String(value ?? "").length > 0 ? null : t("requiredField");
}

export function RegisterForm() {
  const t = useTranslations("register");
  const tErrors = useTranslations("errors");
  const { status, fieldError, register } = useRegister();

  const serverErrors = fieldError
    ? { [fieldError.field]: tErrors(fieldError.code as ErrorCode) }
    : undefined;

  function zodFieldValidate(schema: ZodType, errorCode: ErrorCode) {
    return (value: unknown) => {
      const required = requiredValidate(value, t);
      if (required) return required;
      return schema.safeParse(value).success ? null : tErrors(errorCode);
    };
  }

  const validateUsername = zodFieldValidate(
    registerRequestSchema.shape.username,
    "INVALID_USERNAME_FORMAT",
  );
  const validateEmail = zodFieldValidate(registerRequestSchema.shape.email, "INVALID_EMAIL_FORMAT");
  const validatePassword = zodFieldValidate(
    registerRequestSchema.shape.password,
    "PASSWORD_TOO_WEAK",
  );

  function validateConfirmPassword(value: unknown, formValues: Record<string, unknown>) {
    const required = requiredValidate(value, t);
    if (required) return required;
    return value === formValues.password ? null : t("passwordMismatch");
  }

  async function handleSubmit(values: Record<string, unknown>) {
    const formValues = values as unknown as RegisterFormValues;
    const result = await register({
      username: formValues.username,
      email: formValues.email,
      password: formValues.password,
    });

    if (result.success) {
      toast.success(t("success"));
      return;
    }
    if (!result.fieldError) {
      toast.error(tErrors(result.errorCode));
    }
  }

  return (
    <Form
      className="flex flex-col gap-4"
      errors={serverErrors}
      onFormSubmit={handleSubmit}
      noValidate
    >
      <Field name="username" validate={validateUsername}>
        <FieldLabel>{t("username")}</FieldLabel>
        <Input autoComplete="username" />
        <FieldError />
      </Field>

      <Field name="email" validate={validateEmail}>
        <FieldLabel>{t("email")}</FieldLabel>
        <Input type="email" autoComplete="email" placeholder="you@example.com" />
        <FieldError />
      </Field>

      <Field name="password" validate={validatePassword}>
        <FieldLabel>{t("password")}</FieldLabel>
        <Input type="password" autoComplete="new-password" placeholder="••••••••" />
        <FieldError />
      </Field>

      <Field name="confirm_password" validate={validateConfirmPassword}>
        <FieldLabel>{t("confirmPassword")}</FieldLabel>
        <Input type="password" autoComplete="new-password" placeholder="••••••••" />
        <FieldError />
      </Field>

      <Button className="w-full" size="lg" type="submit" disabled={status === "loading"}>
        {status === "loading" ? t("submitting") : t("submit")}
      </Button>
    </Form>
  );
}

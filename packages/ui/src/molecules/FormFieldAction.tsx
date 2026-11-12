import * as React from "react";
import { cn } from "../lib/utils";
import { AppInput, type AppInputProps } from "../atoms/AppInput";
import { AppButton, type AppButtonProps } from "../atoms/AppButton";

/**
 * FormFieldAction (Stateless Molecule)
 * Combines AppInput and AppButton atoms.
 * 100% Stateless: value, onChange, onSubmit, and loading are all passed via props.
 */

export interface FormFieldActionProps {
  className?: string;
  id?: string;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  inputValue: string;
  inputPlaceholder?: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitButtonText?: string;
  submitButtonVariant?: AppButtonProps["variant"];
  isLoading?: boolean;
  loadingText?: string;
  buttonIcon?: React.ReactNode;
  disabled?: boolean;
}

export const FormFieldAction = React.forwardRef<HTMLFormElement, FormFieldActionProps>(
  (
    {
      className,
      id,
      label,
      helperText,
      errorMessage,
      successMessage,
      inputValue,
      inputPlaceholder,
      onInputChange,
      onSubmit,
      submitButtonText = "Submit",
      submitButtonVariant = "primary",
      isLoading = false,
      loadingText = "Submitting...",
      buttonIcon,
      disabled = false,
    },
    ref
  ) => {
    return (
      <form
        ref={ref}
        onSubmit={onSubmit}
        className={cn("p-4 rounded-xl bg-secondary/50 border border-border space-y-3", className)}
      >
        {label && (
          <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-foreground">
            {label}
          </label>
        )}

        <div className="flex flex-col @md:flex-row gap-2.5">
          <AppInput
            id={id}
            value={inputValue}
            onChange={onInputChange}
            placeholder={inputPlaceholder}
            disabled={disabled || isLoading}
            className="flex-1"
          />
          <AppButton
            type="submit"
            variant={submitButtonVariant}
            isLoading={isLoading}
            loadingText={loadingText}
            rightIcon={buttonIcon}
            disabled={disabled}
          >
            {submitButtonText}
          </AppButton>
        </div>

        {helperText && !errorMessage && !successMessage && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
        {errorMessage && (
          <p className="text-xs text-destructive font-medium">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {successMessage}
          </p>
        )}
      </form>
    );
  }
);

FormFieldAction.displayName = "FormFieldAction";

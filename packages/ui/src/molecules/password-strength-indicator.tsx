import React from "react";
import { Check, X, Shield } from "lucide-react";
import { PasswordRuleResult } from "../lib/owasp-password";

interface PasswordStrengthIndicatorProps {
  result: PasswordRuleResult;
  showRules?: boolean;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ result, showRules = true, className = "" }) => {
  const { score, rules } = result;

  const strengthLabels = [
    "Very Weak",
    "Weak",
    "Moderate",
    "Strong",
    "Very Strong",
  ];
  const strengthColors = [
    "bg-rose-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-teal-500",
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      <div>
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          <span className="text-muted-foreground flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> OWASP Standard Strength:
          </span>
          <span
            className={`font-semibold ${score >= 3 ? "text-emerald-500" : "text-muted-foreground"}`}
          >
            {strengthLabels[score]}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 h-1.5 rounded-full overflow-hidden bg-muted">
          {[0, 1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-full transition-all duration-300 ${
                score > step ? strengthColors[score] : "bg-transparent"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Rules Checklist */}
      {showRules && (
        <div className="bg-muted/40 p-3 rounded-xl border border-border text-xs space-y-1.5">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
            OWASP Password Criteria
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <RuleItem label="Minimum 10 characters" passed={rules.minLength} />
            <RuleItem
              label="Uppercase letter (A-Z)"
              passed={rules.hasUppercase}
            />
            <RuleItem
              label="Lowercase letter (a-z)"
              passed={rules.hasLowercase}
            />
            <RuleItem label="Numeric digit (0-9)" passed={rules.hasNumber} />
            <RuleItem
              label="Special symbol (!@#$%...)"
              passed={rules.hasSpecialChar}
            />
            <RuleItem
              label="No predictable patterns"
              passed={rules.notCommon}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const RuleItem: React.FC<{ label: string; passed: boolean }> = ({
  label,
  passed,
}) => (
  <div className="flex items-center gap-1.5">
    {passed ? (
      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
    ) : (
      <X className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
    )}
    <span
      className={
        passed ? "text-foreground font-medium" : "text-muted-foreground"
      }
    >
      {label}
    </span>
  </div>
);

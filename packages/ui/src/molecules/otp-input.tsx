import React, { useRef } from "react";
import { AlertCircle, Clock, RefreshCw } from "lucide-react";

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  disabled?: boolean;
  timeLeftSeconds: number; // 15 mins countdown
  onResend: () => void;
  requireResend?: boolean;
  failedCount?: number;
  maxAttemptsCycle?: number;
  errorMessage?: string;
  className?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 4,
  disabled = false,
  timeLeftSeconds,
  onResend,
  requireResend = false,
  failedCount = 0,
  maxAttemptsCycle = 5,
  errorMessage,
  className = "",
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Format mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const isExpired = timeLeftSeconds <= 0;

  const handleDigitChange = (index: number, digit: string) => {
    if (disabled || requireResend) return;
    const cleanDigit = digit.replace(/\D/g, "").slice(-1);
    const chars = value.split("");
    chars[index] = cleanDigit;
    const newVal = chars.join("").slice(0, length);
    onChange(newVal);

    if (cleanDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled || requireResend) return;
    const pasted = e.clipboardData
      .getData("text/plain")
      .replace(/\D/g, "")
      .slice(0, length);
    if (pasted) {
      onChange(pasted);
      const nextIndex = Math.min(pasted.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className={`flex flex-col gap-4 w-full max-w-sm mx-auto ${className}`}>
      {/* 4 Digit Boxes - Fully Responsive & Dark Mode Calibrated */}
      <div className="flex justify-center gap-2.5 sm:gap-3.5">
        {Array.from({ length }).map((_, index) => {
          const char = value[index] || "";
          return (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={char}
              disabled={disabled || requireResend}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                requireResend
                  ? "bg-destructive/10 border-destructive/40 text-destructive cursor-not-allowed"
                  : char
                    ? "bg-card text-foreground border-primary ring-2 ring-primary/20 shadow-sm"
                    : "bg-muted/40 text-foreground border-input hover:border-primary/50"
              }`}
            />
          );
        })}
      </div>

      {/* Attempt warning indicator */}
      {failedCount > 0 && !requireResend && (
        <div className="text-center text-xs font-semibold text-amber-600 dark:text-amber-400">
          Attempt {failedCount} of {maxAttemptsCycle} failed.
        </div>
      )}

      {/* Error / Resend alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 15 Minute Timer and Resend Action */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
        <div className="flex items-center gap-1.5 font-mono">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span
            className={
              timeLeftSeconds < 120 ? "text-destructive font-semibold" : ""
            }
          >
            {isExpired
              ? "OTP Expired"
              : `Valid for: ${formatTime(timeLeftSeconds)}`}
          </span>
        </div>

        <button
          type="button"
          onClick={onResend}
          className="flex items-center gap-1 font-semibold text-primary hover:underline transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Resend OTP</span>
        </button>
      </div>
    </div>
  );
};

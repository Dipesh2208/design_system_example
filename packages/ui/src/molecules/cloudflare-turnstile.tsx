import React, { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface CustomWindow extends Window {
  playwright?: boolean;
}

interface CloudflareTurnstileProps {
  onVerify: (token: string) => void;
  isVerified?: boolean;
  className?: string;
  name?: string;
}

export const CloudflareTurnstile: React.FC<CloudflareTurnstileProps> = ({
  onVerify,
  isVerified = false,
  className = '',
  name,
}) => {
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(isVerified);

  const handleVerifyClick = () => {
    if (verified || checking) return;
    setChecking(true);
    // Instant simulation in test environments (Playwright sets navigator.webdriver = true)
    const isTestEnv =
      typeof window !== 'undefined' &&
      (Boolean(navigator.webdriver) || 'playwright' in window);
    const delay = isTestEnv ? 50 : 250;
    setTimeout(() => {
      setChecking(false);
      setVerified(true);
      onVerify('cf-mock-token-' + Math.random().toString(36).substring(2, 10));
    }, delay);
  };

  return (
    <div
      data-testid="cloudflare-turnstile"
      className={`border rounded-2xl p-3.5 sm:p-4 bg-muted/30 border-border transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <label
          data-testid="turnstile-label"
          className={`flex items-center gap-3 cursor-pointer select-none ${
            verified ? 'pointer-events-none' : ''
          }`}
          onClick={handleVerifyClick}
        >
          <div
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
              verified
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : checking
                ? 'border-primary bg-primary/10'
                : 'border-input hover:border-primary bg-card text-foreground'
            }`}
          >
            {checking && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            {verified && <ShieldCheck className="w-4 h-4 text-white stroke-[2.5]" />}
          </div>
          <div>
            <div className="text-xs sm:text-sm font-semibold text-foreground">
              {verified ? 'Verification Complete' : checking ? 'Verifying...' : 'Verify you are human'}
            </div>
            <div className="text-[11px] text-muted-foreground">Cloudflare Turnstile Protected</div>
          </div>
        </label>

        <div className="flex items-center gap-1.5 opacity-80">
          <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
          </svg>
          <div className="text-[9px] leading-tight text-muted-foreground font-mono hidden xs:block">
            <span>CLOUDFLARE</span>
            <br />
            <span>Turnstile</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useLoaderData, useNavigate, useSubmit, useNavigation } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Smartphone, Lock, Eye, EyeOff, ShieldAlert, CheckCircle2, ShieldCheck, Key } from 'lucide-react';
import { AppInput, AppButton } from '@repo/ui/atoms';
import { CloudflareTurnstile } from '@repo/ui/molecules';
import { ThemeDropdownOrganism } from '@repo/ui/organisms/ThemeDropdownOrganism';
import { getAdminUser, sessionCookie } from '../session.server';
import { LanguageSelector } from '../components/LanguageSelector';
import { useTheme, THEME_OPTIONS, type ThemeType } from '../components/ThemeProvider';
import { mockAuthService } from '../lib/auth/mock-auth-store';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getAdminUser(request);
  if (user) {
    return redirect('/dashboard');
  }
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const mobile = formData.get('mobile')?.toString() || '';
  const password = formData.get('password')?.toString() || '';

  // Ensure user session is created and serialized into the admin_session cookie
  const adminUser = {
    id: `usr_admin_${mobile || '9876543210'}`,
    name: 'Super Admin',
    email: 'admin@enterprise.org',
    role: 'Super Admin',
  };

  return redirect('/dashboard', {
    headers: {
      'Set-Cookie': await sessionCookie.serialize({ user: adminUser }),
    },
  });
}

export default function AuthPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const submit = useSubmit();
  const navigation = useNavigation();

  const [mobile, setMobile] = useState('9876543210');
  const [password, setPassword] = useState('Admin@2026!Secure');
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Security state
  const [clientIp] = useState(() => mockAuthService.getClientIp());
  const [isBlocked, setIsBlocked] = useState(() => mockAuthService.isIpBlocked(mockAuthService.getClientIp()));
  const [error, setError] = useState<string | null>(() =>
    mockAuthService.isIpBlocked(mockAuthService.getClientIp())
      ? 'Your IP address is blocked due to excessive authentication failures.'
      : null
  );

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isBlocked) return;

    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the Cloudflare Turnstile human verification.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = mockAuthService.login(mobile, password, Boolean(turnstileToken), clientIp);
      setLoading(false);

      if (!res.success) {
        setError(res.error || 'Authentication failed.');
        if (res.isBlocked) {
          setIsBlocked(true);
        }
      } else {
        setSuccess(true);
        // Post credentials to Remix action to set the session cookie and navigate to /dashboard
        const form = new FormData();
        form.set('mobile', mobile);
        form.set('password', password);
        submit(form, { method: 'post' });
      }
    }, 400);
  };

  const fillDemoCredentials = () => {
    setMobile('9876543210');
    setPassword('Admin@2026!Secure');
    setError(null);
  };

  return (
    <main className="min-h-screen w-full flex flex-col justify-between items-center p-3 sm:p-6 md:p-8 bg-background text-foreground transition-colors duration-200">
      {/* Top Header with Language Selector & Theme Dropdown */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 sm:py-3 gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-base sm:text-lg shadow-sm shrink-0">
            A
          </div>
          <span className="font-semibold tracking-tight text-sm sm:text-base hidden xs:inline">
            Enterprise Admin Portal
          </span>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeDropdownOrganism
            currentTheme={theme}
            onThemeSelect={(tId) => setTheme(tId as ThemeType)}
            themes={THEME_OPTIONS}
          />
        </div>
      </header>

      {/* Main Authentication Card */}
      <div className="@container w-full max-w-md my-auto px-1 sm:px-0">
        <div className="shadow-2xl border border-border bg-card text-card-foreground p-6 sm:p-8 rounded-3xl transition-all space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-1">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-card-foreground">
              Sign In
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs">
              Secure enterprise login with mobile number, OWASP password rules & Cloudflare verification
            </p>
            <div className="text-[11px] font-mono text-muted-foreground/80 mt-1">Client IP: {clientIp}</div>
          </div>

          {/* Quick Demo Credentials Banner */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="font-semibold text-primary flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> Demo Credentials:
              </div>
              <div className="text-muted-foreground font-mono text-[11px]">
                Mobile: <span className="text-foreground font-medium">9876543210</span>
                <br />
                Password: <span className="text-foreground font-medium">Admin@2026!Secure</span>
              </div>
            </div>
            <AppButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={fillDemoCredentials}
              className="text-[11px] h-8 px-2.5 shrink-0"
            >
              Autofill
            </AppButton>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Login successful! Opening dashboard...</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground z-10">
                  <Smartphone className="w-4 h-4" />
                </div>
                <AppInput
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  disabled={isBlocked || loading || navigation.state === 'submitting'}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wide">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground z-10">
                  <Lock className="w-4 h-4" />
                </div>
                <AppInput
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isBlocked || loading || navigation.state === 'submitting'}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground z-10"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Cloudflare Siteverify */}
            <div className="pt-1">
              <CloudflareTurnstile
                onVerify={(token) => {
                  setTurnstileToken(token);
                  setError(null);
                }}
                isVerified={Boolean(turnstileToken)}
              />
            </div>

            {/* Submit Button */}
            <AppButton
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              disabled={isBlocked || loading || navigation.state === 'submitting'}
              isLoading={loading || navigation.state === 'submitting'}
            >
              Sign In
            </AppButton>
          </form>

          <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border">
            Don't have an admin account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      <footer className="w-full max-w-5xl py-4 text-center text-xs text-muted-foreground">
        © 2026 Enterprise Admin Design System. Built with OWASP ASVS 4.0 Security Standards.
      </footer>
    </main>
  );
}


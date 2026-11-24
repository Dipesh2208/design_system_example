import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from '@remix-run/react';
import { Smartphone, Lock, Eye, EyeOff, ShieldAlert, CheckCircle2, UserPlus } from 'lucide-react';
import { AppInput, AppButton } from '@repo/ui/atoms';
import { CloudflareTurnstile, OtpInput, PasswordStrengthIndicator } from '@repo/ui/molecules';
import { AuthStepper } from '@repo/ui/organisms';
import { ThemeDropdownOrganism } from '@repo/ui/organisms/ThemeDropdownOrganism';
import { LanguageSelector } from '../components/LanguageSelector';
import { useTheme, THEME_OPTIONS, type ThemeType } from '../components/ThemeProvider';
import { mockAuthService } from '../lib/auth/mock-auth-store';
import { validateOwaspPassword } from '@repo/ui/lib/owasp-password';

const SIGNUP_STEPS = [
  { id: 1, title: 'Mobile Verification' },
  { id: 2, title: 'Enter OTP' },
  { id: 3, title: 'Set Password' },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Step state
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields
  const [mobile, setMobile] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Security & Failure tracking
  const [clientIp] = useState(() => mockAuthService.getClientIp());
  const [isBlocked, setIsBlocked] = useState(() => mockAuthService.isIpBlocked(mockAuthService.getClientIp()));
  const [error, setError] = useState<string | null>(() => {
    const ip = mockAuthService.getClientIp();
    if (mockAuthService.isIpBlocked(ip)) {
      return 'Access Blocked: Your IP address is suspended.';
    }
    if (typeof window !== 'undefined') {
      const savedAbandonMobile = sessionStorage.getItem('admin_pending_signup_mobile');
      if (savedAbandonMobile) {
        sessionStorage.removeItem('admin_pending_signup_mobile');
        const check = mockAuthService.registerAbandonCheck(savedAbandonMobile);
        if (check.blocked) {
          return 'Security Block: You abandoned registration more than 3 times. Mobile number blocked.';
        }
        return `Previous signup was incomplete. You have abandoned ${check.count} of 3 permitted times.`;
      }
    }
    return null;
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OTP Timer & Limit State
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes (900s)
  const [requireResend, setRequireResend] = useState(false);
  const [failedCount, setFailedCount] = useState(0);

  // Step 2 Completed Flag
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // 15-Minute Countdown Timer for OTP
  useEffect(() => {
    if (currentStep !== 2) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRequireResend(true);
          setError('OTP expired after 15 minutes. Please request a new OTP.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStep]);

  // Window unload listener: tracks abandonment if user quits after Step 2
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isOtpVerified && currentStep === 3) {
        sessionStorage.setItem('admin_pending_signup_mobile', mobile);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isOtpVerified, currentStep, mobile]);

  // STEP 1: MOBILE & CLOUDFLARE SITEVERIFY
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isBlocked) return;

    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Cloudflare Siteverify Check:
    // If not approved, user stays on signup page
    if (!turnstileToken) {
      setError('Cloudflare Siteverify is not approved. Please verify that you are human.');
      return;
    }

    if (mockAuthService.isMobileBlocked(mobile)) {
      setIsBlocked(true);
      setError('This mobile number is blocked from registering.');
      return;
    }

    const sendRes = mockAuthService.sendOtp(mobile, clientIp);
    if (!sendRes.success) {
      setError(sendRes.error || 'Failed to send OTP.');
      return;
    }

    setTimeLeft(15 * 60);
    setFailedCount(0);
    setRequireResend(false);
    setCurrentStep(2);
  };

  // STEP 2: 4-DIGIT OTP VERIFICATION WITH 5-FAIL & BLOCK RULES
  const handleStep2VerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length < 4) {
      setError('Please enter all 4 digits of the OTP.');
      return;
    }

    const res = mockAuthService.verifyOtp(mobile, otp, clientIp);

    if (!res.success) {
      setError(res.error || 'Invalid OTP.');
      if (res.isBlocked) {
        setIsBlocked(true);
      }
      if (res.requireResend) {
        setRequireResend(true);
      }
      setFailedCount((prev) => prev + 1);
      return;
    }

    setIsOtpVerified(true);
    sessionStorage.setItem('admin_pending_signup_mobile', mobile);
    setCurrentStep(3);
  };

  const handleResendOtp = () => {
    setError(null);
    const res = mockAuthService.resendOtp(mobile, clientIp);
    if (!res.success) {
      setError(res.error || 'Could not resend OTP.');
      return;
    }
    setTimeLeft(15 * 60);
    setOtp('');
    setFailedCount(0);
    setRequireResend(false);
    setSuccessMessage('New OTP sent successfully! (Mock code: 1234)');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // STEP 3: OWASP PASSWORD & CONFIRM PASSWORD
  const owaspCheck = validateOwaspPassword(password);

  const handleStep3Complete = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!owaspCheck.valid) {
      setError(owaspCheck.errors[0] || 'Password does not meet OWASP standards.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const regRes = mockAuthService.completeSignup(mobile, password);
    if (!regRes.success) {
      setError(regRes.error || 'Registration failed.');
      return;
    }

    sessionStorage.removeItem('admin_pending_signup_mobile');
    setSuccessMessage('Admin account created successfully! Redirecting to sign in...');
    setTimeout(() => {
      navigate('/auth');
    }, 1500);
  };

  return (
    <main className="min-h-screen w-full flex flex-col justify-between items-center p-3 sm:p-6 md:p-8 bg-background text-foreground transition-colors duration-200">
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

      <div className="@container w-full max-w-lg my-auto px-1 sm:px-0">
        <div className="shadow-2xl border border-border bg-card text-card-foreground p-6 sm:p-8 rounded-3xl transition-all space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-1">
              <UserPlus className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-card-foreground">
              Create Admin Account
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs">
              3-Step secure registration with OTP & OWASP compliance
            </p>
            <div className="text-[11px] font-mono text-muted-foreground/80 mt-1">Client IP: {clientIp}</div>
          </div>

          {/* Stepper Header */}
          <div className="py-2">
            <AuthStepper steps={SIGNUP_STEPS} currentStep={currentStep} />
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* STEP 1 */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
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
                    disabled={isBlocked}
                    className="pl-10"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  A 4-digit verification code will be sent to this number.
                </p>
              </div>

              <div className="pt-1">
                <CloudflareTurnstile
                  onVerify={(token) => {
                    setTurnstileToken(token);
                    setError(null);
                  }}
                  isVerified={Boolean(turnstileToken)}
                />
              </div>

              <AppButton
                type="submit"
                variant="primary"
                size="md"
                disabled={isBlocked}
                className="w-full"
              >
                Continue to OTP Verification
              </AppButton>
            </form>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2VerifyOtp} className="space-y-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Enter the 4-digit code sent to{' '}
                  <span className="font-semibold text-foreground">+91 {mobile}</span>
                </p>
                <div className="text-[11px] text-primary font-mono mt-1">
                  (Mock OTP code: 1234)
                </div>
              </div>

              <OtpInput
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  setError(null);
                }}
                length={4}
                timeLeftSeconds={timeLeft}
                onResend={handleResendOtp}
                requireResend={requireResend}
                failedCount={failedCount}
                maxAttemptsCycle={5}
                disabled={isBlocked}
              />

              <AppButton
                type="submit"
                variant="primary"
                size="md"
                disabled={isBlocked || requireResend || otp.length < 4}
                className="w-full"
              >
                Verify OTP
              </AppButton>
            </form>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <form onSubmit={handleStep3Complete} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                  Set Password (OWASP Standard)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground z-10">
                    <Lock className="w-4 h-4" />
                  </div>
                  <AppInput
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create secure password"
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

              <PasswordStrengthIndicator result={owaspCheck} showRules={true} />

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground z-10">
                    <Lock className="w-4 h-4" />
                  </div>
                  <AppInput
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type your password"
                    className="pl-10"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-rose-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <AppButton
                type="submit"
                variant="primary"
                size="md"
                disabled={isBlocked || !owaspCheck.valid || password !== confirmPassword}
                className="w-full"
              >
                Complete Registration
              </AppButton>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border">
            Already registered?{' '}
            <Link to="/auth" className="text-primary hover:underline font-semibold">
              Sign In
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

/**
 * Mock Auth & Security Store for Enterprise Admin
 * Handles:
 * 1. IP Tracking & IP Blocking
 * 2. Mobile Number Blocking
 * 3. 5-time wrong OTP lockout -> forces Resend OTP
 * 4. 10-time total wrong OTP -> Blocks IP and Mobile Account
 * 5. Abandoned Signup Tracking: If OTP is verified but user quits before setting password > 3 times, blocks mobile
 * 6. 15-minute OTP lifespan
 * 7. Cloudflare Turnstile token validation
 */

export interface UserAccount {
  mobile: string;
  passwordHash: string;
  role: string;
  registeredAt: number;
}

export interface OtpSession {
  mobile: string;
  code: string;
  createdAt: number;
  expiresAt: number; // 15 mins (900,000 ms)
  verified: boolean;
  attemptsThisCycle: number; // max 5 per cycle
  resendRequired: boolean;
  totalFailedAttempts: number; // 10 total -> permanent lockout
}

export interface SecurityState {
  blockedIps: string[];
  blockedMobiles: string[];
  abandonedSignups: Record<string, number>; // mobile -> count
  clientIp: string;
}

const STORAGE_KEYS = {
  USERS: 'admin_auth_mock_users',
  SECURITY: 'admin_auth_mock_security',
  ACTIVE_OTP: 'admin_auth_mock_active_otp',
};

// Default Simulated Client IP
const DEFAULT_CLIENT_IP = '152.58.12.94';

class MockAuthService {
  private getStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to sessionStorage', e);
    }
  }

  public getClientIp(): string {
    const sec = this.getSecurityState();
    return sec.clientIp || DEFAULT_CLIENT_IP;
  }

  public setClientIp(ip: string): void {
    const sec = this.getSecurityState();
    sec.clientIp = ip;
    this.saveSecurityState(sec);
  }

  public getSecurityState(): SecurityState {
    return this.getStorage<SecurityState>(STORAGE_KEYS.SECURITY, {
      blockedIps: [],
      blockedMobiles: [],
      abandonedSignups: {},
      clientIp: DEFAULT_CLIENT_IP,
    });
  }

  private saveSecurityState(state: SecurityState): void {
    this.setStorage(STORAGE_KEYS.SECURITY, state);
  }

  public isIpBlocked(ip: string): boolean {
    const state = this.getSecurityState();
    return state.blockedIps.includes(ip);
  }

  public isMobileBlocked(mobile: string): boolean {
    const state = this.getSecurityState();
    return state.blockedMobiles.includes(mobile);
  }

  public blockIpAndMobile(ip: string, mobile: string): void {
    const state = this.getSecurityState();
    if (!state.blockedIps.includes(ip)) state.blockedIps.push(ip);
    if (!state.blockedMobiles.includes(mobile)) state.blockedMobiles.push(mobile);
    this.saveSecurityState(state);
  }

  public blockMobile(mobile: string): void {
    const state = this.getSecurityState();
    if (!state.blockedMobiles.includes(mobile)) state.blockedMobiles.push(mobile);
    this.saveSecurityState(state);
  }

  /**
   * Abandoned Signup Tracking
   * If a user verified OTP in signup, but navigated away/reloaded without password setting,
   * call this when they re-initiate signup. If > 3 times, block mobile.
   */
  public registerAbandonCheck(mobile: string): { blocked: boolean; count: number } {
    const state = this.getSecurityState();
    const count = (state.abandonedSignups[mobile] || 0) + 1;
    state.abandonedSignups[mobile] = count;

    if (count > 3) {
      this.blockMobile(mobile);
      return { blocked: true, count };
    }

    this.saveSecurityState(state);
    return { blocked: false, count };
  }

  public resetAbandonCount(mobile: string): void {
    const state = this.getSecurityState();
    delete state.abandonedSignups[mobile];
    this.saveSecurityState(state);
  }

  public getActiveOtp(mobile: string): OtpSession | null {
    const all = this.getStorage<Record<string, OtpSession>>(STORAGE_KEYS.ACTIVE_OTP, {});
    return all[mobile] || null;
  }

  private saveActiveOtp(otp: OtpSession): void {
    const all = this.getStorage<Record<string, OtpSession>>(STORAGE_KEYS.ACTIVE_OTP, {});
    all[otp.mobile] = otp;
    this.setStorage(STORAGE_KEYS.ACTIVE_OTP, all);
  }

  /**
   * Send OTP
   * Generates a 4-digit code (default '1234' for predictable mock testing)
   * 15-minute timer (15 * 60 * 1000 ms)
   */
  public sendOtp(mobile: string, ip: string, isResend = false): { success: boolean; error?: string; otpPreview?: string } {
    if (this.isIpBlocked(ip)) {
      return { success: false, error: 'Your IP address has been blocked due to security violations.' };
    }
    if (this.isMobileBlocked(mobile)) {
      return { success: false, error: 'This mobile number is blocked. Please contact support.' };
    }

    const existing = this.getActiveOtp(mobile);
    const totalFailed = existing ? existing.totalFailedAttempts : 0;

    const code = '1234';
    const now = Date.now();
    const expiresAt = now + 15 * 60 * 1000; // 15 minutes

    const session: OtpSession = {
      mobile,
      code,
      createdAt: now,
      expiresAt,
      verified: false,
      attemptsThisCycle: 0,
      resendRequired: false,
      totalFailedAttempts: isResend ? totalFailed : 0,
    };

    this.saveActiveOtp(session);
    return { success: true, otpPreview: code };
  }

  /**
   * Verify 4-digit OTP
   */
  public verifyOtp(
    mobile: string,
    otpCode: string,
    ip: string
  ): {
    success: boolean;
    error?: string;
    remainingCycleAttempts?: number;
    requireResend?: boolean;
    isBlocked?: boolean;
  } {
    if (this.isIpBlocked(ip)) {
      return { success: false, error: 'Your IP is blocked.', isBlocked: true };
    }
    if (this.isMobileBlocked(mobile)) {
      return { success: false, error: 'This mobile number is blocked.', isBlocked: true };
    }

    const session = this.getActiveOtp(mobile);
    if (!session) {
      return { success: false, error: 'No active OTP request found. Please request a new OTP.' };
    }

    // Check 15-minute expiration
    if (Date.now() > session.expiresAt) {
      return { success: false, error: 'OTP has expired (15-minute limit exceeded). Please request a new OTP.', requireResend: true };
    }

    // Check if resend is currently required
    if (session.resendRequired) {
      return { success: false, error: '5 incorrect attempts reached. You must resend the OTP to continue.', requireResend: true };
    }

    // Check correctness
    if (session.code === otpCode) {
      session.verified = true;
      this.saveActiveOtp(session);
      return { success: true };
    }

    // Incorrect OTP entered
    session.attemptsThisCycle += 1;
    session.totalFailedAttempts += 1;

    // Check permanent block (10 total wrong attempts across 2 cycles)
    if (session.totalFailedAttempts >= 10) {
      this.blockIpAndMobile(ip, mobile);
      this.saveActiveOtp(session);
      return {
        success: false,
        error: 'Too many failed attempts. Your IP and mobile number have been blocked.',
        isBlocked: true,
      };
    }

    // Check single cycle limit (5 wrong attempts)
    if (session.attemptsThisCycle >= 5) {
      session.resendRequired = true;
      this.saveActiveOtp(session);
      return {
        success: false,
        error: '5 incorrect OTP attempts entered. You must resend the OTP.',
        requireResend: true,
        remainingCycleAttempts: 0,
      };
    }

    const remaining = 5 - session.attemptsThisCycle;
    this.saveActiveOtp(session);
    return {
      success: false,
      error: `Invalid OTP. You have ${remaining} attempt${remaining > 1 ? 's' : ''} left before resend is required.`,
      remainingCycleAttempts: remaining,
    };
  }

  /**
   * Resend OTP trigger (resets the 5-attempt cycle, preserves total failed count towards 10)
   */
  public resendOtp(mobile: string, ip: string): { success: boolean; error?: string; otpPreview?: string } {
    return this.sendOtp(mobile, ip, true);
  }

  /**
   * Complete Signup with Password
   */
  public completeSignup(
    mobile: string,
    password: string
  ): { success: boolean; error?: string } {
    const session = this.getActiveOtp(mobile);
    if (!session || !session.verified) {
      return { success: false, error: 'Mobile number not verified by OTP. Please restart signup.' };
    }

    const users = this.getStorage<Record<string, UserAccount>>(STORAGE_KEYS.USERS, {});
    if (users[mobile]) {
      return { success: false, error: 'An account with this mobile number already exists.' };
    }

    users[mobile] = {
      mobile,
      passwordHash: password,
      role: 'Admin',
      registeredAt: Date.now(),
    };
    this.setStorage(STORAGE_KEYS.USERS, users);

    // Reset abandon count upon successful signup
    this.resetAbandonCount(mobile);
    return { success: true };
  }

  /**
   * Password Reset completion
   */
  public resetPassword(
    mobile: string,
    newPassword: string
  ): { success: boolean; error?: string } {
    const session = this.getActiveOtp(mobile);
    if (!session || !session.verified) {
      return { success: false, error: 'OTP verification required before resetting password.' };
    }

    const users = this.getStorage<Record<string, UserAccount>>(STORAGE_KEYS.USERS, {});
    if (!users[mobile]) {
      users[mobile] = { mobile, passwordHash: newPassword, role: 'Admin', registeredAt: Date.now() };
    } else {
      users[mobile].passwordHash = newPassword;
    }
    this.setStorage(STORAGE_KEYS.USERS, users);
    return { success: true };
  }

  /**
   * Login
   */
  public login(
    mobile: string,
    password: string,
    turnstileVerified: boolean,
    ip: string
  ): { success: boolean; error?: string; isBlocked?: boolean; user?: UserAccount } {
    if (this.isIpBlocked(ip)) {
      return { success: false, error: 'Access blocked: Your IP address is on the security blocklist.', isBlocked: true };
    }
    if (this.isMobileBlocked(mobile)) {
      return { success: false, error: 'Access blocked: This mobile account is suspended.', isBlocked: true };
    }
    if (!turnstileVerified) {
      return { success: false, error: 'Cloudflare Turnstile verification is required.' };
    }

    const users = this.getStorage<Record<string, UserAccount>>(STORAGE_KEYS.USERS, {});
    const user = users[mobile];

    // For ease of demo, if user isn't in mock storage yet, allow standard demo passwords
    if (!user) {
      if (password === 'Admin@2026!Secure' || password === 'Secret@12345') {
        const demoUser: UserAccount = {
          mobile,
          passwordHash: password,
          role: 'Super Admin',
          registeredAt: Date.now(),
        };
        return { success: true, user: demoUser };
      }
      return { success: false, error: 'Mobile number or password incorrect.' };
    }

    if (user.passwordHash !== password) {
      return { success: false, error: 'Mobile number or password incorrect.' };
    }

    return { success: true, user };
  }

  /**
   * Reset all mock data
   */
  public clearAll(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEYS.USERS);
    sessionStorage.removeItem(STORAGE_KEYS.SECURITY);
    sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_OTP);
  }
}

export const mockAuthService = new MockAuthService();

/**
 * Mock Auth & Security Store for UI Package Testing & Admin App
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
  expiresAt: number;
  verified: boolean;
  attemptsThisCycle: number;
  resendRequired: boolean;
  totalFailedAttempts: number;
}

export interface SecurityState {
  blockedIps: string[];
  blockedMobiles: string[];
  abandonedSignups: Record<string, number>;
  clientIp: string;
}

export interface MockStorageSchema {
  admin_auth_mock_users: Record<string, UserAccount>;
  admin_auth_mock_security: SecurityState;
  admin_auth_mock_active_otp: Record<string, OtpSession>;
}

export type StorageKey = keyof MockStorageSchema;

const STORAGE_KEYS = {
  USERS: "admin_auth_mock_users" as const,
  SECURITY: "admin_auth_mock_security" as const,
  ACTIVE_OTP: "admin_auth_mock_active_otp" as const,
};

const DEFAULT_CLIENT_IP = "152.58.12.94";

export class MockAuthService {
  private memStorage: Partial<MockStorageSchema> = {};

  private getStorage<K extends StorageKey>(
    key: K,
    fallback: MockStorageSchema[K],
  ): MockStorageSchema[K] {
    if (
      typeof window === "undefined" ||
      typeof sessionStorage === "undefined"
    ) {
      const val = this.memStorage[key];
      return val !== undefined ? JSON.parse(JSON.stringify(val)) : fallback;
    }
    try {
      const data = sessionStorage.getItem(key);
      return data ? (JSON.parse(data) as MockStorageSchema[K]) : fallback;
    } catch {
      return fallback;
    }
  }

  private setStorage<K extends StorageKey>(
    key: K,
    value: MockStorageSchema[K],
  ): void {
    if (
      typeof window === "undefined" ||
      typeof sessionStorage === "undefined"
    ) {
      this.memStorage[key] = JSON.parse(JSON.stringify(value));
      return;
    }
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Failed to save to sessionStorage", e);
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
    return this.getStorage(STORAGE_KEYS.SECURITY, {
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
    if (!state.blockedMobiles.includes(mobile))
      state.blockedMobiles.push(mobile);
    this.saveSecurityState(state);
  }

  public blockMobile(mobile: string): void {
    const state = this.getSecurityState();
    if (!state.blockedMobiles.includes(mobile))
      state.blockedMobiles.push(mobile);
    this.saveSecurityState(state);
  }

  public registerAbandonCheck(mobile: string): {
    blocked: boolean;
    count: number;
  } {
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
    const all = this.getStorage(STORAGE_KEYS.ACTIVE_OTP, {});
    return all[mobile] || null;
  }

  private saveActiveOtp(otp: OtpSession): void {
    const all = this.getStorage(STORAGE_KEYS.ACTIVE_OTP, {});
    all[otp.mobile] = otp;
    this.setStorage(STORAGE_KEYS.ACTIVE_OTP, all);
  }

  public sendOtp(
    mobile: string,
    ip: string,
    isResend = false,
  ): { success: boolean; error?: string; otpPreview?: string } {
    if (this.isIpBlocked(ip)) {
      return {
        success: false,
        error: "Your IP address has been blocked due to security violations.",
      };
    }
    if (this.isMobileBlocked(mobile)) {
      return {
        success: false,
        error: "This mobile number is blocked. Please contact support.",
      };
    }

    const existing = this.getActiveOtp(mobile);
    const totalFailed = existing ? existing.totalFailedAttempts : 0;

    const code = "1234";
    const now = Date.now();
    const expiresAt = now + 15 * 60 * 1000;

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

  public verifyOtp(
    mobile: string,
    otpCode: string,
    ip: string,
  ): {
    success: boolean;
    error?: string;
    remainingCycleAttempts?: number;
    requireResend?: boolean;
    isBlocked?: boolean;
  } {
    if (this.isIpBlocked(ip)) {
      return { success: false, error: "Your IP is blocked.", isBlocked: true };
    }
    if (this.isMobileBlocked(mobile)) {
      return {
        success: false,
        error: "This mobile number is blocked.",
        isBlocked: true,
      };
    }

    const session = this.getActiveOtp(mobile);
    if (!session) {
      return {
        success: false,
        error: "No active OTP request found. Please request a new OTP.",
      };
    }

    if (Date.now() > session.expiresAt) {
      return {
        success: false,
        error:
          "OTP has expired (15-minute limit exceeded). Please request a new OTP.",
        requireResend: true,
      };
    }

    if (session.resendRequired) {
      return {
        success: false,
        error:
          "5 incorrect attempts reached. You must resend the OTP to continue.",
        requireResend: true,
      };
    }

    if (session.code === otpCode) {
      session.verified = true;
      this.saveActiveOtp(session);
      return { success: true };
    }

    session.attemptsThisCycle += 1;
    session.totalFailedAttempts += 1;

    if (session.totalFailedAttempts >= 10) {
      this.blockIpAndMobile(ip, mobile);
      this.saveActiveOtp(session);
      return {
        success: false,
        error:
          "Too many failed attempts. Your IP and mobile number have been blocked.",
        isBlocked: true,
      };
    }

    if (session.attemptsThisCycle >= 5) {
      session.resendRequired = true;
      this.saveActiveOtp(session);
      return {
        success: false,
        error: "5 incorrect OTP attempts entered. You must resend the OTP.",
        requireResend: true,
        remainingCycleAttempts: 0,
      };
    }

    const remaining = 5 - session.attemptsThisCycle;
    this.saveActiveOtp(session);
    return {
      success: false,
      error: `Invalid OTP. You have ${remaining} attempt${remaining > 1 ? "s" : ""} left before resend is required.`,
      remainingCycleAttempts: remaining,
    };
  }

  public resendOtp(
    mobile: string,
    ip: string,
  ): { success: boolean; error?: string; otpPreview?: string } {
    return this.sendOtp(mobile, ip, true);
  }

  public completeSignup(
    mobile: string,
    password: string,
  ): { success: boolean; error?: string } {
    const session = this.getActiveOtp(mobile);
    if (!session || !session.verified) {
      return {
        success: false,
        error: "Mobile number not verified by OTP. Please restart signup.",
      };
    }

    const users = this.getStorage(STORAGE_KEYS.USERS, {});
    if (users[mobile]) {
      return {
        success: false,
        error: "An account with this mobile number already exists.",
      };
    }

    users[mobile] = {
      mobile,
      passwordHash: password,
      role: "Admin",
      registeredAt: Date.now(),
    };
    this.setStorage(STORAGE_KEYS.USERS, users);
    this.resetAbandonCount(mobile);
    return { success: true };
  }

  public resetPassword(
    mobile: string,
    newPassword: string,
  ): { success: boolean; error?: string } {
    const session = this.getActiveOtp(mobile);
    if (!session || !session.verified) {
      return {
        success: false,
        error: "OTP verification required before resetting password.",
      };
    }

    const users = this.getStorage(STORAGE_KEYS.USERS, {});
    if (!users[mobile]) {
      users[mobile] = {
        mobile,
        passwordHash: newPassword,
        role: "Admin",
        registeredAt: Date.now(),
      };
    } else {
      users[mobile].passwordHash = newPassword;
    }
    this.setStorage(STORAGE_KEYS.USERS, users);
    return { success: true };
  }

  public login(
    mobile: string,
    password: string,
    turnstileVerified: boolean,
    ip: string,
  ): {
    success: boolean;
    error?: string;
    isBlocked?: boolean;
    user?: UserAccount;
  } {
    if (this.isIpBlocked(ip)) {
      return {
        success: false,
        error: "Access blocked: Your IP address is on the security blocklist.",
        isBlocked: true,
      };
    }
    if (this.isMobileBlocked(mobile)) {
      return {
        success: false,
        error: "Access blocked: This mobile account is suspended.",
        isBlocked: true,
      };
    }
    if (!turnstileVerified) {
      return {
        success: false,
        error: "Cloudflare Turnstile verification is required.",
      };
    }

    const users = this.getStorage(STORAGE_KEYS.USERS, {});
    const user = users[mobile];

    if (!user) {
      if (password === "Admin@2026!Secure" || password === "Secret@12345") {
        const demoUser: UserAccount = {
          mobile,
          passwordHash: password,
          role: "Super Admin",
          registeredAt: Date.now(),
        };
        return { success: true, user: demoUser };
      }
      return { success: false, error: "Mobile number or password incorrect." };
    }

    if (user.passwordHash !== password) {
      return { success: false, error: "Mobile number or password incorrect." };
    }

    return { success: true, user };
  }

  public clearAll(): void {
    this.memStorage = {};
    if (typeof window === "undefined" || typeof sessionStorage === "undefined")
      return;
    sessionStorage.removeItem(STORAGE_KEYS.USERS);
    sessionStorage.removeItem(STORAGE_KEYS.SECURITY);
    sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_OTP);
  }
}

export const mockAuthService = new MockAuthService();

import { describe, it, expect, beforeEach } from "vitest";
import { mockAuthService } from "../lib/mock-auth-store";

describe("Admin Authentication & Security Engine Test Suite", () => {
  const testMobile = "9876543210";
  const testIp = "152.58.12.94";
  const validPassword = "Admin@2026!Secure";

  beforeEach(() => {
    mockAuthService.clearAll();
  });

  describe("1. Login & Credential Validation", () => {
    it("successfully authenticates with valid mobile and OWASP password", () => {
      const res = mockAuthService.login(
        testMobile,
        validPassword,
        true,
        testIp,
      );
      expect(res.success).toBe(true);
      expect(res.user?.mobile).toBe(testMobile);
    });

    it("rejects login when Cloudflare Turnstile is unverified", () => {
      const res = mockAuthService.login(
        testMobile,
        validPassword,
        false,
        testIp,
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain(
        "Cloudflare Turnstile verification is required",
      );
    });

    it("rejects login with wrong password without locking on first attempt", () => {
      const res = mockAuthService.login(
        testMobile,
        "WrongPassword@123",
        true,
        testIp,
      );
      expect(res.success).toBe(false);
      expect(res.error).toBe("Mobile number or password incorrect.");
      expect(mockAuthService.isMobileBlocked(testMobile)).toBe(false);
      expect(mockAuthService.isIpBlocked(testIp)).toBe(false);
    });
  });

  describe("2. OTP Cycle Counter (1 to 5 Failed Attempts) & Resend Rules", () => {
    it("creates active OTP with 15-minute expiration timer", () => {
      const res = mockAuthService.sendOtp(testMobile, testIp);
      expect(res.success).toBe(true);
      const session = mockAuthService.getActiveOtp(testMobile);
      expect(session).not.toBeNull();
      expect(session?.expiresAt).toBeGreaterThan(Date.now() + 14 * 60 * 1000);
    });

    it("tracks failed attempts from 1 to 5 and enforces resend on 5th failure", () => {
      mockAuthService.sendOtp(testMobile, testIp);

      for (let i = 1; i <= 4; i++) {
        const res = mockAuthService.verifyOtp(testMobile, "9999", testIp);
        expect(res.success).toBe(false);
        expect(res.remainingCycleAttempts).toBe(5 - i);
        expect(res.requireResend).toBeFalsy();
      }

      // 5th incorrect attempt in the cycle
      const fifth = mockAuthService.verifyOtp(testMobile, "9999", testIp);
      expect(fifth.success).toBe(false);
      expect(fifth.requireResend).toBe(true);
      expect(fifth.error).toContain(
        "5 incorrect OTP attempts entered. You must resend the OTP.",
      );

      // Any attempt while requireResend is active is blocked until resendOtp
      const blockedAttempt = mockAuthService.verifyOtp(
        testMobile,
        "9999",
        testIp,
      );
      expect(blockedAttempt.success).toBe(false);
      expect(blockedAttempt.requireResend).toBe(true);
    });

    it("resends OTP, refreshes 15-minute timer and resets cycle counter", () => {
      mockAuthService.sendOtp(testMobile, testIp);
      for (let i = 0; i < 5; i++) {
        mockAuthService.verifyOtp(testMobile, "9999", testIp);
      }

      const resendRes = mockAuthService.resendOtp(testMobile, testIp);
      expect(resendRes.success).toBe(true);

      const session = mockAuthService.getActiveOtp(testMobile);
      expect(session?.attemptsThisCycle).toBe(0);
      expect(session?.resendRequired).toBe(false);
      expect(session?.expiresAt).toBeGreaterThan(Date.now() + 14 * 60 * 1000);
    });
  });

  describe("3. Tier 2 Lockout: 10 Total Wrong Attempts Blocks IP and Mobile", () => {
    it("permanently blocks both client IP and mobile account after 10 failed attempts across cycles", () => {
      mockAuthService.sendOtp(testMobile, testIp);

      // Cycle 1: 5 failures
      for (let i = 0; i < 5; i++) {
        mockAuthService.verifyOtp(testMobile, "9999", testIp);
      }

      // Resend OTP
      mockAuthService.resendOtp(testMobile, testIp);

      // Cycle 2: failures 6, 7, 8, 9
      for (let i = 0; i < 4; i++) {
        const res = mockAuthService.verifyOtp(testMobile, "9999", testIp);
        expect(res.success).toBe(false);
        expect(res.isBlocked).toBeFalsy();
      }

      // 10th total failure across both cycles triggers permanent block
      const tenth = mockAuthService.verifyOtp(testMobile, "9999", testIp);
      expect(tenth.success).toBe(false);
      expect(tenth.isBlocked).toBe(true);
      expect(tenth.error).toContain(
        "Too many failed attempts. Your IP and mobile number have been blocked.",
      );

      // Verify that IP and Mobile are strictly locked out from all actions
      expect(mockAuthService.isIpBlocked(testIp)).toBe(true);
      expect(mockAuthService.isMobileBlocked(testMobile)).toBe(true);

      const loginAttempt = mockAuthService.login(
        testMobile,
        validPassword,
        true,
        testIp,
      );
      expect(loginAttempt.success).toBe(false);
      expect(loginAttempt.isBlocked).toBe(true);
    });
  });

  describe("4. Abandoned Registration Limit (> 3 Times Throttling)", () => {
    it("blocks mobile number if registration is abandoned more than 3 times", () => {
      expect(mockAuthService.registerAbandonCheck(testMobile).blocked).toBe(
        false,
      );
      expect(mockAuthService.registerAbandonCheck(testMobile).blocked).toBe(
        false,
      );
      expect(mockAuthService.registerAbandonCheck(testMobile).blocked).toBe(
        false,
      );

      // 4th abandonment (> 3 times) triggers block
      const fourth = mockAuthService.registerAbandonCheck(testMobile);
      expect(fourth.blocked).toBe(true);
      expect(mockAuthService.isMobileBlocked(testMobile)).toBe(true);
    });
  });
});

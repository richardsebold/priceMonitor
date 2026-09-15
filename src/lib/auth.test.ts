import { describe, it, expect } from "vitest";
import { emailAndPasswordConfig, emailVerificationConfig } from "./auth-email-verification";

describe("auth config", () => {
  it("requireEmailVerification is enabled so unverified sign-in and sign-up without a session are gated", () => {
    expect(emailAndPasswordConfig.requireEmailVerification).toBe(true);
  });

  it("emailVerification sends on sign-up, expires in 3600s, and signs the user in automatically after verifying", () => {
    expect(emailVerificationConfig.sendOnSignUp).toBe(true);
    expect(emailVerificationConfig.autoSignInAfterVerification).toBe(true);
    expect(emailVerificationConfig.expiresIn).toBe(3600);
  });
});

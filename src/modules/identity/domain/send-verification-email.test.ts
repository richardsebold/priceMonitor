import { describe, it, expect, vi } from "vitest";
import { sendVerificationEmailSafely } from "./send-verification-email";

describe("sendVerificationEmailSafely", () => {
  it("does not throw when delivery fails, and logs the error", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const failure = new Error("Resend indisponível");
    const send = vi.fn().mockRejectedValue(failure);

    await expect(sendVerificationEmailSafely(send)).resolves.toBeUndefined();

    expect(send).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Falha ao enviar e-mail de verificação:", failure);

    consoleErrorSpy.mockRestore();
  });

  it("awaits the send call when it succeeds", async () => {
    const send = vi.fn().mockResolvedValue(undefined);

    await sendVerificationEmailSafely(send);

    expect(send).toHaveBeenCalledTimes(1);
  });
});

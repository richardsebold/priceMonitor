export async function sendVerificationEmailSafely(send: () => Promise<unknown>): Promise<void> {
  try {
    await send();
  } catch (error) {
    console.error("Falha ao enviar e-mail de verificação:", error);
  }
}

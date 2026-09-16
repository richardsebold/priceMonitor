import { createHash, timingSafeEqual } from "crypto";

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

// Hash antes de comparar: timingSafeEqual exige buffers do mesmo tamanho (lança
// exceção se não forem), o que vazaria se o tamanho do segredo recebido bate com
// o esperado. O digest SHA-256 tem tamanho fixo, então a comparação nunca lança
// e nunca revela informação de tamanho.
export function secretsMatch(a: string | undefined | null, b: string | undefined | null): boolean {
  if (!a || !b) return false;
  return timingSafeEqual(digest(a), digest(b));
}

function warnIfUnconfigured(secret: string | undefined | null, label: string): secret is string {
  if (secret) return true;
  console.error(`${label} não está configurado - rejeitando toda requisição.`);
  return false;
}

/** Compara um header `Authorization: Bearer <segredo>` com o segredo configurado. */
export function bearerTokenMatches(
  authHeader: string | null,
  configuredSecret: string | undefined | null,
  label: string,
): boolean {
  if (!warnIfUnconfigured(configuredSecret, label)) return false;
  return secretsMatch(authHeader, `Bearer ${configuredSecret}`);
}

/** Compara um segredo recebido (ex.: query string) com o segredo configurado. */
export function rawSecretMatches(
  received: string | undefined | null,
  configuredSecret: string | undefined | null,
  label: string,
): boolean {
  if (!warnIfUnconfigured(configuredSecret, label)) return false;
  return secretsMatch(received, configuredSecret);
}

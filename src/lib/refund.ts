export const REFUND_WINDOW_DAYS = 7;

export function isWithinRefundWindow(
  subscriptionStart: Date | string | null | undefined,
): boolean {
  if (!subscriptionStart) return false;
  const start = new Date(subscriptionStart).getTime();
  if (Number.isNaN(start)) return false;
  return Date.now() - start <= REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

export function refundDeadline(
  subscriptionStart: Date | string | null | undefined,
): Date | null {
  if (!subscriptionStart) return null;
  const start = new Date(subscriptionStart);
  if (Number.isNaN(start.getTime())) return null;
  return new Date(start.getTime() + REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000);
}

export const CANCELLATION_REASONS = [
  { value: "expensive", label: "Está muito caro" },
  { value: "not_using", label: "Não estou usando o suficiente" },
  { value: "missing_features", label: "Faltam recursos que eu preciso" },
  { value: "technical_issues", label: "Tive problemas técnicos / bugs" },
  { value: "found_alternative", label: "Encontrei uma alternativa melhor" },
  { value: "temporary", label: "É só uma pausa temporária" },
  { value: "other", label: "Outro motivo" },
] as const;

export type CancellationReason = (typeof CANCELLATION_REASONS)[number]["value"];

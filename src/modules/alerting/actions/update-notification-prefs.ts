"use server";

import { getSessionUserId } from "@/modules/identity/session";
import { setPriceAlertsEnabled as savePriceAlertsEnabled } from "../infra/notification-repository";

export async function setPriceAlertsEnabled(enabled: boolean) {
  const userId = await getSessionUserId();

  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  await savePriceAlertsEnabled(userId, enabled);

  return { priceAlertsEnabled: enabled };
}

"use server"

import { getSessionUserId } from "@/modules/identity/session";
import { findLatestAlerts } from "../infra/notification-repository";

export async function getLatestAlerts() {
  const userId = await getSessionUserId();

  if (!userId) return [];

  return findLatestAlerts(userId);
}

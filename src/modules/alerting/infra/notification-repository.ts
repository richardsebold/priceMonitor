import { prisma } from "@/lib/prisma";
import type { PriceEventType } from "@/modules/price-tracking/domain/price-events";

export function getRecipient(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, priceAlertsEnabled: true },
  });
}

export function setPriceAlertsEnabled(userId: string, enabled: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { priceAlertsEnabled: enabled },
  });
}

export function setWeeklySummaryEnabled(userId: string, enabled: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { weeklySummaryEnabled: enabled },
  });
}

export function findWeeklySummaryRecipients() {
  return prisma.user.findMany({
    where: { weeklySummaryEnabled: true },
    select: {
      id: true,
      email: true,
      name: true,
      products: {
        select: {
          name: true,
          price: true,
          priceTarget: true,
          history: {
            select: { price: true, createdAt: true },
          },
        },
      },
    },
  });
}

export function setChatId(userId: string, chatId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { chatId },
  });
}

export function createAlert(alert: {
  type: PriceEventType;
  name: string | null;
  url: string;
  price: number;
  priceTarget: number;
  userId: string;
  productId: string;
}) {
  return prisma.alert.create({ data: alert });
}

export function findLatestAlerts(userId: string, take = 10) {
  return prisma.alert.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

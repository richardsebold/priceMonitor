import { findWeeklySummaryRecipients } from "../infra/notification-repository";
import { sendWeeklySummary } from "../channels/email";
import { weeklyPriceChange, pickBiggestWeeklyDrop } from "@/modules/analytics/domain/weekly-variation";
import { sumPotentialSavings } from "@/modules/analytics/domain/metrics";

export async function sendWeeklySummaries(now: Date = new Date()) {
  console.log("Iniciando envio do resumo semanal...");

  const users = await findWeeklySummaryRecipients();

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    if (user.products.length === 0) continue;

    try {
      const changes = user.products.map((product) =>
        weeklyPriceChange(
          {
            name: product.name,
            price: product.price,
            history: product.history.map((h) => ({
              time: h.createdAt.getTime(),
              price: h.price,
            })),
          },
          now.getTime(),
        ),
      );

      const biggestDrop = pickBiggestWeeklyDrop(changes);
      const potentialSavings = sumPotentialSavings(user.products);

      await sendWeeklySummary(user.email, user.name, {
        changes,
        biggestDrop,
        potentialSavings,
      });

      sent++;
    } catch (error) {
      console.error(`Erro ao enviar resumo semanal para ${user.email}:`, error);
      failed++;
    }
  }

  console.log(`Resumo semanal: ${sent} enviados, ${failed} falharam.`);
}

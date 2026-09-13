import type { PriceEvent } from "@/modules/price-tracking/domain/price-events";
import { sendPriceAlert, sendPriceDropAlert } from "../channels/email";
import { createAlert, getRecipient } from "../infra/notification-repository";

export async function handlePriceEvent(event: PriceEvent) {
  const recipient = await getRecipient(event.userId);
  if (!recipient) return;

  if (!recipient.priceAlertsEnabled) {
    console.log(`[SKIP] Alertas desativados para o usuário ${recipient.email}`);
    return;
  }

  const { product } = event;

  if (event.type === "TARGET_REACHED") {
    await sendPriceAlert(product, recipient.email, recipient.name);
  } else {
    await sendPriceDropAlert(product, recipient.email, recipient.name, event.previousPrice);
  }

  await createAlert({
    type: event.type,
    name: product.name,
    url: product.url,
    price: product.price,
    priceTarget: product.priceTarget,
    userId: event.userId,
    productId: product.id,
  });
}

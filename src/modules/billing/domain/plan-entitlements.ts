const FREE_PLAN_ID = "plano_free";

const MAX_TRACKED_PRODUCTS = new Map<string, number>([
  [FREE_PLAN_ID, 1],
  ["plano_noob_mensal", 7],
  ["plano_pro_mensal", 15],
  ["plano_hacker_mensal", 30],
]);

const BROWSER_EXTENSION_PLAN_ID = "plano_hacker_mensal";

export function maxTrackedProducts(planId: string | null | undefined): number {
  return MAX_TRACKED_PRODUCTS.get(planId || FREE_PLAN_ID) ?? 0;
}

export function canUseBrowserExtension(planId: string | null | undefined): boolean {
  return planId === BROWSER_EXTENSION_PLAN_ID;
}

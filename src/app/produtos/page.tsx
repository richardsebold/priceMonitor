import { getUser } from "@/modules/identity/actions/get-user";
import { getProductsListWithHistory } from "@/actions/get-products-list";
import { ProductsList } from "@/components/products-list";
import Sidebar from "@/components/sidebar";
import { maxTrackedProducts } from "@/modules/billing/domain/plan-entitlements";

export default async function ProdutosRastreados() {
  const [user, products] = await Promise.all([
    getUser(),
    getProductsListWithHistory(),
  ]);

  const userLimit = maxTrackedProducts(user?.planId);

  return (
    <div className="min-h-screen pb-10 sm:ml-14">
      <Sidebar />
      <ProductsList initialProducts={products} planLimit={userLimit} />
    </div>
  );
}

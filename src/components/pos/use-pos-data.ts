import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { buildPosCatalog } from "@/components/pos/pos-catalog";
import type { PosCustomerOption } from "@/components/pos/pos-order-panel";
import { POS_BRANCH_ID } from "@/components/pos/use-pos-ticket";
import { customerAdvanceBalance } from "@/domain/advances";
import { ProductStatus } from "@/domain/products";
import { ServiceStatus } from "@/domain/services";
import { advanceService } from "@/mocks/advances/service";
import { customerService } from "@/mocks/customers/service";
import { inventoryService } from "@/mocks/inventory/service";
import { productService } from "@/mocks/products/service";
import { serviceCatalog } from "@/mocks/services/service";

/** Catálogo vendible (productos + servicios activos) con stock de la sede. */
export function usePosCatalog() {
  const productsQuery = useQuery({
    queryKey: ["products", "pos"],
    queryFn: () => productService.list({ pageSize: 100 }),
  });
  const servicesQuery = useQuery({
    queryKey: ["services", "pos"],
    queryFn: () => serviceCatalog.list({ pageSize: 100 }),
  });
  const stockQuery = useQuery({
    queryKey: ["inventory", "stock", POS_BRANCH_ID],
    queryFn: () => inventoryService.getStock(undefined, POS_BRANCH_ID),
  });

  const catalog = useMemo(() => {
    const stock = new Map(
      (stockQuery.data ?? []).map((balance) => [
        balance.productId as string,
        balance.quantity,
      ]),
    );
    return buildPosCatalog(
      (productsQuery.data?.items ?? []).filter(
        (product) => product.status === ProductStatus.Active,
      ),
      (servicesQuery.data?.items ?? []).filter(
        (service) => service.status === ServiceStatus.Active,
      ),
      stock,
    );
  }, [productsQuery.data, servicesQuery.data, stockQuery.data]);

  return {
    catalog,
    isLoading: productsQuery.isLoading || servicesQuery.isLoading,
  };
}

/** Clientes del POS con su saldo de anticipos. */
export function usePosCustomers() {
  const customersQuery = useQuery({
    queryKey: ["customers", "pos"],
    queryFn: () => customerService.list({ pageSize: 100 }),
  });
  const advancesQuery = useQuery({
    queryKey: ["advances", "all"],
    queryFn: () => advanceService.getAll(),
  });

  return useMemo<PosCustomerOption[]>(() => {
    const advances = advancesQuery.data ?? [];
    return (customersQuery.data?.items ?? []).map((customer) => ({
      id: customer.id,
      name: customer.displayName,
      document: `${customer.documentType} ${customer.documentNumber}`,
      phone: customer.phones[0]?.number,
      advanceBalance: customerAdvanceBalance(advances, customer.id),
    }));
  }, [customersQuery.data, advancesQuery.data]);
}

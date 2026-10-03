import { asEntityId } from "@/domain/shared";
import { customerService } from "@/mocks/customers/service";
import { vehicleService } from "@/mocks/vehicles/service";
import { workOrderService } from "@/mocks/work-orders/service";

export type GlobalSearchHit = {
  label: string;
  href: string;
  kind: "vehicle" | "work_order" | "customer";
};

function normalizeQuery(raw: string): string {
  return raw.trim();
}

export async function resolveGlobalSearch(
  raw: string,
): Promise<GlobalSearchHit | null> {
  const query = normalizeQuery(raw);
  if (!query) {
    return null;
  }

  const upper = query.toUpperCase();
  const plateCandidate = upper.replace(/\s+/g, "");

  const vehicleByPlate = await vehicleService.getByPlate(plateCandidate);
  if (vehicleByPlate) {
    return {
      kind: "vehicle",
      label: `Vehículo ${vehicleByPlate.plate}`,
      href: `/taller/vehiculos/${vehicleByPlate.id}`,
    };
  }

  const orders = (await workOrderService.list({ search: query, pageSize: 5 }))
    .items;
  const orderMatch =
    orders.find((order) => order.code.toUpperCase() === upper) ?? orders[0];
  if (orderMatch) {
    return {
      kind: "work_order",
      label: `Orden ${orderMatch.code}`,
      href: `/taller/ordenes/${orderMatch.id}`,
    };
  }

  const customers = await customerService.searchByDocOrName(query, {
    pageSize: 1,
  });
  const customer = customers.items[0];
  if (customer) {
    return {
      kind: "customer",
      label: customer.displayName,
      href: `/clientes/${customer.id}`,
    };
  }

  const vehicleById = await vehicleService.getById(asEntityId(query));
  if (vehicleById) {
    return {
      kind: "vehicle",
      label: `Vehículo ${vehicleById.plate}`,
      href: `/taller/vehiculos/${vehicleById.id}`,
    };
  }

  return null;
}

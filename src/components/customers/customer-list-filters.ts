import { CustomerStatus, type Customer } from "@/domain/customers/types";
import { asEntityId, type BranchRef } from "@/domain/shared";

export const CUSTOMER_BRANCHES: readonly BranchRef[] = [
  { id: asEntityId("BR-LM"), name: "Sede La Molina" },
  { id: asEntityId("BR-SU"), name: "Sede Surco" },
  { id: asEntityId("BR-SM"), name: "Sede San Miguel" },
];

export type CustomerListFilters = {
  readonly search: string;
  readonly branchId: string;
  readonly status: string;
};

export const EMPTY_CUSTOMER_FILTERS: CustomerListFilters = {
  search: "",
  branchId: "all",
  status: "all",
};

export function filterCustomers(
  items: readonly Customer[],
  filters: CustomerListFilters,
): Customer[] {
  const branchId = filters.branchId;
  const status = filters.status;

  return items.filter((customer) => {
    if (branchId !== "all" && customer.preferredBranch?.id !== branchId) {
      return false;
    }

    if (status !== "all" && customer.status !== status) {
      return false;
    }

    return true;
  });
}

export function customerStatusLabel(status: CustomerStatus): string {
  switch (status) {
    case CustomerStatus.Active:
      return "Activo";
    case CustomerStatus.Inactive:
      return "Inactivo";
    case CustomerStatus.Archived:
      return "Archivado";
  }
}

export function customerStatusVariant(
  status: CustomerStatus,
): "success" | "warning" | "neutral" {
  switch (status) {
    case CustomerStatus.Active:
      return "success";
    case CustomerStatus.Inactive:
      return "warning";
    case CustomerStatus.Archived:
      return "neutral";
  }
}

export function customerTypeLabel(type: Customer["type"]): string {
  return type === "empresa" ? "Empresa" : "Persona";
}

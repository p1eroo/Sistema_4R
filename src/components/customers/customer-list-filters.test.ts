import { describe, expect, it } from "vitest";

import {
  CustomerStatus,
  CustomerType,
  DocumentType,
} from "@/domain/customers/types";
import { asEntityId } from "@/domain/shared";

import {
  EMPTY_CUSTOMER_FILTERS,
  filterCustomers,
} from "./customer-list-filters";

function customer(overrides: {
  id: string;
  branchId?: string;
  status?: CustomerStatus;
}) {
  return {
    id: asEntityId(overrides.id),
    type: CustomerType.Persona,
    documentType: DocumentType.DNI,
    documentNumber: "45678912",
    displayName: "Lucía Ramos",
    phones: [],
    status: overrides.status ?? CustomerStatus.Active,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...(overrides.branchId
      ? {
          preferredBranch: {
            id: asEntityId(overrides.branchId),
            name: "Sede",
          },
        }
      : {}),
  };
}

describe("filterCustomers", () => {
  const items = [
    customer({ id: "CUS-0001", branchId: "BR-LM" }),
    customer({
      id: "CUS-0002",
      branchId: "BR-SU",
      status: CustomerStatus.Archived,
    }),
  ];

  it("returns all items when filters are empty", () => {
    expect(filterCustomers(items, EMPTY_CUSTOMER_FILTERS)).toHaveLength(2);
  });

  it("filters by preferred branch", () => {
    const result = filterCustomers(items, {
      ...EMPTY_CUSTOMER_FILTERS,
      branchId: "BR-LM",
    });

    expect(result.map((item) => item.id)).toEqual(["CUS-0001"]);
  });

  it("filters by status", () => {
    const result = filterCustomers(items, {
      ...EMPTY_CUSTOMER_FILTERS,
      status: CustomerStatus.Archived,
    });

    expect(result.map((item) => item.id)).toEqual(["CUS-0002"]);
  });
});

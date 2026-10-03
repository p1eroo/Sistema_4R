import { describe, expect, it } from "vitest";

import { asEntityId } from "@/domain/shared";
import { WorkOrderStatus } from "@/domain/work-orders/status";

import {
  EMPTY_WORK_ORDER_FILTERS,
  filterWorkOrders,
  type WorkOrderListRow,
} from "./work-order-list-filters";

function row(
  overrides: Partial<WorkOrderListRow> & Pick<WorkOrderListRow, "id" | "code">,
): WorkOrderListRow {
  return {
    status: WorkOrderStatus.Quality,
    customerName: "Lucía Ramos",
    plate: "ABC-123",
    vehicleLabel: "Toyota Corolla 2021 · ABC-123",
    branchId: asEntityId("BR-LM"),
    reason: "Control de calidad final",
    ...overrides,
  };
}

describe("filterWorkOrders", () => {
  const items = [
    row({
      id: asEntityId("WO-2026-0184"),
      code: "OT-2026-0184",
    }),
    row({
      id: asEntityId("WO-2026-0182"),
      code: "OT-2026-0182",
      status: WorkOrderStatus.Diagnosis,
      customerName: "Carlos Mendoza",
      plate: "B4X-521",
      vehicleLabel: "Hyundai Tucson 2019 · B4X-521",
      branchId: asEntityId("BR-SU"),
    }),
  ];

  it("returns all items when filters are empty", () => {
    expect(filterWorkOrders(items, EMPTY_WORK_ORDER_FILTERS)).toHaveLength(2);
  });

  it("filters by Control status", () => {
    const result = filterWorkOrders(items, {
      ...EMPTY_WORK_ORDER_FILTERS,
      status: WorkOrderStatus.Quality,
    });

    expect(result.map((item) => item.code)).toEqual(["OT-2026-0184"]);
  });

  it("searches by plate or code", () => {
    expect(
      filterWorkOrders(items, {
        ...EMPTY_WORK_ORDER_FILTERS,
        search: "abc-123",
      }).map((item) => item.code),
    ).toEqual(["OT-2026-0184"]);
    expect(
      filterWorkOrders(items, {
        ...EMPTY_WORK_ORDER_FILTERS,
        search: "0182",
      }).map((item) => item.code),
    ).toEqual(["OT-2026-0182"]);
  });
});

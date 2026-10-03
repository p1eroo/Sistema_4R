import { beforeEach, describe, expect, it } from "vitest";

import {
  EstimateLineKind,
  EstimateStatus,
  type EstimateLine,
} from "@/domain/estimates";
import { asEntityId, money } from "@/domain/shared";
import {
  EstimateNotFoundError,
  EstimateValidationError,
  createEstimateService,
  type EstimateService,
} from "@/mocks/estimates/service";

let service: EstimateService;

beforeEach(() => {
  service = createEstimateService();
});

function line(amount: number, quantity = 1): EstimateLine {
  return {
    id: asEntityId("NEW-L1"),
    kind: EstimateLineKind.Labor,
    name: "Servicio",
    quantity,
    unitPrice: money(amount),
  };
}

describe("estimateService reads", () => {
  it("sums pending approvals to the dashboard amount", async () => {
    const total = await service.sumPendingApproval();

    expect(total.amount).toBe(894000);
  });

  it("lists pending estimates", async () => {
    const result = await service.listByStatus(EstimateStatus.PendingApproval);

    expect(result.pagination.total).toBe(3);
  });

  it("gets a stored estimate with computed totals", async () => {
    const estimate = await service.getById(asEntityId("EST-0001"));

    expect(estimate?.subtotal.amount).toBe(250000);
    expect(estimate?.igv.amount).toBe(45000);
    expect(estimate?.total.amount).toBe(295000);
  });
});

describe("estimateService.create", () => {
  it("creates a draft estimate with computed totals", async () => {
    const created = await service.create({
      customerId: asEntityId("CUS-0007"),
      vehicleId: asEntityId("VEH-0002"),
      lines: [line(100000)],
    });

    expect(created.id).toBe("EST-0007");
    expect(created.code).toMatch(/^EST-\d{4}-0007$/);
    expect(created.status).toBe(EstimateStatus.Draft);
    expect(created.total.amount).toBe(118000);
  });

  it("rejects an estimate without lines", async () => {
    await expect(
      service.create({
        customerId: asEntityId("CUS-0007"),
        vehicleId: asEntityId("VEH-0002"),
        lines: [],
      }),
    ).rejects.toBeInstanceOf(EstimateValidationError);
  });
});

describe("estimateService.updateStatus", () => {
  it("approves an estimate", async () => {
    const approved = await service.updateStatus(
      asEntityId("EST-0001"),
      EstimateStatus.Approved,
    );

    expect(approved.status).toBe(EstimateStatus.Approved);
  });

  it("rejects unknown ids", async () => {
    await expect(
      service.updateStatus(asEntityId("EST-9999"), EstimateStatus.Approved),
    ).rejects.toBeInstanceOf(EstimateNotFoundError);
  });
});

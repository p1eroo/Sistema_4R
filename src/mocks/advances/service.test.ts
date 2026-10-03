import { describe, expect, it } from "vitest";

import { AdvanceStatus } from "@/domain/advances";
import { PaymentMethod } from "@/domain/pos";
import { asEntityId, money } from "@/domain/shared";
import {
  AdvanceValidationError,
  createAdvanceService,
} from "@/mocks/advances/service";

const LUCIA = asEntityId("CUS-0001");

describe("advanceService balances", () => {
  it("ignores cancelled advances and subtracts applications", async () => {
    const service = createAdvanceService();

    expect((await service.getCustomerBalance(LUCIA)).amount).toBe(30000);
    expect(
      (await service.getCustomerBalance(asEntityId("CUS-0002"))).amount,
    ).toBe(35000);
    expect(
      (await service.getCustomerBalance(asEntityId("CUS-0005"))).amount,
    ).toBe(0);
  });
});

describe("advanceService.create", () => {
  it("creates an active advance with the next code", async () => {
    const service = createAdvanceService();
    const created = await service.create({
      customerId: LUCIA,
      branchId: asEntityId("BR-LM"),
      method: PaymentMethod.Cash,
      amount: money(10000),
    });

    expect(created.code).toMatch(/^ANT-\d{4}-0006$/);
    expect(created.status).toBe(AdvanceStatus.Active);
    expect((await service.getCustomerBalance(LUCIA)).amount).toBe(40000);
  });

  it("rejects a zero amount", async () => {
    const service = createAdvanceService();

    await expect(
      service.create({
        customerId: LUCIA,
        branchId: asEntityId("BR-LM"),
        method: PaymentMethod.Cash,
        amount: money(0),
      }),
    ).rejects.toBeInstanceOf(AdvanceValidationError);
  });
});

describe("advanceService.apply", () => {
  it("consumes balance and marks exhausted advances as applied", async () => {
    const service = createAdvanceService();
    const [updated] = await service.apply({
      customerId: LUCIA,
      amount: money(30000),
      reference: "F001-01000",
    });

    expect(updated?.status).toBe(AdvanceStatus.Applied);
    expect((await service.getCustomerBalance(LUCIA)).amount).toBe(0);
  });

  it("rejects applying more than the available balance", async () => {
    const service = createAdvanceService();

    await expect(
      service.apply({
        customerId: LUCIA,
        amount: money(30001),
        reference: "F001-01000",
      }),
    ).rejects.toBeInstanceOf(AdvanceValidationError);
  });
});

describe("advanceService.archive", () => {
  it("cancels an unused advance but not an applied one", async () => {
    const service = createAdvanceService();
    const cancelled = await service.archive(asEntityId("ADV-0004"), {
      reason: "Devolución al cliente",
    });
    expect(cancelled.status).toBe(AdvanceStatus.Cancelled);

    await expect(
      service.archive(asEntityId("ADV-0002"), { reason: "Error de registro" }),
    ).rejects.toBeInstanceOf(AdvanceValidationError);
  });
});

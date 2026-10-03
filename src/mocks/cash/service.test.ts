import { describe, expect, it } from "vitest";

import { CashMovementType, CashSessionStatus } from "@/domain/cash";
import { limaDateTimeIso, todayDateKey } from "@/domain/appointments";
import { asEntityId, money } from "@/domain/shared";
import { CashValidationError, createCashService } from "@/mocks/cash/service";

const TODAY = todayDateKey();

describe("cashService.getCurrent", () => {
  it("returns the open La Molina shift starting at 08:00", async () => {
    const service = createCashService();
    const current = await service.getCurrent("molina");

    expect(current?.status).toBe(CashSessionStatus.Open);
    expect(current?.openedAt).toBe(limaDateTimeIso(TODAY, "08:00"));
    expect(current?.openingAmount.amount).toBe(50000);
    expect(current?.expectedAmount.amount).toBe(174500);
    expect(current?.movementCount).toBe(2);
  });
});

describe("cashService.open", () => {
  it("opens a session and rejects a second one for the same branch", async () => {
    const service = createCashService();
    const opened = await service.open({
      branchId: asEntityId("BR-SU"),
      branchSlug: "surco",
      openingAmount: money(30000),
    });

    expect(opened.status).toBe(CashSessionStatus.Open);
    expect(opened.code).toBe("CAJ-2026-0003");

    await expect(
      service.open({
        branchId: asEntityId("BR-SU"),
        branchSlug: "surco",
        openingAmount: money(10000),
      }),
    ).rejects.toBeInstanceOf(CashValidationError);
  });
});

describe("cashService.close", () => {
  it("closes a session and computes the difference", async () => {
    const service = createCashService();
    const closed = await service.close(asEntityId("CS-0001"), {
      closingAmount: money(174500),
    });

    expect(closed.status).toBe(CashSessionStatus.Closed);
    expect(closed.closedAt).toBeTruthy();

    const summary = await service.getCurrent("molina");
    expect(summary).toBeUndefined();
  });

  it("does not close twice", async () => {
    const service = createCashService();
    await service.close(asEntityId("CS-0001"), {
      closingAmount: money(174500),
    });

    await expect(
      service.close(asEntityId("CS-0001"), { closingAmount: money(174500) }),
    ).rejects.toBeInstanceOf(CashValidationError);

    await expect(
      service.addMovement(asEntityId("CS-0001"), {
        type: CashMovementType.Sale,
        amount: money(1000),
      }),
    ).rejects.toBeInstanceOf(CashValidationError);
  });
});

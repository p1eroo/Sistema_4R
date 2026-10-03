import { describe, expect, it } from "vitest";

import { PromotionScope } from "@/domain/pricing/types";
import type { EntityId } from "@/domain/shared";
import {
  appointmentSeed,
  baySeed,
  branchSeed,
  brandSeed,
  cashSessionSeed,
  categorySeed,
  customerSeed,
  deliverySeed,
  diagnosticSeed,
  estimateSeed,
  expenseSeed,
  inspectionSeed,
  lineSeed,
  posTicketSeed,
  productSeed,
  promotionSeed,
  purchaseOrderSeed,
  purchaseSeed,
  qualitySeed,
  quoteSeed,
  receptionSeed,
  roleSeed,
  serviceSeed,
  stockBalanceSeed,
  stockMovementSeed,
  supplierSeed,
  userSeed,
  vehicleSeed,
  workOrderSeed,
} from "@/mocks/seed";

const customerIds = new Set(customerSeed.map((item) => item.id));
const vehicleIds = new Set(vehicleSeed.map((item) => item.id));
const branchIds = new Set(branchSeed.map((item) => item.id));
const userIds = new Set(userSeed.map((item) => item.id));
const roleIds = new Set(roleSeed.map((item) => item.id));
const productIds = new Set(productSeed.map((item) => item.id));
const serviceIds = new Set(serviceSeed.map((item) => item.id));
const supplierIds = new Set(supplierSeed.map((item) => item.id));
const categoryIds = new Set(categorySeed.map((item) => item.id));
const brandIds = new Set(brandSeed.map((item) => item.id));
const receptionIds = new Set(receptionSeed.map((item) => item.id));
const workOrderIds = new Set(workOrderSeed.map((item) => item.id));

function expectInside(
  ids: readonly string[],
  valid: Set<string>,
  label: string,
): void {
  const orphans = ids.filter((id) => !valid.has(id));
  expect(orphans, `${label} huérfanos: ${orphans.join(", ")}`).toEqual([]);
}

describe("seed referential integrity", () => {
  it("links vehicles to existing customers and branches", () => {
    expectInside(
      vehicleSeed.map((vehicle) => vehicle.customerId),
      customerIds,
      "vehicle.customerId",
    );
    expectInside(
      vehicleSeed
        .map((vehicle) => vehicle.usualBranch?.id)
        .filter((id): id is EntityId => id !== undefined),
      branchIds,
      "vehicle.usualBranch",
    );
  });

  it("links receptions and inspections", () => {
    expectInside(
      receptionSeed.map((reception) => reception.customerId),
      customerIds,
      "reception.customerId",
    );
    expectInside(
      receptionSeed.map((reception) => reception.vehicleId),
      vehicleIds,
      "reception.vehicleId",
    );
    expectInside(
      receptionSeed.map((reception) => reception.branchId),
      branchIds,
      "reception.branchId",
    );
    expectInside(
      receptionSeed
        .map((reception) => reception.advisorId)
        .filter((id): id is EntityId => id !== undefined),
      userIds,
      "reception.advisorId",
    );

    expectInside(
      inspectionSeed.map((inspection) => inspection.receptionId),
      receptionIds,
      "inspection.receptionId",
    );
    expectInside(
      inspectionSeed.map((inspection) => inspection.vehicleId),
      vehicleIds,
      "inspection.vehicleId",
    );
  });

  it("links work orders, estimates and diagnostics", () => {
    expectInside(
      workOrderSeed.map((order) => order.customerId),
      customerIds,
      "workOrder.customerId",
    );
    expectInside(
      workOrderSeed.map((order) => order.vehicleId),
      vehicleIds,
      "workOrder.vehicleId",
    );
    expectInside(
      workOrderSeed.map((order) => order.branchId),
      branchIds,
      "workOrder.branchId",
    );
    expectInside(
      workOrderSeed
        .map((order) => order.technicianId)
        .filter((id): id is EntityId => id !== undefined),
      userIds,
      "workOrder.technicianId",
    );
    expectInside(
      workOrderSeed
        .map((order) => order.receptionId)
        .filter((id): id is EntityId => id !== undefined),
      receptionIds,
      "workOrder.receptionId",
    );

    expectInside(
      estimateSeed.map((estimate) => estimate.customerId),
      customerIds,
      "estimate.customerId",
    );
    expectInside(
      estimateSeed.map((estimate) => estimate.vehicleId),
      vehicleIds,
      "estimate.vehicleId",
    );
    expectInside(
      estimateSeed
        .map((estimate) => estimate.workOrderId)
        .filter((id): id is EntityId => id !== undefined),
      workOrderIds,
      "estimate.workOrderId",
    );

    expectInside(
      diagnosticSeed.map((diagnostic) => diagnostic.workOrderId),
      workOrderIds,
      "diagnostic.workOrderId",
    );
  });

  it("links appointments, cash and POS", () => {
    expectInside(
      appointmentSeed.map((appointment) => appointment.customerId),
      customerIds,
      "appointment.customerId",
    );
    expectInside(
      appointmentSeed.map((appointment) => appointment.vehicleId),
      vehicleIds,
      "appointment.vehicleId",
    );
    expectInside(
      appointmentSeed.map((appointment) => appointment.branchId),
      branchIds,
      "appointment.branchId",
    );

    expectInside(
      cashSessionSeed.map((session) => session.branchId),
      branchIds,
      "cashSession.branchId",
    );
    expectInside(
      cashSessionSeed
        .map((session) => session.cashierId)
        .filter((id): id is EntityId => id !== undefined),
      userIds,
      "cashSession.cashierId",
    );

    expectInside(
      posTicketSeed.map((ticket) => ticket.branchId),
      branchIds,
      "posTicket.branchId",
    );
    expectInside(
      posTicketSeed
        .flatMap((ticket) => ticket.lines)
        .map((line) => line.productId)
        .filter((id): id is EntityId => id !== undefined),
      productIds,
      "posTicket.line.productId",
    );
    expectInside(
      posTicketSeed
        .flatMap((ticket) => ticket.lines)
        .map((line) => line.serviceId)
        .filter((id): id is EntityId => id !== undefined),
      serviceIds,
      "posTicket.line.serviceId",
    );
  });

  it("links inventory balances and movements", () => {
    expectInside(
      stockBalanceSeed.map((balance) => balance.productId),
      productIds,
      "stockBalance.productId",
    );
    expectInside(
      stockBalanceSeed.map((balance) => balance.branchId),
      branchIds,
      "stockBalance.branchId",
    );
    expectInside(
      stockMovementSeed.map((movement) => movement.productId),
      productIds,
      "stockMovement.productId",
    );
    expectInside(
      stockMovementSeed.map((movement) => movement.branchId),
      branchIds,
      "stockMovement.branchId",
    );
  });

  it("links purchases and catalog", () => {
    const purchases = [...purchaseSeed, ...purchaseOrderSeed, ...quoteSeed];
    expectInside(
      purchases.map((document) => document.supplierId),
      supplierIds,
      "purchase.supplierId",
    );
    expectInside(
      purchases.map((document) => document.branchId),
      branchIds,
      "purchase.branchId",
    );
    expectInside(
      purchases
        .flatMap((document) => document.lines)
        .map((line) => line.productId)
        .filter((id): id is EntityId => id !== undefined),
      productIds,
      "purchase.line.productId",
    );
    expectInside(
      expenseSeed.map((expense) => expense.branchId),
      branchIds,
      "expense.branchId",
    );

    expectInside(
      lineSeed
        .map((line) => line.brandId)
        .filter((id): id is EntityId => id !== undefined),
      brandIds,
      "catalogLine.brandId",
    );
    expectInside(
      lineSeed
        .map((line) => line.categoryId)
        .filter((id): id is EntityId => id !== undefined),
      categoryIds,
      "catalogLine.categoryId",
    );
  });

  it("links users to roles and branches", () => {
    expectInside(
      userSeed.flatMap((user) => user.roleIds),
      roleIds,
      "user.roleIds",
    );
    expectInside(
      userSeed.flatMap((user) => user.branchIds),
      branchIds,
      "user.branchIds",
    );
  });

  it("links promotions to their targets", () => {
    for (const promotion of promotionSeed) {
      const targets = promotion.targetIds ?? [];
      if (promotion.scope === PromotionScope.Services) {
        expectInside(targets, serviceIds, `promotion ${promotion.code}`);
      } else if (promotion.scope === PromotionScope.Products) {
        expectInside(targets, productIds, `promotion ${promotion.code}`);
      } else if (promotion.scope === PromotionScope.Category) {
        expectInside(targets, categoryIds, `promotion ${promotion.code}`);
      }
    }
  });

  it("links workshop operations to work orders", () => {
    expectInside(
      baySeed
        .map((bay) => bay.currentWorkOrderId)
        .filter((id): id is EntityId => id !== undefined),
      workOrderIds,
      "bay.currentWorkOrderId",
    );
    expectInside(
      qualitySeed.map((check) => check.workOrderId),
      workOrderIds,
      "quality.workOrderId",
    );
    expectInside(
      deliverySeed.map((delivery) => delivery.workOrderId),
      workOrderIds,
      "delivery.workOrderId",
    );
    expectInside(
      deliverySeed.map((delivery) => delivery.vehicleId),
      vehicleIds,
      "delivery.vehicleId",
    );
  });
});

describe("canonical dashboard entities", () => {
  it("keeps the reference documents and plates", () => {
    expect(workOrderSeed.some((order) => order.code === "OT-2026-0184")).toBe(
      true,
    );
    expect(
      posTicketSeed.some((ticket) => ticket.documentNumber === "F001-00982"),
    ).toBe(true);

    const plates = vehicleSeed.map((vehicle) => vehicle.plate);
    for (const plate of ["ABC-123", "B4X-521", "F6T-884"]) {
      expect(plates).toContain(plate);
    }

    const slugs = branchSeed.map((branch) => branch.slug);
    expect(slugs).toEqual(
      expect.arrayContaining(["molina", "surco", "san-miguel"]),
    );

    expect(userSeed.some((user) => user.fullName === "Carlos Mendoza")).toBe(
      true,
    );
  });
});

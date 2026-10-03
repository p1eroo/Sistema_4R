import { describe, expect, it } from "vitest";

import { CustomerType, DocumentType } from "@/domain/customers/types";
import {
  createReceptionChecklist,
  FuelLevel,
  ReceptionStatus,
} from "@/domain/reception";
import { PaymentMethod, PosLineKind, PosStatus } from "@/domain/pos";
import { asEntityId, money } from "@/domain/shared";
import { FuelType } from "@/domain/vehicles/types";
import { WorkOrderStatus } from "@/domain/work-orders/status";
import { customerService } from "@/mocks/customers/service";
import { createPosService } from "@/mocks/pos/service";
import { receptionService } from "@/mocks/reception/service";
import { vehicleService } from "@/mocks/vehicles/service";
import { workOrderService } from "@/mocks/work-orders/service";

function uniquePlate(): string {
  const suffix = String(Date.now() % 1000).padStart(3, "0");
  return `Z9K-${suffix}`;
}

describe("workshop flow integration", () => {
  it("ingresa un vehículo nuevo, cierra la OT y cobra en POS", async () => {
    const plate = uniquePlate();
    const customer = await customerService.create({
      type: CustomerType.Persona,
      documentType: DocumentType.DNI,
      documentNumber: String(90000000 + (Date.now() % 999999)),
      firstName: "Flujo",
      lastName: "Integración",
      phones: [{ label: "Móvil", number: "999888777" }],
      email: "flujo.integracion@4ruedas.pe",
    });

    const vehicle = await vehicleService.create({
      customerId: customer.id,
      plate,
      brand: "Toyota",
      model: "Yaris",
      year: 2024,
      color: "Blanco",
      fuelType: FuelType.Gasolina,
      odometerKm: 5000,
    });

    const draft = await receptionService.createDraft({
      customerId: customer.id,
      vehicleId: vehicle.id,
      branchId: asEntityId("BR-LM"),
      reason: "Ingreso flujo punta a punta",
    });

    await receptionService.updateStep(draft.id, {
      step: "checklist",
      values: {
        odometerKm: 5010,
        fuelLevel: FuelLevel.Half,
        belongings: [],
        checklist: createReceptionChecklist(["documentos"]),
      },
    });

    const completed = await receptionService.complete(draft.id);
    expect(completed.status).toBe(ReceptionStatus.Completed);

    const workOrder = await workOrderService.createFromReception(draft.id);
    expect(workOrder.status).toBe(WorkOrderStatus.Diagnosis);
    expect(workOrder.vehicleId).toBe(vehicle.id);

    const statuses: WorkOrderStatus[] = [
      WorkOrderStatus.InRepair,
      WorkOrderStatus.Quality,
      WorkOrderStatus.Ready,
      WorkOrderStatus.Delivered,
    ];

    let current = workOrder;
    for (const status of statuses) {
      current = await workOrderService.updateStatus(current.id, status);
    }

    expect(current.status).toBe(WorkOrderStatus.Delivered);

    const listed = (
      await workOrderService.list({ search: current.code, pageSize: 5 })
    ).items;
    expect(listed.some((item) => item.id === current.id)).toBe(true);

    const pos = createPosService();
    const ticket = await pos.createTicket({ branchId: asEntityId("BR-LM") });
    const withLine = await pos.addLine(ticket.id, {
      kind: PosLineKind.Service,
      description: `Cierre ${current.code}`,
      quantity: 1,
      unitPrice: money(15000),
    });

    const paid = await pos.pay(withLine.id, [
      { method: PaymentMethod.Cash, amount: withLine.totals.total },
    ]);

    expect(paid.status).toBe(PosStatus.Paid);
  });
});

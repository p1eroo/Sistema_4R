import { ReceptionStatus, type Reception } from "@/domain/reception";
import { receptionCompleteSchema } from "@/domain/reception/schemas";
import type { EntityId } from "@/domain/shared";
import type { WorkOrder } from "@/domain/work-orders";

export function receptionCompletePayload(reception: Reception) {
  return {
    customerId: reception.customerId,
    vehicleId: reception.vehicleId,
    branchId: reception.branchId,
    ...(reception.advisorId !== undefined
      ? { advisorId: reception.advisorId }
      : {}),
    reason: reception.reason,
    odometerKm: reception.odometerKm,
    fuelLevel: reception.fuelLevel,
    belongings: [...reception.belongings],
    checklist: [...reception.checklist],
    ...(reception.observations !== undefined
      ? { observations: reception.observations }
      : {}),
  };
}

export function receptionConfirmIssues(
  reception: Reception | null | undefined,
): string[] {
  if (!reception) {
    return ["Guarda el cliente y el vehículo primero."];
  }

  if (reception.status === ReceptionStatus.Cancelled) {
    return ["No se puede confirmar una recepción cancelada."];
  }

  const parsed = receptionCompleteSchema.safeParse(
    receptionCompletePayload(reception),
  );
  const issues = parsed.success
    ? []
    : parsed.error.issues.map((issue) => issue.message);

  if (!reception.checklist.some((item) => item.checked)) {
    issues.push("Marca al menos un ítem del checklist para confirmar.");
  }

  return [...new Set(issues)];
}

export function findWorkOrderByReception(
  orders: readonly WorkOrder[],
  receptionId: EntityId,
): WorkOrder | undefined {
  return orders.find((order) => order.receptionId === receptionId);
}

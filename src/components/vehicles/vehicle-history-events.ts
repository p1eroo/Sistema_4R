import {
  APPOINTMENT_SERVICE_LABELS,
  APPOINTMENT_STATUS_LABELS,
  type Appointment,
} from "@/domain/appointments";
import {
  InspectionStatus,
  inspectionDamageCount,
  type Inspection,
} from "@/domain/inspections";
import type { Reception } from "@/domain/reception";
import { ReceptionStatus } from "@/domain/reception";
import type { EntityId } from "@/domain/shared";
import { WORK_ORDER_STATUS_LABELS, type WorkOrder } from "@/domain/work-orders";
import { DELIVERY_STATUS_LABELS, type Delivery } from "@/domain/workshop-ops";

export enum VehicleHistoryKind {
  Reception = "reception",
  Inspection = "inspection",
  WorkOrder = "work_order",
  Delivery = "delivery",
  Appointment = "appointment",
}

export type VehicleHistoryEvent = {
  readonly id: string;
  readonly kind: VehicleHistoryKind;
  readonly at: string;
  readonly title: string;
  readonly meta: string;
  readonly href:
    | { readonly to: "/taller/recepcion" }
    | { readonly to: "/taller/inspecciones/$id"; readonly id: string }
    | { readonly to: "/taller/ordenes/$id"; readonly id: string }
    | { readonly to: "/taller/entregas" }
    | { readonly to: "/taller/citas" };
};

const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  [InspectionStatus.Pending]: "Pendiente",
  [InspectionStatus.InProgress]: "En curso",
  [InspectionStatus.Completed]: "Completada",
};

const RECEPTION_STATUS_LABELS: Record<ReceptionStatus, string> = {
  [ReceptionStatus.Draft]: "Borrador",
  [ReceptionStatus.InProgress]: "En progreso",
  [ReceptionStatus.Completed]: "Completada",
  [ReceptionStatus.Cancelled]: "Cancelada",
};

export function buildVehicleHistory({
  vehicleId,
  receptions,
  inspections,
  workOrders,
  deliveries,
  appointments,
}: {
  vehicleId: EntityId | string;
  receptions: readonly Reception[];
  inspections: readonly Inspection[];
  workOrders: readonly WorkOrder[];
  deliveries: readonly Delivery[];
  appointments?: readonly Appointment[];
}): VehicleHistoryEvent[] {
  const events: VehicleHistoryEvent[] = [];

  for (const reception of receptions) {
    if (reception.vehicleId !== vehicleId) {
      continue;
    }
    events.push({
      id: reception.id,
      kind: VehicleHistoryKind.Reception,
      at: reception.receivedAt ?? reception.createdAt,
      title: `Recepción ${reception.code}`,
      meta: `${RECEPTION_STATUS_LABELS[reception.status]} · ${reception.reason}`,
      href: { to: "/taller/recepcion" },
    });
  }

  for (const inspection of inspections) {
    if (inspection.vehicleId !== vehicleId) {
      continue;
    }
    events.push({
      id: inspection.id,
      kind: VehicleHistoryKind.Inspection,
      at: inspection.updatedAt,
      title: `Inspección ${inspection.id}`,
      meta: `${INSPECTION_STATUS_LABELS[inspection.status]} · ${inspectionDamageCount(
        inspection,
      )} daños`,
      href: { to: "/taller/inspecciones/$id", id: inspection.id },
    });
  }

  for (const order of workOrders) {
    if (order.vehicleId !== vehicleId) {
      continue;
    }
    events.push({
      id: order.id,
      kind: VehicleHistoryKind.WorkOrder,
      at: order.openedAt,
      title: `OT ${order.code}`,
      meta: `${WORK_ORDER_STATUS_LABELS[order.status]} · ${order.reason}`,
      href: { to: "/taller/ordenes/$id", id: order.id },
    });
  }

  for (const delivery of deliveries) {
    if (delivery.vehicleId !== vehicleId) {
      continue;
    }
    events.push({
      id: delivery.id,
      kind: VehicleHistoryKind.Delivery,
      at: delivery.deliveredAt ?? delivery.scheduledAt ?? delivery.createdAt,
      title: `Entrega ${delivery.id}`,
      meta: DELIVERY_STATUS_LABELS[delivery.status],
      href: { to: "/taller/entregas" },
    });
  }

  for (const appointment of appointments ?? []) {
    if (appointment.vehicleId !== vehicleId) {
      continue;
    }
    events.push({
      id: appointment.id,
      kind: VehicleHistoryKind.Appointment,
      at: appointment.scheduledAt,
      title: `Cita ${appointment.id}`,
      meta: `${APPOINTMENT_STATUS_LABELS[appointment.status]} · ${
        APPOINTMENT_SERVICE_LABELS[appointment.serviceType]
      }`,
      href: { to: "/taller/citas" },
    });
  }

  return events.sort((left, right) => right.at.localeCompare(left.at));
}

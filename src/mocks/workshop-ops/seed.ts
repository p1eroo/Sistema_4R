import { limaDateTimeIso, todayDateKey } from "@/domain/appointments";
import {
  BayStatus,
  createDeliveryChecklist,
  createQualityChecklist,
  DeliveryStatus,
  QualityResult,
  WORKSHOP_BAY_CAPACITY,
  type Delivery,
  type QualityCheck,
  type WorkshopBay,
} from "@/domain/workshop-ops";
import { asEntityId } from "@/domain/shared";

const SEED_UPDATED_AT = "2026-02-20T08:30:00.000Z";
const BRANCHES = ["BR-LM", "BR-SU", "BR-SM"] as const;

export const baySeed: WorkshopBay[] = Array.from(
  { length: WORKSHOP_BAY_CAPACITY },
  (_, index) => {
    const number = index + 1;
    const assignedWorkOrder =
      index === 0 ? "WO-2026-0187" : index === 1 ? "WO-2026-0200" : undefined;

    return {
      id: asEntityId(`BAY-${String(number).padStart(4, "0")}`),
      code: `BAY-${String(number).padStart(2, "0")}`,
      name: `Bahía ${number}`,
      branchId: asEntityId(BRANCHES[index % BRANCHES.length] ?? "BR-LM"),
      status: assignedWorkOrder ? BayStatus.Occupied : BayStatus.Free,
      ...(assignedWorkOrder !== undefined
        ? { currentWorkOrderId: asEntityId(assignedWorkOrder) }
        : {}),
      updatedAt: SEED_UPDATED_AT,
    };
  },
);

export const qualitySeed: QualityCheck[] = [
  {
    id: asEntityId("QC-0001"),
    workOrderId: asEntityId("WO-2026-0184"),
    result: QualityResult.Fail,
    items: createQualityChecklist([]),
    failureReasons: ["Prueba de ruta pendiente de completar."],
    checkedBy: asEntityId("USR-0001"),
    checkedAt: SEED_UPDATED_AT,
    notes: "Control de calidad en curso.",
  },
];

const TODAY = todayDateKey();

type DeliverySeed = {
  id: string;
  workOrderId: string;
  customerId: string;
  vehicleId: string;
  branchId: string;
  time: string;
};

function delivery(seed: DeliverySeed): Delivery {
  return {
    id: asEntityId(seed.id),
    workOrderId: asEntityId(seed.workOrderId),
    customerId: asEntityId(seed.customerId),
    vehicleId: asEntityId(seed.vehicleId),
    branchId: asEntityId(seed.branchId),
    status: DeliveryStatus.Scheduled,
    scheduledAt: limaDateTimeIso(TODAY, seed.time),
    checklist: createDeliveryChecklist(),
    createdAt: SEED_UPDATED_AT,
    updatedAt: SEED_UPDATED_AT,
  };
}

export const deliverySeed: Delivery[] = [
  delivery({
    id: "DLV-0001",
    workOrderId: "WO-2026-0184",
    customerId: "CUS-0001",
    vehicleId: "VEH-0001",
    branchId: "BR-LM",
    time: "11:30",
  }),
  delivery({
    id: "DLV-0002",
    workOrderId: "WO-2026-0195",
    customerId: "CUS-0007",
    vehicleId: "VEH-0002",
    branchId: "BR-LM",
    time: "14:00",
  }),
  delivery({
    id: "DLV-0003",
    workOrderId: "WO-2026-0193",
    customerId: "CUS-0005",
    vehicleId: "VEH-0003",
    branchId: "BR-SU",
    time: "16:30",
  }),
];

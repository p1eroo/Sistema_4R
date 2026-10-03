import { asEntityId } from "@/domain/shared";
import { WorkOrderPriority, type WorkOrder } from "@/domain/work-orders";
import { WorkOrderStatus } from "@/domain/work-orders/status";

const POOL = [
  { customerId: "CUS-0001", vehicleId: "VEH-0001", branchId: "BR-LM" },
  { customerId: "CUS-0002", vehicleId: "VEH-0004", branchId: "BR-SU" },
  { customerId: "CUS-0003", vehicleId: "VEH-0005", branchId: "BR-LM" },
  { customerId: "CUS-0004", vehicleId: "VEH-0006", branchId: "BR-SM" },
  { customerId: "CUS-0005", vehicleId: "VEH-0003", branchId: "BR-SU" },
  { customerId: "CUS-0006", vehicleId: "VEH-0007", branchId: "BR-SM" },
  { customerId: "CUS-0007", vehicleId: "VEH-0002", branchId: "BR-LM" },
  { customerId: "CUS-0008", vehicleId: "VEH-0012", branchId: "BR-SU" },
  { customerId: "CUS-0009", vehicleId: "VEH-0008", branchId: "BR-LM" },
  { customerId: "CUS-0010", vehicleId: "VEH-0009", branchId: "BR-LM" },
  { customerId: "CUS-0011", vehicleId: "VEH-0010", branchId: "BR-SU" },
  { customerId: "CUS-0012", vehicleId: "VEH-0011", branchId: "BR-SM" },
] as const;

const FALLBACK = {
  customerId: "CUS-0001",
  vehicleId: "VEH-0001",
  branchId: "BR-LM",
};

const TECHNICIANS = ["TEC-0001", "TEC-0002", "TEC-0003"] as const;

const REASONS = [
  "Mantenimiento preventivo",
  "Cambio de aceite y filtros",
  "Revisión del sistema de frenos",
  "Diagnóstico computarizado",
  "Alineamiento y balanceo",
  "Cambio de embrague",
] as const;

const BASE_DATE = Date.parse("2026-02-20T09:00:00.000Z");

const DIAGNOSIS_CODES = [
  "OT-2026-0182",
  "OT-2026-0190",
  "OT-2026-0191",
  "OT-2026-0192",
  "OT-2026-0193",
  "OT-2026-0194",
  "OT-2026-0195",
];

const IN_REPAIR_CODES = [
  "OT-2026-0187",
  "OT-2026-0200",
  "OT-2026-0201",
  "OT-2026-0202",
  "OT-2026-0203",
  "OT-2026-0204",
  "OT-2026-0205",
  "OT-2026-0206",
  "OT-2026-0207",
  "OT-2026-0208",
  "OT-2026-0209",
  "OT-2026-0210",
];

const QUALITY_CODES = [
  "OT-2026-0184",
  "OT-2026-0197",
  "OT-2026-0198",
  "OT-2026-0199",
];

const READY_CODES = [
  "OT-2026-0178",
  "OT-2026-0211",
  "OT-2026-0212",
  "OT-2026-0213",
  "OT-2026-0214",
  "OT-2026-0215",
];

type WorkOrderOverride = {
  customerId?: string;
  vehicleId?: string;
  branchId?: string;
  reason?: string;
  priority?: WorkOrderPriority;
  receptionId?: string;
  notes?: string;
};

const CANONICAL: Record<string, WorkOrderOverride> = {
  "OT-2026-0184": {
    customerId: "CUS-0001",
    vehicleId: "VEH-0001",
    branchId: "BR-LM",
    reason: "Control de calidad final",
    priority: WorkOrderPriority.High,
    receptionId: "RCP-0001",
  },
  "OT-2026-0187": {
    customerId: "CUS-0003",
    vehicleId: "VEH-0005",
    branchId: "BR-LM",
    reason: "Esperando repuesto de frenos",
    priority: WorkOrderPriority.High,
    notes: "Repuesto en tránsito desde el proveedor.",
  },
  "OT-2026-0182": {
    customerId: "CUS-0002",
    vehicleId: "VEH-0004",
    branchId: "BR-SU",
    reason: "Aprobación del cliente",
    priority: WorkOrderPriority.Normal,
  },
  "OT-2026-0178": {
    customerId: "CUS-0004",
    vehicleId: "VEH-0006",
    branchId: "BR-SM",
    reason: "Pago pendiente antes de la entrega",
    priority: WorkOrderPriority.Normal,
  },
};

function isoDaysAgo(days: number): string {
  return new Date(BASE_DATE - days * 86_400_000).toISOString();
}

function build(
  code: string,
  status: WorkOrderStatus,
  index: number,
): WorkOrder {
  const base = POOL[index % POOL.length] ?? FALLBACK;
  const override = CANONICAL[code] ?? {};
  const openedAt = isoDaysAgo(index);
  const technicianId = TECHNICIANS[index % TECHNICIANS.length] ?? "TEC-0001";
  const reason =
    override.reason ?? REASONS[index % REASONS.length] ?? "Servicio general";

  return {
    id: asEntityId(`WO-${code.replace("OT-", "")}`),
    code,
    customerId: asEntityId(override.customerId ?? base.customerId),
    vehicleId: asEntityId(override.vehicleId ?? base.vehicleId),
    branchId: asEntityId(override.branchId ?? base.branchId),
    advisorId: asEntityId("USR-0001"),
    technicianId: asEntityId(technicianId),
    ...(override.receptionId !== undefined
      ? { receptionId: asEntityId(override.receptionId) }
      : {}),
    status,
    priority: override.priority ?? WorkOrderPriority.Normal,
    reason,
    odometerKm: 12_000 + index * 2_500,
    openedAt,
    promisedAt: isoDaysAgo(index - 3),
    ...(override.notes !== undefined ? { notes: override.notes } : {}),
    createdAt: openedAt,
    updatedAt: openedAt,
  };
}

export const workOrderSeed: WorkOrder[] = [
  ...DIAGNOSIS_CODES.map((code, index) =>
    build(code, WorkOrderStatus.Diagnosis, index),
  ),
  ...IN_REPAIR_CODES.map((code, index) =>
    build(code, WorkOrderStatus.InRepair, index + DIAGNOSIS_CODES.length),
  ),
  ...QUALITY_CODES.map((code, index) =>
    build(
      code,
      WorkOrderStatus.Quality,
      index + DIAGNOSIS_CODES.length + IN_REPAIR_CODES.length,
    ),
  ),
  ...READY_CODES.map((code, index) =>
    build(
      code,
      WorkOrderStatus.Ready,
      index +
        DIAGNOSIS_CODES.length +
        IN_REPAIR_CODES.length +
        QUALITY_CODES.length,
    ),
  ),
];

export const DASHBOARD_STATUS_COUNTS: Record<WorkOrderStatus, number> = {
  [WorkOrderStatus.Diagnosis]: DIAGNOSIS_CODES.length,
  [WorkOrderStatus.InRepair]: IN_REPAIR_CODES.length,
  [WorkOrderStatus.Quality]: QUALITY_CODES.length,
  [WorkOrderStatus.Ready]: READY_CODES.length,
  [WorkOrderStatus.Delivered]: 0,
  [WorkOrderStatus.Cancelled]: 0,
};

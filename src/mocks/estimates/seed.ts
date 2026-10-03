import {
  calculateEstimateTotals,
  DEFAULT_IGV_RATE,
  EstimateLineKind,
  EstimateStatus,
  type Estimate,
  type EstimateLine,
} from "@/domain/estimates";
import { asEntityId, money, type Money } from "@/domain/shared";

const SEED_CREATED_AT = "2026-02-18T09:00:00.000Z";
const SEED_UPDATED_AT = "2026-02-20T09:00:00.000Z";

function line(
  id: string,
  kind: EstimateLineKind,
  name: string,
  amount: number,
  quantity = 1,
): EstimateLine {
  return {
    id: asEntityId(id),
    kind,
    name,
    quantity,
    unitPrice: money(amount),
  };
}

type EstimateSeed = {
  id: string;
  code: string;
  customerId: string;
  vehicleId: string;
  status: EstimateStatus;
  lines: EstimateLine[];
  workOrderId?: string;
  globalDiscount?: Money;
  notes?: string;
};

function estimate(seed: EstimateSeed): Estimate {
  const totals = calculateEstimateTotals(seed.lines, {
    ...(seed.globalDiscount !== undefined
      ? { globalDiscount: seed.globalDiscount }
      : {}),
  });

  return {
    id: asEntityId(seed.id),
    code: seed.code,
    ...(seed.workOrderId !== undefined
      ? { workOrderId: asEntityId(seed.workOrderId) }
      : {}),
    customerId: asEntityId(seed.customerId),
    vehicleId: asEntityId(seed.vehicleId),
    status: seed.status,
    lines: seed.lines,
    globalDiscount: seed.globalDiscount ?? money(0),
    igvRate: DEFAULT_IGV_RATE,
    subtotal: totals.subtotal,
    discount: totals.discount,
    igv: totals.igv,
    total: totals.total,
    ...(seed.notes !== undefined ? { notes: seed.notes } : {}),
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  };
}

export const estimateSeed: Estimate[] = [
  estimate({
    id: "EST-0001",
    code: "EST-2026-0001",
    customerId: "CUS-0001",
    vehicleId: "VEH-0001",
    workOrderId: "WO-2026-0184",
    status: EstimateStatus.PendingApproval,
    lines: [
      line(
        "ESTL-0001",
        EstimateLineKind.Labor,
        "Mantenimiento preventivo",
        150000,
      ),
      line("ESTL-0002", EstimateLineKind.Part, "Kit de filtros", 100000),
    ],
    notes: "Incluye cambio de aceite y filtros.",
  }),
  estimate({
    id: "EST-0002",
    code: "EST-2026-0002",
    customerId: "CUS-0005",
    vehicleId: "VEH-0003",
    status: EstimateStatus.PendingApproval,
    lines: [
      line(
        "ESTL-0003",
        EstimateLineKind.Part,
        "Juego de pastillas de freno",
        200000,
      ),
    ],
  }),
  estimate({
    id: "EST-0003",
    code: "EST-2026-0003",
    customerId: "CUS-0003",
    vehicleId: "VEH-0005",
    status: EstimateStatus.PendingApproval,
    lines: [
      line("ESTL-0004", EstimateLineKind.Labor, "Planchado y pintura", 307627),
    ],
    notes: "Pendiente de aprobación del cliente.",
  }),
  estimate({
    id: "EST-0004",
    code: "EST-2026-0004",
    customerId: "CUS-0004",
    vehicleId: "VEH-0006",
    workOrderId: "WO-2026-0178",
    status: EstimateStatus.Approved,
    lines: [
      line(
        "ESTL-0005",
        EstimateLineKind.Labor,
        "Alineamiento y balanceo",
        150000,
      ),
    ],
  }),
  estimate({
    id: "EST-0005",
    code: "EST-2026-0005",
    customerId: "CUS-0002",
    vehicleId: "VEH-0004",
    status: EstimateStatus.Draft,
    lines: [
      line("ESTL-0006", EstimateLineKind.Labor, "Diagnóstico inicial", 50000),
    ],
  }),
  estimate({
    id: "EST-0006",
    code: "EST-2026-0006",
    customerId: "CUS-0006",
    vehicleId: "VEH-0007",
    status: EstimateStatus.Rejected,
    lines: [line("ESTL-0007", EstimateLineKind.Part, "Espejo lateral", 42000)],
  }),
];

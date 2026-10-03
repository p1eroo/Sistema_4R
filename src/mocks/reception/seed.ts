import {
  createReceptionChecklist,
  FuelLevel,
  ReceptionStatus,
  type Reception,
} from "@/domain/reception";
import { asEntityId } from "@/domain/shared";

const SEED_CREATED_AT = "2026-02-12T14:40:00.000Z";
const SEED_UPDATED_AT = "2026-02-12T15:10:00.000Z";

type ReceptionSeed = {
  id: string;
  code: string;
  customerId: string;
  vehicleId: string;
  branchId: string;
  status: ReceptionStatus;
  reason: string;
  odometerKm: number;
  fuelLevel: FuelLevel;
  checked: Parameters<typeof createReceptionChecklist>[0];
  receivedAt?: string;
  observations?: string;
};

function reception(seed: ReceptionSeed): Reception {
  return {
    id: asEntityId(seed.id),
    code: seed.code,
    customerId: asEntityId(seed.customerId),
    vehicleId: asEntityId(seed.vehicleId),
    branchId: asEntityId(seed.branchId),
    advisorId: asEntityId("USR-0001"),
    status: seed.status,
    reason: seed.reason,
    odometerKm: seed.odometerKm,
    fuelLevel: seed.fuelLevel,
    belongings: [],
    checklist: createReceptionChecklist(seed.checked),
    ...(seed.receivedAt !== undefined ? { receivedAt: seed.receivedAt } : {}),
    ...(seed.observations !== undefined
      ? { observations: seed.observations }
      : {}),
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  };
}

export const receptionSeed: Reception[] = [
  reception({
    id: "RCP-0001",
    code: "REC-2026-0001",
    customerId: "CUS-0001",
    vehicleId: "VEH-0001",
    branchId: "BR-LM",
    status: ReceptionStatus.Completed,
    reason: "Mantenimiento preventivo 10,000 km",
    odometerKm: 48250,
    fuelLevel: FuelLevel.Half,
    checked: ["documentos", "llanta_repuesto", "gata_herramientas"],
    receivedAt: "2026-02-12T15:10:00.000Z",
    observations: "Cliente reporta ruido leve en suspensión delantera.",
  }),
  reception({
    id: "RCP-0002",
    code: "REC-2026-0002",
    customerId: "CUS-0005",
    vehicleId: "VEH-0003",
    branchId: "BR-SU",
    status: ReceptionStatus.InProgress,
    reason: "Revisión del sistema de frenos",
    odometerKm: 18900,
    fuelLevel: FuelLevel.Quarter,
    checked: ["documentos", "llanta_repuesto"],
  }),
  reception({
    id: "RCP-0003",
    code: "REC-2026-0003",
    customerId: "CUS-0002",
    vehicleId: "VEH-0004",
    branchId: "BR-SU",
    status: ReceptionStatus.Draft,
    reason: "Diagnóstico por testigo de motor",
    odometerKm: 0,
    fuelLevel: FuelLevel.Empty,
    checked: [],
  }),
];

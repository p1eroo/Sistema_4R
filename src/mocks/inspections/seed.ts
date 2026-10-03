import {
  createInspectionChecklist,
  DamageSeverity,
  InspectionStatus,
  type Inspection,
} from "@/domain/inspections";
import { asEntityId } from "@/domain/shared";

const SEED_CREATED_AT = "2026-02-12T15:20:00.000Z";
const SEED_UPDATED_AT = "2026-02-12T16:05:00.000Z";

export const inspectionSeed: Inspection[] = [
  {
    id: asEntityId("INSP-0001"),
    receptionId: asEntityId("RCP-0001"),
    vehicleId: asEntityId("VEH-0001"),
    status: InspectionStatus.Completed,
    damagePoints: [
      {
        id: asEntityId("DMP-0001"),
        zoneId: "front-bumper",
        severity: DamageSeverity.Minor,
        notes: "Rayón superficial en la esquina derecha.",
        photos: ["https://picsum.photos/seed/dmp-0001/400/300"],
      },
      {
        id: asEntityId("DMP-0002"),
        zoneId: "left-front-door",
        severity: DamageSeverity.Moderate,
        notes: "Abolladura pequeña sin afectar pintura.",
        photos: ["https://picsum.photos/seed/dmp-0002/400/300"],
      },
    ],
    checklist: createInspectionChecklist([
      "luces",
      "llantas",
      "frenos",
      "aceite",
    ]),
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("INSP-0002"),
    receptionId: asEntityId("RCP-0002"),
    vehicleId: asEntityId("VEH-0003"),
    status: InspectionStatus.InProgress,
    damagePoints: [
      {
        id: asEntityId("DMP-0003"),
        zoneId: "right-rear-door",
        severity: DamageSeverity.Minor,
        photos: [],
      },
    ],
    checklist: createInspectionChecklist(["luces", "llantas"]),
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
];

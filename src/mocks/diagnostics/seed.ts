import {
  DiagnosticSeverity,
  DiagnosticStatus,
  type Diagnostic,
} from "@/domain/diagnostics";
import { asEntityId } from "@/domain/shared";

const SEED_CREATED_AT = "2026-02-20T10:00:00.000Z";
const SEED_UPDATED_AT = "2026-02-20T11:30:00.000Z";

export const diagnosticSeed: Diagnostic[] = [
  {
    id: asEntityId("DGN-0001"),
    workOrderId: asEntityId("WO-2026-0182"),
    technicianId: asEntityId("TEC-0001"),
    status: DiagnosticStatus.Completed,
    summary: "Ruido en la suspensión delantera al pasar rompemuelles.",
    findings: [
      {
        id: asEntityId("DGF-0001"),
        title: "Buje de horquilla desgastado",
        description: "Juego excesivo en el buje del brazo inferior izquierdo.",
        severity: DiagnosticSeverity.Medium,
        recommendation: "Reemplazar el juego de bujes delanteros.",
      },
      {
        id: asEntityId("DGF-0002"),
        code: "C1234",
        title: "Amortiguador con fuga leve",
        severity: DiagnosticSeverity.Low,
        recommendation: "Monitorear en el próximo mantenimiento.",
      },
    ],
    recommendation: "Cambio de bujes y revisión de amortiguadores.",
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("DGN-0002"),
    workOrderId: asEntityId("WO-2026-0190"),
    technicianId: asEntityId("TEC-0002"),
    status: DiagnosticStatus.Draft,
    summary: "Consumo elevado de combustible reportado por el cliente.",
    findings: [
      {
        id: asEntityId("DGF-0003"),
        code: "P0171",
        title: "Mezcla pobre en banco 1",
        severity: DiagnosticSeverity.High,
        recommendation: "Revisar sensor MAF y fugas de vacío.",
      },
    ],
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("DGN-0003"),
    workOrderId: asEntityId("WO-2026-0191"),
    technicianId: asEntityId("TEC-0003"),
    status: DiagnosticStatus.Completed,
    summary: "Testigo de motor encendido de forma intermitente.",
    findings: [
      {
        id: asEntityId("DGF-0004"),
        code: "P0300",
        title: "Falla de encendido aleatoria",
        severity: DiagnosticSeverity.Medium,
        recommendation: "Cambiar bujías y revisar bobinas.",
      },
    ],
    recommendation: "Mantenimiento de encendido.",
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
];

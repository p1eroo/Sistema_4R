import { beforeEach, describe, expect, it } from "vitest";

import { DiagnosticSeverity, DiagnosticStatus } from "@/domain/diagnostics";
import { asEntityId } from "@/domain/shared";
import {
  DiagnosticValidationError,
  createDiagnosticService,
  type DiagnosticService,
} from "@/mocks/diagnostics/service";

let service: DiagnosticService;

beforeEach(() => {
  service = createDiagnosticService();
});

describe("diagnosticService reads", () => {
  it("has a diagnostic for a work order in diagnosis", async () => {
    const diagnostic = await service.getByWorkOrder(asEntityId("WO-2026-0182"));

    expect(diagnostic?.id).toBe("DGN-0001");
    expect(diagnostic?.findings).toHaveLength(2);
  });

  it("lists the seeded diagnostics", async () => {
    const result = await service.list();

    expect(result.pagination.total).toBe(3);
  });
});

describe("diagnosticService.upsert", () => {
  it("creates a diagnostic with generated finding ids", async () => {
    const created = await service.upsert({
      workOrderId: asEntityId("WO-2026-0192"),
      technicianId: asEntityId("TEC-0001"),
      summary: "Frenado irregular",
      findings: [
        {
          title: "Disco rayado",
          severity: DiagnosticSeverity.Medium,
        },
      ],
    });

    expect(created.status).toBe(DiagnosticStatus.Draft);
    expect(created.findings[0]?.id).toBe("DGF-0005");
  });

  it("updates the existing diagnostic of a work order", async () => {
    const updated = await service.upsert({
      workOrderId: asEntityId("WO-2026-0182"),
      status: DiagnosticStatus.Reviewed,
      summary: "Suspensión delantera revisada",
      findings: [
        {
          id: asEntityId("DGF-0001"),
          title: "Buje reemplazado",
          severity: DiagnosticSeverity.Low,
        },
      ],
    });

    expect(updated.id).toBe("DGN-0001");
    expect(updated.status).toBe(DiagnosticStatus.Reviewed);
    expect(updated.findings).toHaveLength(1);
  });

  it("rejects a diagnostic without findings", async () => {
    await expect(
      service.upsert({
        workOrderId: asEntityId("WO-2026-0193"),
        summary: "Sin hallazgos",
        findings: [],
      }),
    ).rejects.toBeInstanceOf(DiagnosticValidationError);
  });
});

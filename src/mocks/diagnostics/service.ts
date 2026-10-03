import { z, type ZodType } from "zod";

import {
  DiagnosticStatus,
  type Diagnostic,
  type DiagnosticFinding,
} from "@/domain/diagnostics";
import {
  diagnosticCreateSchema,
  type DiagnosticCreateValues,
} from "@/domain/diagnostics/schemas";
import { asEntityId, nowIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { diagnosticSeed } from "@/mocks/diagnostics/seed";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

export class DiagnosticNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró el diagnóstico ${id}.`);
    this.name = "DiagnosticNotFoundError";
  }
}

export class DiagnosticValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "Los datos del diagnóstico no son válidos.");
    this.name = "DiagnosticValidationError";
    this.issues = issues;
  }
}

export type DiagnosticService = {
  list(query?: ListQuery): Promise<ListResult<Diagnostic>>;
  getById(id: EntityId): Promise<Diagnostic | undefined>;
  getByWorkOrder(workOrderId: EntityId): Promise<Diagnostic | undefined>;
  upsert(input: DiagnosticCreateValues): Promise<Diagnostic>;
};

const SORT_SELECTORS = {
  updatedAt: (diagnostic: Diagnostic) => diagnostic.updatedAt,
  status: (diagnostic: Diagnostic) => diagnostic.status,
};

function parseOrThrow<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new DiagnosticValidationError(
      result.error.issues.map((issue) => issue.message),
    );
  }

  return result.data;
}

function normalizeFindings(
  findings: DiagnosticCreateValues["findings"],
  existing: readonly Diagnostic[],
): DiagnosticFinding[] {
  let sequence = existing
    .flatMap((diagnostic) => diagnostic.findings)
    .reduce((acc, finding) => {
      const value = /^DGF-(\d+)$/.exec(finding.id)?.[1];
      return value ? Math.max(acc, Number(value)) : acc;
    }, 0);

  return findings.map((finding) => {
    const id =
      finding.id ??
      asEntityId(`DGF-${String((sequence += 1)).padStart(4, "0")}`);
    return {
      id,
      ...(finding.code !== undefined ? { code: finding.code } : {}),
      title: finding.title,
      ...(finding.description !== undefined
        ? { description: finding.description }
        : {}),
      severity: finding.severity,
      ...(finding.recommendation !== undefined
        ? { recommendation: finding.recommendation }
        : {}),
    };
  });
}

export function createDiagnosticService(
  repository: InMemoryRepository<Diagnostic> = createInMemoryRepository<Diagnostic>(
    { seed: diagnosticSeed, idPrefix: "DGN" },
  ),
): DiagnosticService {
  return {
    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields: ["id", "summary", "status"],
        sortSelectors: SORT_SELECTORS,
      });
    },

    getById(id: EntityId) {
      return repository.getById(id);
    },

    async getByWorkOrder(workOrderId: EntityId) {
      const all = await repository.getAll();
      return all.find((diagnostic) => diagnostic.workOrderId === workOrderId);
    },

    async upsert(input: DiagnosticCreateValues) {
      const values = parseOrThrow(diagnosticCreateSchema, input);
      const all = await repository.getAll();
      const existing = all.find(
        (diagnostic) => diagnostic.workOrderId === values.workOrderId,
      );
      const findings = normalizeFindings(values.findings, all);
      const now = nowIso();

      if (existing) {
        return repository.update(existing.id, {
          ...(values.technicianId !== undefined
            ? { technicianId: values.technicianId }
            : {}),
          status: values.status ?? existing.status,
          summary: values.summary,
          findings,
          ...(values.recommendation !== undefined
            ? { recommendation: values.recommendation }
            : {}),
          updatedAt: now,
        });
      }

      return repository.create({
        workOrderId: values.workOrderId,
        ...(values.technicianId !== undefined
          ? { technicianId: values.technicianId }
          : {}),
        status: values.status ?? DiagnosticStatus.Draft,
        summary: values.summary,
        findings,
        ...(values.recommendation !== undefined
          ? { recommendation: values.recommendation }
          : {}),
        createdAt: now,
        updatedAt: now,
      });
    },
  };
}

export const diagnosticService: DiagnosticService = createDiagnosticService();

import { z, type ZodType } from "zod";

import {
  appointmentDateKey,
  AppointmentStatus,
  type Appointment,
} from "@/domain/appointments";
import {
  appointmentCreateSchema,
  appointmentUpdateSchema,
  type AppointmentCreateValues,
  type AppointmentUpdateValues,
} from "@/domain/appointments/schemas";
import { nowIso, type DateTimeIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { includesQuery, paginate, sortBy } from "@/lib/list-query";
import { appointmentSeed } from "@/mocks/appointments/seed";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

export class AppointmentNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró la cita ${id}.`);
    this.name = "AppointmentNotFoundError";
  }
}

export class AppointmentValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "Los datos de la cita no son válidos.");
    this.name = "AppointmentValidationError";
    this.issues = issues;
  }
}

export type AppointmentService = {
  list(query?: ListQuery): Promise<ListResult<Appointment>>;
  listByDate(
    date: string | Date,
    query?: ListQuery,
  ): Promise<ListResult<Appointment>>;
  getById(id: EntityId): Promise<Appointment | undefined>;
  create(input: AppointmentCreateValues): Promise<Appointment>;
  update(id: EntityId, input: AppointmentUpdateValues): Promise<Appointment>;
  cancel(id: EntityId): Promise<Appointment>;
};

const SEARCH_FIELDS: readonly (keyof Appointment)[] = ["id", "status"];

const SORT_SELECTORS = {
  scheduledAt: (appointment: Appointment) => appointment.scheduledAt,
  status: (appointment: Appointment) => appointment.status,
  id: (appointment: Appointment) => appointment.id,
};

function parseOrThrow<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new AppointmentValidationError(
      result.error.issues.map((issue) => issue.message),
    );
  }

  return result.data;
}

function buildUpdatePatch(
  values: AppointmentUpdateValues,
  now: DateTimeIso,
): Partial<Omit<Appointment, "id">> {
  return {
    ...(values.customerId !== undefined
      ? { customerId: values.customerId }
      : {}),
    ...(values.vehicleId !== undefined ? { vehicleId: values.vehicleId } : {}),
    ...(values.branchId !== undefined ? { branchId: values.branchId } : {}),
    ...(values.advisorId !== undefined ? { advisorId: values.advisorId } : {}),
    ...(values.scheduledAt !== undefined
      ? { scheduledAt: values.scheduledAt }
      : {}),
    ...(values.durationMinutes !== undefined
      ? { durationMinutes: values.durationMinutes }
      : {}),
    ...(values.serviceType !== undefined
      ? { serviceType: values.serviceType }
      : {}),
    ...(values.notes !== undefined ? { notes: values.notes } : {}),
    updatedAt: now,
  };
}

function sortAppointments(
  appointments: readonly Appointment[],
  query: ListQuery,
): readonly Appointment[] {
  const sortKey = query.sortBy;
  if (!sortKey) {
    return sortBy(appointments, SORT_SELECTORS.scheduledAt);
  }

  const selector = SORT_SELECTORS[sortKey as keyof typeof SORT_SELECTORS];
  return selector
    ? sortBy(appointments, selector, query.sortDir ?? "asc")
    : appointments;
}

export function createAppointmentService(
  repository: InMemoryRepository<Appointment> = createInMemoryRepository<Appointment>(
    { seed: appointmentSeed, idPrefix: "APP" },
  ),
): AppointmentService {
  return {
    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields: SEARCH_FIELDS,
        sortSelectors: SORT_SELECTORS,
      });
    },

    async listByDate(date: string | Date, query: ListQuery = {}) {
      const dateKey =
        typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
          ? date
          : appointmentDateKey(date);
      const all = await repository.getAll();
      let result: readonly Appointment[] = all.filter(
        (appointment) =>
          appointmentDateKey(appointment.scheduledAt) === dateKey,
      );

      const search = query.search;
      if (search) {
        result = result.filter((appointment) =>
          includesQuery(appointment, search, SEARCH_FIELDS),
        );
      }

      return paginate(
        sortAppointments(result, query),
        query.page,
        query.pageSize,
      );
    },

    getById(id: EntityId) {
      return repository.getById(id);
    },

    async create(input: AppointmentCreateValues) {
      const values = parseOrThrow(appointmentCreateSchema, input);
      const now = nowIso();

      return repository.create({
        customerId: values.customerId,
        vehicleId: values.vehicleId,
        branchId: values.branchId,
        ...(values.advisorId !== undefined
          ? { advisorId: values.advisorId }
          : {}),
        scheduledAt: values.scheduledAt,
        durationMinutes: values.durationMinutes,
        serviceType: values.serviceType,
        status: AppointmentStatus.Scheduled,
        ...(values.notes !== undefined ? { notes: values.notes } : {}),
        createdAt: now,
        updatedAt: now,
      });
    },

    async update(id: EntityId, input: AppointmentUpdateValues) {
      const values = parseOrThrow(appointmentUpdateSchema, input);
      const current = await repository.getById(id);
      if (!current) {
        throw new AppointmentNotFoundError(id);
      }

      return repository.update(id, buildUpdatePatch(values, nowIso()));
    },

    async cancel(id: EntityId) {
      const current = await repository.getById(id);
      if (!current) {
        throw new AppointmentNotFoundError(id);
      }

      return repository.update(id, {
        status: AppointmentStatus.Cancelled,
        updatedAt: nowIso(),
      });
    },
  };
}

export const appointmentService: AppointmentService =
  createAppointmentService();

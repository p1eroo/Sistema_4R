import type { ZodType } from "zod";

import { nowIso, type DateTimeIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import {
  vehicleCreateSchema,
  vehicleUpdateSchema,
  type VehicleCreateValues,
  type VehicleUpdateValues,
} from "@/domain/vehicles/schemas";
import { VehicleStatus, type Vehicle } from "@/domain/vehicles/types";
import { includesQuery, paginate, sortBy } from "@/lib/list-query";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";
import { vehicleSeed } from "@/mocks/vehicles/seed";

export class VehicleNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró el vehículo ${id}.`);
    this.name = "VehicleNotFoundError";
  }
}

export class VehicleValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "Los datos del vehículo no son válidos.");
    this.name = "VehicleValidationError";
    this.issues = issues;
  }
}

export type VehicleService = {
  list(query?: ListQuery): Promise<ListResult<Vehicle>>;
  getById(id: EntityId): Promise<Vehicle | undefined>;
  getByPlate(plate: string): Promise<Vehicle | undefined>;
  listByCustomer(
    customerId: EntityId,
    query?: ListQuery,
  ): Promise<ListResult<Vehicle>>;
  create(input: VehicleCreateValues): Promise<Vehicle>;
  update(id: EntityId, input: VehicleUpdateValues): Promise<Vehicle>;
};

const SEARCH_FIELDS: readonly (keyof Vehicle)[] = [
  "plate",
  "brand",
  "model",
  "vin",
];

const SORT_SELECTORS = {
  plate: (vehicle: Vehicle) => vehicle.plate,
  brand: (vehicle: Vehicle) => vehicle.brand,
  year: (vehicle: Vehicle) => vehicle.year,
  createdAt: (vehicle: Vehicle) => vehicle.createdAt,
};

function parseOrThrow<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new VehicleValidationError(
      result.error.issues.map((issue) => issue.message),
    );
  }

  return result.data;
}

function normalizePlate(plate: string): string {
  return plate.trim().toUpperCase();
}

function buildCreatePayload(
  values: VehicleCreateValues,
  now: DateTimeIso,
): Omit<Vehicle, "id"> {
  return {
    customerId: values.customerId,
    plate: values.plate,
    brand: values.brand,
    model: values.model,
    year: values.year,
    color: values.color,
    fuelType: values.fuelType,
    odometerKm: values.odometerKm,
    ...(values.vin !== undefined ? { vin: values.vin } : {}),
    ...(values.usualBranch !== undefined
      ? { usualBranch: values.usualBranch }
      : {}),
    status: VehicleStatus.Active,
    ...(values.notes !== undefined ? { notes: values.notes } : {}),
    createdAt: now,
    updatedAt: now,
  };
}

function buildUpdatePatch(
  values: VehicleUpdateValues,
  now: DateTimeIso,
): Partial<Omit<Vehicle, "id">> {
  return {
    ...(values.customerId !== undefined
      ? { customerId: values.customerId }
      : {}),
    ...(values.plate !== undefined ? { plate: values.plate } : {}),
    ...(values.brand !== undefined ? { brand: values.brand } : {}),
    ...(values.model !== undefined ? { model: values.model } : {}),
    ...(values.year !== undefined ? { year: values.year } : {}),
    ...(values.color !== undefined ? { color: values.color } : {}),
    ...(values.fuelType !== undefined ? { fuelType: values.fuelType } : {}),
    ...(values.odometerKm !== undefined
      ? { odometerKm: values.odometerKm }
      : {}),
    ...(values.vin !== undefined ? { vin: values.vin } : {}),
    ...(values.usualBranch !== undefined
      ? { usualBranch: values.usualBranch }
      : {}),
    ...(values.notes !== undefined ? { notes: values.notes } : {}),
    updatedAt: now,
  };
}

export function createVehicleService(
  repository: InMemoryRepository<Vehicle> = createInMemoryRepository<Vehicle>({
    seed: vehicleSeed,
    idPrefix: "VEH",
  }),
): VehicleService {
  async function findByPlate(plate: string): Promise<Vehicle | undefined> {
    const normalized = normalizePlate(plate);
    const all = await repository.getAll();
    return all.find((vehicle) => normalizePlate(vehicle.plate) === normalized);
  }

  async function assertPlateAvailable(
    plate: string,
    ignoreId?: EntityId,
  ): Promise<void> {
    const conflict = await findByPlate(plate);
    if (conflict && conflict.id !== ignoreId) {
      throw new VehicleValidationError([
        `Ya existe un vehículo con la placa ${normalizePlate(plate)}.`,
      ]);
    }
  }

  return {
    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields: SEARCH_FIELDS,
        sortSelectors: SORT_SELECTORS,
      });
    },

    getById(id: EntityId) {
      return repository.getById(id);
    },

    getByPlate(plate: string) {
      return findByPlate(plate);
    },

    async listByCustomer(customerId: EntityId, query: ListQuery = {}) {
      const all = await repository.getAll();
      let result: readonly Vehicle[] = all.filter(
        (vehicle) => vehicle.customerId === customerId,
      );

      const search = query.search;
      if (search) {
        result = result.filter((vehicle) =>
          includesQuery(vehicle, search, SEARCH_FIELDS),
        );
      }

      const sortKey = query.sortBy;
      if (sortKey) {
        const selector = SORT_SELECTORS[sortKey as keyof typeof SORT_SELECTORS];
        if (selector) {
          result = sortBy(result, selector, query.sortDir ?? "asc");
        }
      }

      return paginate(result, query.page, query.pageSize);
    },

    async create(input: VehicleCreateValues) {
      const values = parseOrThrow(vehicleCreateSchema, input);
      await assertPlateAvailable(values.plate);
      return repository.create(buildCreatePayload(values, nowIso()));
    },

    async update(id: EntityId, input: VehicleUpdateValues) {
      const values = parseOrThrow(vehicleUpdateSchema, input);
      const current = await repository.getById(id);
      if (!current) {
        throw new VehicleNotFoundError(id);
      }

      if (values.plate !== undefined) {
        await assertPlateAvailable(values.plate, id);
      }

      return repository.update(id, buildUpdatePatch(values, nowIso()));
    },
  };
}

export const vehicleService: VehicleService = createVehicleService();

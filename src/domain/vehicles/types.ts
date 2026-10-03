import type { BranchRef, DateTimeIso, EntityId } from "@/domain/shared";

export enum FuelType {
  Gasolina = "gasolina",
  Diesel = "diesel",
  GNV = "gnv",
  GLP = "glp",
  Hibrido = "hibrido",
  Electrico = "electrico",
}

export enum VehicleStatus {
  Active = "active",
  Inactive = "inactive",
  Archived = "archived",
}

export type Vehicle = {
  readonly id: EntityId;
  readonly customerId: EntityId;
  readonly plate: string;
  readonly brand: string;
  readonly model: string;
  readonly year: number;
  readonly color: string;
  readonly fuelType: FuelType;
  readonly odometerKm: number;
  readonly vin?: string | undefined;
  readonly usualBranch?: BranchRef | undefined;
  readonly status: VehicleStatus;
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export type VehicleListItem = {
  readonly id: EntityId;
  readonly plate: string;
  readonly brand: string;
  readonly model: string;
  readonly year: number;
  readonly color: string;
  readonly customerId: EntityId;
  readonly customerName: string;
  readonly odometerKm: number;
  readonly status: VehicleStatus;
};

export type VehicleLabelParts = {
  readonly brand: string;
  readonly model: string;
  readonly year: number;
  readonly plate: string;
};

export function vehicleDisplayName(vehicle: VehicleLabelParts): string {
  return `${vehicle.brand} ${vehicle.model} ${vehicle.year} · ${vehicle.plate}`;
}

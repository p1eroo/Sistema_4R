import type { EntityId } from "@/domain/shared/ids";

export enum BranchStatus {
  Active = "active",
  Inactive = "inactive",
}

export enum RecordStatus {
  Active = "active",
  Archived = "archived",
}

export type BranchRef = {
  readonly id: EntityId;
  readonly name: string;
};

export type UserRef = {
  readonly id: EntityId;
  readonly fullName: string;
};

export type DateTimeIso = string;

export function nowIso(): DateTimeIso {
  return new Date().toISOString();
}

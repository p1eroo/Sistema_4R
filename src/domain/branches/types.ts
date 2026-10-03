import type { BranchStatus, DateTimeIso, EntityId } from "@/domain/shared";

export type Branch = {
  readonly id: EntityId;
  readonly slug: string;
  readonly name: string;
  readonly address: string;
  readonly phone: string;
  readonly status: BranchStatus;
  readonly isDefault: boolean;
  readonly capacity: number;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export type BranchListItem = {
  readonly id: EntityId;
  readonly slug: string;
  readonly name: string;
  readonly status: BranchStatus;
  readonly isDefault: boolean;
  readonly capacity: number;
};

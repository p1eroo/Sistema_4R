import type { DateTimeIso, EntityId } from "@/domain/shared";

export const PERMISSIONS = [
  "workshop.view",
  "workshop.manage",
  "pos.view",
  "pos.sell",
  "inventory.view",
  "inventory.manage",
  "purchases.view",
  "purchases.manage",
  "customers.view",
  "customers.manage",
  "reports.view",
  "users.view",
  "users.manage",
  "settings.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  "workshop.view": "Ver taller",
  "workshop.manage": "Gestionar taller",
  "pos.view": "Ver POS",
  "pos.sell": "Cobrar en POS",
  "inventory.view": "Ver inventario",
  "inventory.manage": "Gestionar inventario",
  "purchases.view": "Ver compras",
  "purchases.manage": "Gestionar compras",
  "customers.view": "Ver clientes",
  "customers.manage": "Gestionar clientes",
  "reports.view": "Ver reportes",
  "users.view": "Ver usuarios",
  "users.manage": "Gestionar usuarios",
  "settings.manage": "Gestionar configuración",
};

export enum UserStatus {
  Active = "active",
  Inactive = "inactive",
  Suspended = "suspended",
}

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.Active]: "Activo",
  [UserStatus.Inactive]: "Inactivo",
  [UserStatus.Suspended]: "Suspendido",
};

export type Role = {
  readonly id: EntityId;
  readonly code: string;
  readonly name: string;
  readonly description?: string | undefined;
  readonly permissions: readonly Permission[];
};

export type User = {
  readonly id: EntityId;
  readonly fullName: string;
  readonly email: string;
  readonly phone?: string | undefined;
  readonly roleIds: readonly EntityId[];
  readonly branchIds: readonly EntityId[];
  readonly status: UserStatus;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export function roleCodesForUser(
  user: Pick<User, "roleIds">,
  roles: readonly Role[],
): string[] {
  return roles
    .filter((role) => user.roleIds.includes(role.id))
    .map((role) => role.code);
}

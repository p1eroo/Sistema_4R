import type { EntityId } from "@/domain/shared";
import type { Permission, Role, User } from "@/domain/identity/types";

export function permissionsForRoles(
  roleIds: readonly EntityId[],
  roles: readonly Role[],
): Set<Permission> {
  const permissions = new Set<Permission>();

  for (const role of roles) {
    if (!roleIds.includes(role.id)) {
      continue;
    }
    for (const permission of role.permissions) {
      permissions.add(permission);
    }
  }

  return permissions;
}

export function can(
  user: Pick<User, "roleIds">,
  permission: Permission,
  roles: readonly Role[],
): boolean {
  return permissionsForRoles(user.roleIds, roles).has(permission);
}

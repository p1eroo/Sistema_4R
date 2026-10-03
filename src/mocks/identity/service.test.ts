import { describe, expect, it } from "vitest";

import { asEntityId } from "@/domain/shared";
import { can } from "@/lib/can";
import { createIdentityService } from "@/mocks/identity/service";

describe("identityService.setRolePermission", () => {
  it("updates role permissions used by can()", async () => {
    const service = createIdentityService();
    const rolesBefore = await service.listRoles();
    const advisor = rolesBefore.find((role) => role.code === "advisor");
    expect(advisor).toBeDefined();

    const user = await service.getUserById(asEntityId("USR-0002"));
    expect(user).toBeDefined();
    expect(can(user!, "settings.manage", rolesBefore)).toBe(false);

    await service.setRolePermission(advisor!.id, "settings.manage", true);

    const rolesAfter = await service.listRoles();
    expect(can(user!, "settings.manage", rolesAfter)).toBe(true);
  });
});

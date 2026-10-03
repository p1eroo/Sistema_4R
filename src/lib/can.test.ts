import { describe, expect, it } from "vitest";

import { can, permissionsForRoles } from "@/lib/can";
import { roleSeed, userSeed } from "@/mocks/identity/seed";

function userById(id: string) {
  const user = userSeed.find((item) => item.id === id);
  if (!user) {
    throw new Error(`seed sin usuario ${id}`);
  }
  return user;
}

describe("can", () => {
  it("grants admin permissions to Carlos Mendoza", () => {
    const carlos = userById("USR-0001");

    expect(can(carlos, "settings.manage", roleSeed)).toBe(true);
    expect(can(carlos, "users.manage", roleSeed)).toBe(true);
  });

  it("does not let an advisor manage users", () => {
    const ana = userById("USR-0002");

    expect(can(ana, "workshop.manage", roleSeed)).toBe(true);
    expect(can(ana, "users.manage", roleSeed)).toBe(false);
    expect(can(ana, "settings.manage", roleSeed)).toBe(false);
  });

  it("limits a technician and a cashier", () => {
    const luis = userById("USR-0003");
    const elena = userById("USR-0004");

    expect(can(luis, "workshop.manage", roleSeed)).toBe(true);
    expect(can(luis, "pos.sell", roleSeed)).toBe(false);

    expect(can(elena, "pos.sell", roleSeed)).toBe(true);
    expect(can(elena, "workshop.manage", roleSeed)).toBe(false);
  });
});

describe("permissionsForRoles", () => {
  it("merges permissions of the assigned roles", () => {
    const luis = userById("USR-0003");
    const permissions = permissionsForRoles(luis.roleIds, roleSeed);

    expect(permissions.has("inventory.view")).toBe(true);
    expect(permissions.has("settings.manage")).toBe(false);
  });
});

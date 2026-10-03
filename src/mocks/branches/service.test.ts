import { describe, expect, it } from "vitest";

import { BranchStatus } from "@/domain/shared";
import { asEntityId } from "@/domain/shared";
import {
  BranchNotFoundError,
  createBranchService,
} from "@/mocks/branches/service";

describe("branchService", () => {
  it("lists the three branches", async () => {
    const result = await createBranchService().list();

    expect(result.pagination.total).toBe(3);
  });

  it("returns La Molina as the default branch", async () => {
    const service = createBranchService();
    const branch = await service.getDefault();

    expect(branch?.id).toBe("BR-LM");
    expect(branch?.name).toBe("Sede La Molina");
    expect(branch?.status).toBe(BranchStatus.Active);
  });

  it("finds a branch by slug", async () => {
    const branch = await createBranchService().getBySlug("surco");

    expect(branch?.id).toBe("BR-SU");
  });

  it("updates a branch and rejects unknown ids", async () => {
    const service = createBranchService();
    const updated = await service.update(asEntityId("BR-SM"), {
      capacity: 12,
    });

    expect(updated.capacity).toBe(12);

    await expect(
      service.update(asEntityId("BR-XX"), { capacity: 1 }),
    ).rejects.toBeInstanceOf(BranchNotFoundError);
  });
});
